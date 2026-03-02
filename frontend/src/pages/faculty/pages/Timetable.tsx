import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Download, Calendar as CalendarIcon, Clock, Loader2, UserX } from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
];

// Helper to convert 24-hour to 12-hour format for display
const formatTimeForDisplay = (time24: string): string => {
  const hour = parseInt(time24.split(':')[0], 10);
  if (hour === 9) return "9:00 AM";
  if (hour === 10) return "10:00 AM";
  if (hour === 11) return "11:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour === 13) return "1:00 PM";
  if (hour === 14) return "2:00 PM";
  if (hour === 15) return "3:00 PM";
  if (hour === 16) return "4:00 PM";
  if (hour === 17) return "5:00 PM";
  return time24;
};

interface ClassSlot {
  id: number;
  subject: string;
  section: string;
  room: string;
  type: "lecture" | "lab" | "tutorial";
}

type TimetableData = {
  [key: string]: {
    [key: string]: ClassSlot[];
  };
};

const typeStyles = {
  lecture: "bg-primary/10 border-primary/30 hover:bg-primary/20",
  lab: "bg-secondary/10 border-secondary/30 hover:bg-secondary/20",
  tutorial: "bg-warning/10 border-warning/30 hover:bg-warning/20",
};

const typeColors = {
  lecture: "text-primary",
  lab: "text-secondary",
  tutorial: "text-warning",
};

