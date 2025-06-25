
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type IncomeChartProps = {
  data: { name: string; total: number }[];
};

export function IncomeChart({ data }: IncomeChartProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Income Overview</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No income data to display.
                    </div>
                ) : (
                    <BarChart data={data}>
                        <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        />
                        <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        />
                         <Tooltip
                            cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
}
