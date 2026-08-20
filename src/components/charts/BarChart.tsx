"use client";

import { useTheme } from "next-themes";
import { BarChart as RechartBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 19000 },
    { name: 'Mar', revenue: 15000 },
    { name: 'Apr', revenue: 28000 },
    { name: 'May', revenue: 32000 },
    { name: 'Jun', revenue: 48574 },
];

export default function BarChart() {
    const { theme } = useTheme();
    return(
        <ResponsiveContainer width="100%" height={400}>
            <RechartBar data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="name" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                <YAxis stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
                <Tooltip contentStyle={{ background: theme === "dark" ? "#1f2937" : "#ffffff", border: "none", borderRadius: "12px" }} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
            </RechartBar>
        </ResponsiveContainer>
    )
}