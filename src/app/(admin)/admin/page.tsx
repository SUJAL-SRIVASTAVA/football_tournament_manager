'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Users, Calendar, Trophy, Settings, 
  Plus, Edit, Trash2, Eye,
  UserPlus, Gamepad2, Award,
  AlertTriangle, Shield
} from 'lucide-react'

interface DashboardStats {
  totalPlayers: number
  totalTeams: number
  totalMatches: number
  liveMatches: number
  pendingAdminRequests: number
}

interface Player {
  id: string
  profile: {
    username: string
    fullName: string
    university: string
  }
  team?: {
    name: string
  }
}

interface Team {
  id: string
  name: string
  university: string
  groupLabel: string | null
  players: Player[]
}

interface Match {
  id: string
  homeTeam: { name: string }
  awayTeam: { name: string }
  startsAt: string
  venue: string
  status: 'UPCOMING' | 'LIVE' | 'DONE'
  homeScore: number
  awayScore: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalTeams: 0,
    totalMatches: 0,
    liveMatches: 0,
    pendingAdminRequests: 0
  })
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData()
    }
  }, [isAdmin])

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAdmin(false)
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'ADMIN')
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()
      
      // Fetch statistics
      const [playersResult, teamsResult, matchesResult, liveMatchesResult, pendingRequestsResult] = await Promise.all([
        supabase.from('players').select('id', { count: 'exact' }),
        supabase.from('teams').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'LIVE'),
        supabase.from('admin_requests').select('id', { count: 'exact' }).eq('status', 'PENDING')
      ])

      setStats({
        totalPlayers: playersResult.count || 0,
        totalTeams: teamsResult.count || 0,
        totalMatches: matchesResult.count || 0,
        liveMatches: liveMatchesResult.count || 0,
        pendingAdminRequests: pendingRequestsResult.count || 0
      })

      // Fetch detailed data
      await Promise.all([
        fetchPlayers(),
        fetchTeams(),
        fetchMatches()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        profile:profiles(username, fullName, university),
        team:teams(name)
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching players:', error)
      return
    }

    setPlayers((data as unknown as Player[]) || [])
  }

  const deletePlayer = async (playerId: string) => {
    const confirmDelete = confirm('Are you sure you want to permanently delete this player?')
    if (!confirmDelete) return
    try {
      const res = await fetch('/api/admin/players/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Delete failed')
      }
      toast.success('Player deleted')
      await Promise.all([fetchPlayers(), fetchDashboardData()])
    } catch (e: unknown) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Failed to delete player'
      toast.error(message)
    }
  }

  const fetchTeams = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        university,
        groupLabel,
        players:players(id)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching teams:', error)
      return
    }

    setTeams((data as unknown as Team[]) || [])
  }

  const deleteTeam = async (teamId: string) => {
    const confirmDelete = confirm('Are you sure you want to permanently delete this team?')
    if (!confirmDelete) return
    try {
      const res = await fetch('/api/admin/teams/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teamId })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Delete failed')
      }
      toast.success('Team deleted')
      await Promise.all([fetchTeams(), fetchDashboardData()])
    } catch (e: unknown) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Failed to delete team'
      toast.error(message)
    }
  }

  const fetchMatches = async () => {
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
      `)
      .order('startsAt', { ascending: false })

    if (error) {
      console.error('Error fetching matches:', error)
      return
    }

    setMatches((data as unknown as Match[]) || [])
  }

  const handleCreateTeam = () => {
    router.push('/admin/teams/create')
  }

  const handleCreateMatch = () => {
    router.push('/admin/matches/create')
  }

  const handleAssignPlayers = () => {
    router.push('/admin/players/assign')
  }

  const handleLiveMatchControl = () => {
    router.push('/admin/matches/live')
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Checking admin privileges...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You don&apos;t have administrator privileges to access this page.
              </p>
              <Button onClick={() => router.push('/')} className="w-full">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Administrator Access
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="live">Live Control</TabsTrigger>
          <TabsTrigger value="confirm" className="relative">
            Admin Confirm
            {stats.pendingAdminRequests > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {stats.pendingAdminRequests}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTeams}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMatches}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
                <Badge variant="destructive" className="h-4 w-4">LIVE</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.liveMatches}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleCreateTeam} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Team
                </Button>
                <Button onClick={handleCreateMatch} className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Match
                </Button>
                <Button onClick={handleAssignPlayers} className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Assign Players
                </Button>
                <Button onClick={handleLiveMatchControl} className="w-full" variant="outline">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Live Match Control
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Latest Match:</span>
                    <span className="text-muted-foreground">
                      {matches[0] ? `${matches[0].homeTeam.name} vs ${matches[0].awayTeam.name}` : 'No matches'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Players:</span>
                    <span className="text-muted-foreground">{stats.totalPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Teams:</span>
                    <span className="text-muted-foreground">{stats.totalTeams}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Player Management</h2>
            <Button onClick={handleAssignPlayers} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Assign to Teams
            </Button>
          </div>
          
          <div className="grid gap-4">
            {players.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{player.profile.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        @{player.profile.username} • {player.profile.university}
                      </p>
                      {player.team && (
                        <Badge variant="secondary" className="mt-1">
                          {player.team.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePlayer(player.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Management</h2>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/admin/teams')} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
              <Button onClick={handleCreateTeam} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {teams.slice(0, 5).map((team) => (
              <Card key={team.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.university} • Group {team.groupLabel || 'Unassigned'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {team.players.length} players
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push('/admin/teams')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteTeam(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {teams.length > 5 && (
              <Button 
                onClick={() => router.push('/admin/teams')} 
                variant="outline" 
                className="w-full"
              >
                View All {teams.length} Teams
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Match Management</h2>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/admin/matches')} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
              <Button onClick={handleCreateMatch} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Match
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {matches.slice(0, 5).map((match) => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.startsAt).toLocaleDateString()} • {match.venue}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={match.status === 'LIVE' ? 'destructive' : 'secondary'}>
                          {match.status}
                        </Badge>
                        {match.status !== 'UPCOMING' && (
                          <Badge variant="outline">
                            {match.homeScore} - {match.awayScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push('/admin/matches/live')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {matches.length > 5 && (
              <Button 
                onClick={() => router.push('/admin/matches')} 
                variant="outline" 
                className="w-full"
              >
                View All {matches.length} Matches
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Live Match Control</h2>
            <Button onClick={handleLiveMatchControl} variant="outline">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Live Control Panel
            </Button>
          </div>
          
          <div className="grid gap-4">
            {matches.filter(match => match.status === 'LIVE').map((match) => (
              <Card key={match.id} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <h3 className="font-medium">
                          {match.homeTeam.name} vs {match.awayTeam.name}
                        </h3>
                        <Badge variant="destructive">LIVE</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {match.venue}
                      </p>
                      <div className="text-xl font-bold mt-1">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push('/admin/matches/live')}
                      >
                        <Gamepad2 className="h-4 w-4" />
                        Control
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {matches.filter(match => match.status === 'LIVE').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No live matches at the moment</p>
                  <Button 
                    onClick={() => router.push('/admin/matches/live')} 
                    className="mt-4"
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Go to Live Control
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="confirm" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admin Role Confirmation</h2>
            <Button onClick={() => router.push('/admin/confirm')} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              View All Requests
            </Button>
          </div>
          
          <div className="grid gap-4">
            {/* This will show a summary of pending admin requests */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Admin Role Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Review and approve admin access requests from users
                    </p>
                  </div>
                  <Button onClick={() => router.push('/admin/confirm')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
