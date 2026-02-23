import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative";
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change, changeType }) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, background: "#fff", minHeight: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && <span>{icon}</span>}
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{title}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
          {change && (
            <div style={{ color: changeType === "positive" ? "#16a34a" : "#dc2626", fontSize: 14 }}>
              {changeType === "positive" ? "+" : "-"}{change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
