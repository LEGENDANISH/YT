import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"

export default function EngagementMetrics({ analytics }) {
  const data = [
    {
      name: "Likes",
      value: analytics.likes || 0,
      color: "hsl(var(--primary))"
    },
    {
      name: "Comments",
      value: analytics.comments || 0,
      color: "hsl(var(--chart-2))"
    },
    {
      name: "Subscribers",
      value: analytics.subscribersGained || 0,
      color: "hsl(var(--chart-3))"
    }
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate engagement rate
  const engagementRate = analytics.views > 0
    ? (((analytics.likes || 0) + (analytics.comments || 0)) / analytics.views * 100).toFixed(2)
    : "0.00"

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Engagement Metrics</h3>
            <p className="text-sm text-muted-foreground">
              {engagementRate}% engagement rate
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {((analytics.likes || 0) + (analytics.comments || 0)).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total interactions</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Engagement breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-sm text-muted-foreground">{item.name}</div>
              <div className="text-lg font-semibold">{item.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}