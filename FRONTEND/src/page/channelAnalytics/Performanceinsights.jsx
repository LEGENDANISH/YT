import { Card, CardContent } from "@/components/ui/card"

export default function PerformanceInsights({ analytics, video }) {
  // Calculate average watch time percentage
  const avgWatchPercentage = video?.duration && analytics.watchTimeSeconds
    ? ((analytics.watchTimeSeconds / video.duration) * 100).toFixed(1)
    : null

  // Calculate metrics
  const avgViewDuration = analytics.watchTimeSeconds && analytics.views
    ? (analytics.watchTimeSeconds / analytics.views).toFixed(0)
    : 0

  const insights = [
    {
      title: "Watch Time Performance",
      description: analytics.watchTimeHours > 1
        ? "Great retention! Your video is keeping viewers engaged."
        : "Consider optimizing your content to increase watch time.",
      status: analytics.watchTimeHours > 1 ? "good" : "neutral",
      metric: `${analytics.watchTimeHours?.toFixed(2) || 0} hours`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Engagement Rate",
      description: analytics.views > 0 && analytics.likes > 0
        ? "Your audience is actively engaging with your content!"
        : "Encourage viewers to like and comment on your video.",
      status: analytics.likes > 0 ? "good" : "neutral",
      metric: analytics.views > 0
        ? `${((analytics.likes / analytics.views) * 100).toFixed(2)}%`
        : "0%",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: "Subscriber Growth",
      description: analytics.subscribersGained > 0
        ? `You gained ${analytics.subscribersGained} new subscribers from this video!`
        : "Focus on creating compelling CTAs to gain more subscribers.",
      status: analytics.subscribersGained > 0 ? "good" : "neutral",
      metric: `+${analytics.subscribersGained || 0}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  const quickStats = [
    {
      label: "Avg View Duration",
      value: `${avgViewDuration}s`,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Total Interactions",
      value: (analytics.likes + analytics.comments).toLocaleString(),
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      label: "Watch Time",
      value: `${analytics.watchTimeMinutes?.toFixed(0) || 0} min`,
      color: "text-green-600 dark:text-green-400"
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Insights Cards */}
      {insights.map((insight, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                insight.status === "good"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {insight.icon}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{insight.metric}</div>
              </div>
            </div>

            <h4 className="font-semibold mb-2">{insight.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.description}
            </p>

            {/* Status indicator */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${
              insight.status === "good"
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-muted to-muted-foreground/20"
            }`} />
          </CardContent>
        </Card>
      ))}

      {/* Quick Stats Panel */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-6">Quick Statistics</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional metrics */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Views</div>
                <div className="text-xl font-semibold">{analytics.views?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Likes</div>
                <div className="text-xl font-semibold">{analytics.likes?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Comments</div>
                <div className="text-xl font-semibold">{analytics.comments?.toLocaleString() || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">New Subs</div>
                <div className="text-xl font-semibold">+{analytics.subscribersGained?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}