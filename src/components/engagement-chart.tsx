"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

const data = [
  { date: "Jan 1", engagement: 200 },
  { date: "Jan 2", engagement: 300 },
  { date: "Jan 3", engagement: 250 },
  { date: "Jan 4", engagement: 400 },
  { date: "Jan 5", engagement: 350 },
  { date: "Jan 6", engagement: 500 },
  { date: "Jan 7", engagement: 450 },
]

export function EngagementChart() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Date
                      </span>
                      <span className="font-bold">
                        {payload[0].payload.date}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Engagement
                      </span>
                      <span className="font-bold">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{
              r: 4,
              style: { fill: "#8884d8", opacity: 0.8 }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}