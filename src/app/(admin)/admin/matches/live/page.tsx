'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Play, Square, Plus, Minus, Save } from 'lucide-react'

interface Match {
  id: string
  homeTeam: { name: string }
  awayTeam: { name: string }
  startsAt: string
  venue: string
  status: 'UPCOMING' | 'LIVE' | 'DONE'
  homeScore: number
  awayScore: number
  description?: string
  homeTeamId: string
  awayTeamId: string
}

type PlayerRow = { id: string; profile: { fullName: string } }

const toSafeErrorDetails = (err: unknown) => {
  const obj = (typeof err === 'object' && err !== null) ? (err as Record<string, unknown>) : {}
  return {
    message: typeof obj.message === 'string' ? obj.message : undefined,
    code: obj.code,
    details: obj.details,
    hint: obj.hint
  }
}

const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) return err.message
  const details = toSafeErrorDetails(err)
  if (details.message) return details.message
  return 'Unknown error'
}

export default function LiveMatchControlPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(false)
  const [scoreUpdates, setScoreUpdates] = useState({
    homeScore: 0,
    awayScore: 0
  })
  const [homePlayers, setHomePlayers] = useState<{ id: string; name: string }[]>([])
  const [awayPlayers, setAwayPlayers] = useState<{ id: string; name: string }[]>([])
  const [goalTeam, setGoalTeam] = useState<'home' | 'away'>('home')
  const [goalPlayerId, setGoalPlayerId] = useState<string>('')
  const [goalMinute, setGoalMinute] = useState<string>('')

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      setScoreUpdates({
        homeScore: selectedMatch.homeScore,
        awayScore: selectedMatch.awayScore
      })
      // Load players for each team
      ;(async () => {
        const supabase = createClient()
        const [homeRes, awayRes] = await Promise.all([
          supabase
            .from('players')
            .select('id, profile:profiles(fullName)')
            .eq('teamId', selectedMatch.homeTeamId),
          supabase
            .from('players')
            .select('id, profile:profiles(fullName)')
            .eq('teamId', selectedMatch.awayTeamId)
        ])
        setHomePlayers(((homeRes.data || []) as PlayerRow[]).map((p) => ({ id: p.id, name: p.profile.fullName })))
        setAwayPlayers(((awayRes.data || []) as PlayerRow[]).map((p) => ({ id: p.id, name: p.profile.fullName })))
        setGoalPlayerId('')
        setGoalMinute('')
        setGoalTeam('home')
      })()
    }
  }, [selectedMatch])

  const fetchMatches = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          homeTeam:teams!homeTeamId(name),
          awayTeam:teams!awayTeamId(name),
          startsAt,
          venue,
          status,
          homeScore,
          awayScore
          ,
          homeTeamId,
          awayTeamId
        `)
        .order('startsAt', { ascending: false })

      if (error) throw error
      const fetched = data || []

      // Auto-activate matches that have started
      const now = new Date()
      const toActivate = fetched.filter(m => m.status === 'UPCOMING' && new Date(m.startsAt) <= now)
      if (toActivate.length > 0) {
        const ids = toActivate.map(m => m.id)
        await supabase.from('matches').update({ status: 'LIVE' }).in('id', ids)
        const refreshed = fetched.map(m => ids.includes(m.id) ? { ...m, status: 'LIVE' } : m)
        setMatches(refreshed)
      } else {
        setMatches(fetched)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      console.error('Error details:', toSafeErrorDetails(error))
      toast.error(`Failed to load matches: ${toErrorMessage(error)}`)
    }
  }

  const handleStartMatch = async (matchId: string) => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/matches/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: matchId, patch: { status: 'LIVE' } })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to start match')
      }
      toast.success('Match started!')
      fetchMatches()
    } catch (error) {
      console.error('Error starting match:', error)
      console.error('Error details:', toSafeErrorDetails(error))
      toast.error(`Failed to start match: ${toErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEndMatch = async (matchId: string) => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/matches/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: matchId, patch: { status: 'DONE' } })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to end match')
      }
      toast.success('Match ended!')
      fetchMatches()
      setSelectedMatch(null)
    } catch (error) {
      console.error('Error ending match:', error)
      console.error('Error details:', toSafeErrorDetails(error))
      toast.error(`Failed to end match: ${toErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateScore = async () => {
    if (!selectedMatch) return

    setLoading(true)
    try {
      const resp = await fetch('/api/admin/matches/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedMatch.id, patch: { homeScore: scoreUpdates.homeScore, awayScore: scoreUpdates.awayScore } })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update score')
      }
      toast.success('Score updated!')
      fetchMatches()
    } catch (error) {
      console.error('Error updating score:', error)
      console.error('Error details:', toSafeErrorDetails(error))
      toast.error(`Failed to update score: ${toErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (team: 'home' | 'away', action: 'increment' | 'decrement') => {
    if (team === 'home') {
      setScoreUpdates(prev => ({
        ...prev,
        homeScore: Math.max(0, prev.homeScore + (action === 'increment' ? 1 : -1))
      }))
    } else {
      setScoreUpdates(prev => ({
        ...prev,
        awayScore: Math.max(0, prev.awayScore + (action === 'increment' ? 1 : -1))
      }))
    }
  }

  const handleAddGoal = async () => {
    if (!selectedMatch || !goalPlayerId) return
    setLoading(true)
    try {
      const minute = parseInt(goalMinute || '0', 10)
      const resp = await fetch('/api/admin/goals/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatch.id, playerId: goalPlayerId, minute })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to record goal')
      }
      setScoreUpdates(prev => ({
        homeScore: prev.homeScore + (goalTeam === 'home' ? 1 : 0),
        awayScore: prev.awayScore + (goalTeam === 'away' ? 1 : 0)
      }))
      toast.success('Goal recorded! Remember to Update Score to sync the match score.')
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) || 'Failed to record goal')
    } finally {
      setLoading(false)
    }
  }

  const liveMatches = matches.filter(match => match.status === 'LIVE')
  const upcomingMatches = matches.filter(match => match.status === 'UPCOMING')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Live Match Control</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Live Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveMatches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No live matches at the moment
                </p>
              ) : (
                liveMatches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </h3>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {match.venue}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMatch(match)}
                      >
                        Control
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEndMatch(match.id)}
                        disabled={loading}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        End Match
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMatches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming matches
                </p>
              ) : (
                upcomingMatches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </h3>
                      <Badge variant="secondary">UPCOMING</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(match.startsAt).toLocaleString()} • {match.venue}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleStartMatch(match.id)}
                      disabled={loading}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Match
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Match Control Panel */}
        {selectedMatch && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Live Match Control - {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Home Team Score */}
                <div className="text-center">
                  <Label className="text-lg font-medium">{selectedMatch.homeTeam.name}</Label>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScoreChange('home', 'decrement')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-3xl font-bold w-16">
                      {scoreUpdates.homeScore}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScoreChange('home', 'increment')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* VS */}
                <div className="flex items-center justify-center">
                  <div className="text-2xl font-bold text-muted-foreground">VS</div>
                </div>

                {/* Away Team Score */}
                <div className="text-center">
                  <Label className="text-lg font-medium">{selectedMatch.awayTeam.name}</Label>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScoreChange('away', 'decrement')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-3xl font-bold w-16">
                      {scoreUpdates.awayScore}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScoreChange('away', 'increment')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpdateScore}
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Score'}
                </Button>
                <div className="flex-1 flex items-end gap-2">
                  <Select value={goalTeam} onValueChange={(v: 'home'|'away') => setGoalTeam(v)}>
                    <SelectTrigger className="w-28"><SelectValue placeholder="Team" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">{selectedMatch.homeTeam.name}</SelectItem>
                      <SelectItem value="away">{selectedMatch.awayTeam.name}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={goalPlayerId} onValueChange={setGoalPlayerId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Scorer" /></SelectTrigger>
                    <SelectContent>
                      {(goalTeam === 'home' ? homePlayers : awayPlayers).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Min"
                    value={goalMinute}
                    onChange={e => setGoalMinute(e.target.value)}
                    className="w-20"
                  />
                  <Button onClick={handleAddGoal} disabled={loading || !goalPlayerId}>Add Goal</Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMatch(null)}
                >
                  Close Control
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
