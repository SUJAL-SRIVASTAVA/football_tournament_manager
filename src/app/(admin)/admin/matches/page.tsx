'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Calendar } from 'lucide-react'

type MatchStatus = 'UPCOMING' | 'LIVE' | 'DONE'

interface StaticMatch {
  id: string
  homeTeamName: string
  awayTeamName: string
  startsAt: string // ISO string
  venue: string
  status: MatchStatus
  homeScore: number
  awayScore: number
  description?: string
}

/** Static sample data — replace/edit as you like */
const STATIC_MATCHES: StaticMatch[] = [
  {
    id: 'm1',
    homeTeamName: 'Alpha University',
    awayTeamName: 'Beta College',
    startsAt: '2025-09-01T15:00:00Z',
    venue: 'Main Stadium',
    status: 'UPCOMING',
    homeScore: 0,
    awayScore: 0,
    description: 'Season opener'
  },
  {
    id: 'm2',
    homeTeamName: 'Gamma FC',
    awayTeamName: 'Delta Rovers',
    startsAt: new Date().toISOString(),
    venue: 'City Arena',
    status: 'LIVE',
    homeScore: 1,
    awayScore: 0,
    description: 'Second half in progress'
  },
  {
    id: 'm3',
    homeTeamName: 'Epsilon United',
    awayTeamName: 'Zeta Stars',
    startsAt: '2025-08-10T18:30:00Z',
    venue: 'College Ground',
    status: 'DONE',
    homeScore: 2,
    awayScore: 1,
    description: 'Close game'
  }
]

export default function MatchesPageStatic() {
  const router = useRouter()

  const getBadgeVariant = (status: MatchStatus) => {
    switch (status) {
      case 'LIVE':
        return 'destructive'
      case 'DONE':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Match Management (Static)</h1>
          </div>

          <div>
            <Button onClick={() => router.push('/admin/matches/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Match
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {STATIC_MATCHES.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-6 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {m.homeTeamName} vs {m.awayTeamName}
                    </h3>
                    <Badge variant={getBadgeVariant(m.status)}>{m.status}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(m.startsAt).toLocaleDateString()}</span>
                    </div>
                    <div>{new Date(m.startsAt).toLocaleTimeString()}</div>
                    <div>{m.venue}</div>
                  </div>

                  {m.description && <p className="text-sm text-muted-foreground mb-3">{m.description}</p>}

                  {m.status !== 'UPCOMING' && (
                    <div className="text-2xl font-bold">
                      {m.homeScore} - {m.awayScore}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This is a static page — no Supabase or dynamic fetching. Edit the file to add real data.</p>
        </div>
      </div>
    </div>
  )
}
