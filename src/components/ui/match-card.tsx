import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: 'UPCOMING' | 'LIVE' | 'DONE'
  startsAt: string
  venue: string
  groupLabel?: string
  goals?: Array<{
    minute: number
    scorer: string
    ownGoal: boolean
  }>
}

export function MatchCard({
  homeTeam,
  awayTeam,
  homeScore = 0,
  awayScore = 0,
  status,
  startsAt,
  venue,
  groupLabel,
  goals = []
}: MatchCardProps) {
  const isLive = status === 'LIVE'
  const isDone = status === 'DONE'
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatTime(startsAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {groupLabel && (
              <Badge variant="secondary" className="text-xs">
                Group {groupLabel}
              </Badge>
            )}
            <Badge 
              variant={isLive ? "destructive" : isDone ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isLive && "animate-pulse"
              )}
            >
              {status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{venue}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center">
            <div className="text-lg font-semibold">{homeTeam}</div>
            <div className="text-xs text-muted-foreground">Home</div>
          </div>
          
          <div className="flex items-center gap-2 px-4">
            <div className="text-2xl font-bold min-w-[2rem] text-center">
              {homeScore}
            </div>
            <div className="text-muted-foreground">-</div>
            <div className="text-2xl font-bold min-w-[2rem] text-center">
              {awayScore}
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <div className="text-lg font-semibold">{awayTeam}</div>
            <div className="text-xs text-muted-foreground">Away</div>
          </div>
        </div>
        
        {goals.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-sm font-medium mb-2">Goals</div>
            <div className="space-y-1">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {goal.minute}&apos;
                  </span>
                  <span className={cn(
                    goal.ownGoal && "text-destructive"
                  )}>
                    {goal.scorer}
                    {goal.ownGoal && " (OG)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
