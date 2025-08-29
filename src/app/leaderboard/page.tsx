'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Badge import removed as it is not used
import { createClient } from '@/lib/supabase/client'
import { Trophy, Medal, Target } from 'lucide-react'

interface TopScorer {
  playerId: string
  playerName: string
  teamName: string
  goals: number
}

interface TeamStats {
  teamId: string
  teamName: string
  university: string
  groupLabel: string
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export default function LeaderboardPage() {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
    const supabase = createClient()
    supabaseRef.current = supabase

    // Subscribe to real-time changes in 'goals' table
    const goalsSub = supabase.channel('realtime:public:goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchLeaderboardData()
      })
      .subscribe()

    // Subscribe to real-time changes in 'matches' table
    const matchesSub = supabase.channel('realtime:public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        // Only refresh if status or score changes
        if (
          payload.eventType === 'UPDATE' ||
          payload.eventType === 'INSERT' ||
          payload.eventType === 'DELETE'
        ) {
          fetchLeaderboardData()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(goalsSub)
      supabase.removeChannel(matchesSub)
    }
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      const supabase = createClient()
      
      // Fetch top scorers
      const { data: scorers, error: scorersError } = await supabase
        .from('goals')
        .select(`
          playerId,
          player:players!playerId(
            profile:profiles!profileId(fullName),
            team:teams!teamId(name)
          )
        `)

      if (scorersError) throw scorersError

      // Process scorers data
      const scorerCounts = new Map<string, { name: string; team: string; count: number }>()
      
      scorers?.forEach(goal => {
        const playerId = goal.playerId
        const playerName = goal.player.profile.fullName
        const teamName = goal.player.team?.name || 'No Team'
        
        if (scorerCounts.has(playerId)) {
          scorerCounts.get(playerId)!.count++
        } else {
          scorerCounts.set(playerId, { name: playerName, team: teamName, count: 1 })
        }
      })

      const sortedScorers = Array.from(scorerCounts.entries())
        .map(([playerId, data]) => ({
          playerId,
          playerName: data.name,
          teamName: data.team,
          goals: data.count
        }))
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10)

      setTopScorers(sortedScorers)

      // Fetch team statistics
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          homeTeamId,
          awayTeamId,
          homeScore,
          awayScore,
          status,
          homeTeam:teams!homeTeamId(id, name, university, groupLabel),
          awayTeam:teams!awayTeamId(id, name, university, groupLabel)
        `)
        .eq('status', 'DONE')

      if (matchesError) throw matchesError

      // Process team statistics
      const teamStatsMap = new Map<string, TeamStats>()

      matches?.forEach(match => {
        const homeTeam = match.homeTeam
        const awayTeam = match.awayTeam
        
        // Initialize team stats if not exists
        if (!teamStatsMap.has(homeTeam.id)) {
          teamStatsMap.set(homeTeam.id, {
            teamId: homeTeam.id,
            teamName: homeTeam.name,
            university: homeTeam.university,
            groupLabel: homeTeam.groupLabel || '',
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
          })
        }
        
        if (!teamStatsMap.has(awayTeam.id)) {
          teamStatsMap.set(awayTeam.id, {
            teamId: awayTeam.id,
            teamName: awayTeam.name,
            university: awayTeam.university,
            groupLabel: awayTeam.groupLabel || '',
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
          })
        }

        const homeStats = teamStatsMap.get(homeTeam.id)!
        const awayStats = teamStatsMap.get(awayTeam.id)!

        // Update match statistics
        homeStats.matchesPlayed++
        awayStats.matchesPlayed++
        homeStats.goalsFor += match.homeScore
        homeStats.goalsAgainst += match.awayScore
        awayStats.goalsFor += match.awayScore
        awayStats.goalsAgainst += match.homeScore

        if (match.homeScore > match.awayScore) {
          homeStats.wins++
          awayStats.losses++
          homeStats.points += 3
        } else if (match.homeScore < match.awayScore) {
          awayStats.wins++
          homeStats.losses++
          awayStats.points += 3
        } else {
          homeStats.draws++
          awayStats.draws++
          homeStats.points += 1
          awayStats.points += 1
        }
      })

      const sortedTeamStats = Array.from(teamStatsMap.values())
        .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))

      setTeamStats(sortedTeamStats)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          onClick={() => {
            setLoading(true)
            fetchLeaderboardData()
          }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Scorers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topScorers.map((scorer, index) => (
                <div key={scorer.playerId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{scorer.playerName}</div>
                      <div className="text-sm text-muted-foreground">{scorer.teamName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{scorer.goals}</span>
                    <span className="text-sm text-muted-foreground">goals</span>
                  </div>
                </div>
              ))}
              
              {topScorers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No goals scored yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Team Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamStats.map((team, index) => (
                <div key={team.teamId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{team.teamName}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.university} • Group {team.groupLabel}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{team.points} pts</div>
                    <div className="text-sm text-muted-foreground">
                      {team.wins}W {team.draws}D {team.losses}L
                    </div>
                  </div>
                </div>
              ))}
              
              {teamStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No matches completed yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
