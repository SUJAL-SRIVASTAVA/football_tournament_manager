'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Calendar, MapPin, Clock } from 'lucide-react'

interface Match {
  id: string
  homeTeam: { name: string }
  awayTeam: { name: string }
  startsAt: string
  venue: string
  status: 'UPCOMING' | 'LIVE' | 'DONE'
  homeScore: number
  awayScore: number
  groupLabel: string | null
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          startsAt,
          venue,
          status,
          homeScore,
          awayScore,
          groupLabel,
          homeTeam:teams!homeTeamId(name),
          awayTeam:teams!awayTeamId(name)
        `)
        .order('startsAt', { ascending: true })

      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500'
      case 'DONE': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading matches...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matches</h1>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </CardTitle>
                <Badge className={getStatusColor(match.status)}>
                  {match.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(match.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {match.venue}
                </div>
                {match.groupLabel && (
                  <div className="text-sm text-muted-foreground">
                    Group {match.groupLabel}
                  </div>
                )}
                {(match.status === 'LIVE' || match.status === 'DONE') && (
                  <div className="text-xl font-bold text-center py-2">
                    {match.homeScore} - {match.awayScore}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {matches.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No matches scheduled yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