export default function Timetable() {
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const { user, authToken } = useAuth();
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);
  const [departmentFaculties, setDepartmentFaculties] = useState<any[]>([]);
  const [assignedSubstitutions, setAssignedSubstitutions] = useState<any[]>([]);

  // Substitution Request State
  const [isSubstituteDialogOpen, setIsSubstituteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot & { day: string, time: string } | null>(null);
  const [substituteDate, setSubstituteDate] = useState<string>("");
  const [substituteId, setSubstituteId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTimetable();
    fetchDepartmentFaculties();
    fetchAssignedSubstitutions();
  }, []);

  const fetchAssignedSubstitutions = async () => {
    try {
      const response = await fetch('/api/v1/faculty/timetable/alterations');
      const data = await response.json();
      if (data.success) {
        // Filter for alterations where this faculty is the new_faculty (substitute) and it's approved
        // We can just show all where they are new_faculty for now, maybe filter by status later
        // This depends on how the backend returns data. If our user is the substitute, they should see it.
        // Let's just trust the backend returns relevant ones + we can display them.
        setAssignedSubstitutions(data.data.filter((alt: any) => alt.new_faculty_id)); // Basic fallback filter
      }
    } catch (e) {
      console.error(e);
    }
  }

  const fetchDepartmentFaculties = async () => {
    try {
      const response = await fetch('/api/v1/faculty');
      const data = await response.json();
      if (data.success && data.data) {
        setDepartmentFaculties(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };


  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/faculty/me/timetable');
      const data = await response.json();

      if (data.success) {
        console.log("API Response - Total slots:", data.data.length);
        console.log("API Response - Sample slot:", data.data[0]);
        
        // Create a lookup map for O(1) access instead of searching arrays
        const timetableMap: { [key: string]: any } = {};

        data.data.forEach((slot: any) => {
          // Normalize start time: support formats like "09:00-10:00" or "09:00:00"
          const rawTime = slot.start_time || slot.time || '';
          let startTime = '';
          
          if (rawTime.includes('-')) {
            // Format: "09:00-10:00"
            startTime = rawTime.split('-')[0].trim();
          } else if (rawTime.includes(':')) {
            // Format: "09:00:00" or "09:00"
            // Ensure we always get HH:MM format (24-hour)
            startTime = rawTime.substring(0, 5).trim();
          }
          
          // Normalize day to lowercase for consistent matching
          const dayKey = slot.day ? slot.day.toLowerCase().trim() : '';
          const key = `${dayKey}_${startTime}`;
          
          timetableMap[key] = {
            id: slot.id,
            subject: slot.subject ? slot.subject.name : 'Unknown',
            section: slot.class ? slot.class.name : '',
            room: slot.room || 'TBA',
            type: slot.type
          };
        });

        console.log("Timetable Map keys:", Object.keys(timetableMap));

        // Store both the map and raw data for rendering
        const formattedData: TimetableData = {
          Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {}, Saturday: {}
        };

        // Initialize all day/time combinations with empty arrays
        days.forEach(day => {
          timeSlots.forEach(time => {
            formattedData[day][time] = [];
          });
        });

        // Populate the formatted data from the map
        // Use exact matching with lowercase day and 24-hour time format
        Object.entries(timetableMap).forEach(([key, slot]: [string, any]) => {
          const [dayKey, timeStr] = key.split('_');
          
          // Find the matching day (case-insensitive)
          const day = days.find(d => d.toLowerCase() === dayKey);
          
          // Use exact 24-hour time format match
          const timeSlot = timeSlots.find(t => t === timeStr);

          if (day && timeSlot && formattedData[day] && formattedData[day][timeSlot]) {
            formattedData[day][timeSlot].push(slot);
          }
        });

        console.log("Formatted Data - Monday 09:00:", formattedData['Monday']?.['09:00']);
        setTimetableData(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
      toast.error('Failed to load your timetable');
    } finally {
      setLoading(false);
    }
  };

  const openSubstituteDialog = (day: string, time: string, slot: ClassSlot) => {
    setSelectedSlot({ ...slot, day, time });

    // Auto-calculate a future date matching the day of the week
    const now = new Date();
    const dayIndex = ["Sunday", ...days].indexOf(day);
    let targetDate = new Date();
    targetDate.setDate(now.getDate() + (dayIndex + 7 - now.getDay()) % 7);
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 7); // Next week
    }

    setSubstituteDate(targetDate.toISOString().split('T')[0]);
    setIsSubstituteDialogOpen(true);
  };

  const handleSubstituteSubmit = async () => {
    if (!substituteDate || !substituteId || !reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get user's faculty_id - user.id should be the faculty_id for faculty users
      const currentFacultyId = user?.id ? parseInt(user.id, 10) : 0;
      const currentSemester = user?.semester || 1;
      
      const reqData = {
        semester: currentSemester,
        slot_id: selectedSlot?.id,
        old_faculty_id: currentFacultyId,
        new_faculty_id: substituteId,
        reason: reason,
        proposed_date: substituteDate
      };

      // Get auth token
      const token = authToken || localStorage.getItem('authToken');
      
      const response = await fetch('/api/v1/faculty/timetable/alterations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(reqData)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Substitution requested successfully.");
        setIsSubstituteDialogOpen(false);
        setReason("");
        setSubstituteId("");
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (e: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Smart Timetable</h1>
          <p className="text-muted-foreground -mt-4">
            Weekly schedule with interactive class slots
          </p>
        </div>
        <Button variant="outline" className="w-fit">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
          <span className="text-sm text-muted-foreground">Lecture</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary/20 border border-secondary/30" />
          <span className="text-sm text-muted-foreground">Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
          <span className="text-sm text-muted-foreground">Tutorial</span>
        </div>
      </motion.div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="widget-card overflow-x-auto min-h-[400px]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full pt-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-muted-foreground border-b">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Day
                </th>
                {timeSlots.map((time) => (
                  <th
                    key={time}
                    className="p-3 text-center text-sm font-semibold text-muted-foreground border-b"
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    {formatTimeForDisplay(time)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <motion.tr
                  key={day}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + dayIndex * 0.05 }}
                  className={cn(day === currentDay && "bg-primary/5")}
                >
                  <td className={cn(
                    "p-3 text-sm font-medium border-b whitespace-nowrap",
                    day === currentDay ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {day}
                  </td>
                  {timeSlots.map((time) => {
                    const slots = timetableData[day]?.[time];
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="p-2 border-b"
                      >
                        {slots && slots.length > 0 ? (
                          <div className="space-y-1">
                            {slots.map((slot) => (
                              <div key={slot.id} className="relative group">
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all",
                                    typeStyles[slot.type]
                                  )}
                                >
                                  <p className={cn("font-semibold text-sm", typeColors[slot.type])}>
                                    {slot.subject}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {slot.section} {slot.room}
                                  </p>
                                </motion.div>

                                {/* Hover Action to Mark Absent */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-6 w-6 rounded-full"
                                    title="Mark Absent & Request Substitute"
                                    onClick={() => openSubstituteDialog(day, time, slot)}
                                  >
                                    <UserX className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-muted/30 text-center">
                            <span className="text-xs text-muted-foreground"></span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Assigned Substitutions Section */}
      {assignedSubstitutions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="widget-card mt-8"
        >
          <h2 className="text-lg font-semibold mb-4">Assigned Substitute Classes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedSubstitutions.map((sub: any) => (
              <div key={sub.id} className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{sub.proposed_date ? new Date(sub.proposed_date).toLocaleDateString() : 'Unknown Date'}</span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    sub.status === 'approved' ? "bg-green-100 text-green-700" :
                      sub.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Replacing: {sub.old_faculty?.Name || sub.old_faculty?.firstName || 'Unknown Faculty'}
                </div>
                {sub.slot && (
                  <div className="text-sm">
                    <span className="font-medium">{sub.slot.subject?.name}</span> ({sub.slot.room})
                    <br />
                    {sub.slot.day} @ {sub.slot.start_time} - {sub.slot.end_time}
                  </div>
                )}
                {sub.reason && (
                  <div className="text-xs text-muted-foreground italic truncate">
                    Reason: {sub.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Substitute Dialog */}
      <Dialog open={isSubstituteDialogOpen} onOpenChange={setIsSubstituteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Substitution</DialogTitle>
            <DialogDescription>
              Mark yourself absent for {selectedSlot?.subject} ({selectedSlot?.day} @ {selectedSlot?.time})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Date of Absence</Label>
              <input
                type="date"
                value={substituteDate}
                onChange={(e) => setSubstituteDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Substitute Faculty</Label>
              <Select value={substituteId} onValueChange={setSubstituteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {departmentFaculties.map((f: any) => (
                    <SelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                      {f.firstName} {f.lastName} ({f.designation || 'Faculty'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Give a brief reason for absence"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubstituteSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}


