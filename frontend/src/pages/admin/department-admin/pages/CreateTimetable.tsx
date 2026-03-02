import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

export const CreateTimetable = () => {
    const [faculties, setFaculties] = useState<any[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [semester, setSemester] = useState("odd");
    const { toast } = useToast();
    const { authToken } = useAuth();

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            const token = authToken || localStorage.getItem('authToken');
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            const response = await fetch('/api/v1/department-admin/timetable/faculty', {
                headers,
                credentials: 'include' // in case server relies on cookie
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Unauthorized');
            }

            if (data.success) {
                setFaculties(data.data);
                if (data.count === 0 && data.message) {
                    toast({
                        title: "Notice",
                        description: data.message,
                        variant: "default"
                    });
                }
            } else {
                throw new Error(data.error || 'Unexpected response');
            }
        } catch (error: any) {
            console.error("Error fetching faculties:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to load faculty list",
                variant: "destructive",
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast({
                    title: "Invalid file",
                    description: "Please select a valid CSV file.",
                    variant: "destructive",
                });
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!selectedFaculty) {
            toast({ title: "Validation Error", description: "Please select a faculty member.", variant: "destructive" });
            return;
        }
        if (!file) {
            toast({ title: "Validation Error", description: "Please select a CSV file to upload.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('faculty_id', selectedFaculty);
        formData.append('year', year);
        formData.append('semester', semester);
        formData.append('file', file);

        try {
            const headers: Record<string, string> = {};
            const token = authToken || localStorage.getItem('authToken');
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1/department-admin/timetable/upload-csv', {
                method: 'POST',
                headers,
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: "Success",
                    description: "Timetable uploaded successfully"
                });
                setFile(null);
                setSelectedFaculty('');
            } else {
                const errorMsg = data.error || data.message || "Failed to upload timetable.";
                toast({
                    title: "Upload Failed",
                    description: errorMsg,
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error uploading timetable:", error);
            toast({
                title: "Upload Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Timetable</h1>
                    <p className="text-muted-foreground">Upload personal timetables for faculty members within your department via CSV.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Timetable CSV</CardTitle>
                            <CardDescription>Select a faculty and upload their specific shift/class CSV file.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="faculty">Select Faculty</Label>
                                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                                    <SelectTrigger id="faculty">
                                        <SelectValue placeholder="Select faculty member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculties.map((f) => (
                                            <SelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                                                {f.Name} ({f.designation || 'Faculty'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Academic Year</Label>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger id="year">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                    <SelectTrigger id="semester">
                                        <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="odd">Odd</SelectItem>
                                        <SelectItem value="even">Even</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="csv-upload">CSV File</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                </div>
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        {file.name} selected
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleUpload}
                                className="w-full"
                                disabled={isUploading || !file || !selectedFaculty}
                            >
                                {isUploading ? (
                                    <>Uploading...</>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Timetable
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CSV Format Requirements</CardTitle>
                            <CardDescription>Ensure your CSV matches exactly to avoid errors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Required Columns (in order)</AlertTitle>
                                <AlertDescription className="mt-2 text-sm">
                                    <ol className="list-decimal pl-4 space-y-1">
                                        <li><strong>Day</strong> (e.g., Monday, Tuesday)</li>
                                        <li><strong>Time</strong> (e.g., 09:00-10:00)</li>
                                        <li><strong>Subject Code</strong> (e.g., CS101)</li>
                                        <li><strong>Subject Name</strong> (e.g., Data Structures)</li>
                                        <li><strong>Class Room No</strong> (e.g., Room 304)</li>
                                    </ol>
                                    <p className="mt-4 text-xs text-muted-foreground italic">
                                        Note: The first row is considered the header and will be skipped during processing.
                                    </p>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default CreateTimetable;
