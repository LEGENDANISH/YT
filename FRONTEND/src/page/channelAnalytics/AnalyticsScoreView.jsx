import { Card, CardContent } from "@/components/ui/card"

export default function AnalyticsOverview({ analytics }) {
  const stats = [
    {
      label: "Total Views",
      value: analytics.views?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      label: "Watch Time",
      value: `${analytics.watchTimeHours?.toFixed(2) || "0.00"} hrs`,
      subValue: `${analytics.watchTimeMinutes?.toFixed(0) || "0"} min`,
      change: "+8%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: "Engagement",
      value: analytics.likes?.toLocaleString() || "0",
      subValue: `${analytics.comments || 0} comments`,
      change: "+24%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      label: "Subscribers Gained",
      value: analytics.subscribersGained?.toLocaleString() || "0",
      change: analytics.subscribersGained > 0 ? `+${analytics.subscribersGained}` : "0",
      trend: analytics.subscribersGained > 0 ? "up" : "neutral",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden transition-all hover:shadow-md"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {stat.icon}
              </div>
              {stat.trend && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : stat.trend === "down"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {stat.trend === "down" && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {stat.change}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {stat.label}
              </h3>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {stat.value}
              </div>
              {stat.subValue && (
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.subValue}
                </div>
              )}
            </div>

            {/* Decorative gradient */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}