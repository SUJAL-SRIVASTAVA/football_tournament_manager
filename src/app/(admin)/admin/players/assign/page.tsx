'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Users, Save, UserCheck } from 'lucide-react'

interface Player {
  id: string
  profile: {
    username: string
    fullName: string
    university: string
  }
  team?: {
    id: string
    name: string
  }
}

interface Team {
  id: string
  name: string
  university: string
}

export default function AssignPlayersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [filterTeam, setFilterTeam] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      
      const [playersResult, teamsResult] = await Promise.all([
        supabase
          .from('players')
          .select(`
            id,
            profile:profiles(username, fullName, university),
            team:teams(id, name)
          `)
          .order('createdAt', { ascending: false }),
        supabase
          .from('teams')
          .select('id, name, university')
          .order('name')
      ])

      if (playersResult.error) throw playersResult.error
      if (teamsResult.error) throw teamsResult.error

      setPlayers(playersResult.data || [])
      setTeams(teamsResult.data || [])

             // Initialize assignments with current team assignments
       const initialAssignments: Record<string, string> = {}
       playersResult.data?.forEach(player => {
         initialAssignments[player.id] = player.team?.id || 'none'
       })
      setAssignments(initialAssignments)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        name: error?.name,
        stack: error?.stack
      })
      
      // Try to stringify the error object
      try {
        console.error('Full error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (stringifyError) {
        console.error('Could not stringify error:', stringifyError)
      }
      
      // Better error message handling
      let errorMessage = 'Failed to load data'
      if (error?.message) {
        errorMessage += `: ${error.message}`
      } else if (error?.details) {
        errorMessage += `: ${error.details}`
      } else if (error?.hint) {
        errorMessage += `: ${error.hint}`
      } else if (error?.name) {
        errorMessage += `: ${error.name}`
      } else {
        errorMessage += ': Unknown error occurred'
      }
      
      toast.error(errorMessage)
    }
  }

  const handleAssignmentChange = (playerId: string, teamId: string) => {
    setAssignments(prev => ({ ...prev, [playerId]: teamId }))
  }

  const handleSaveAll = async () => {
    setLoading(true)

    try {
      // Use admin API to update (bypasses RLS when client user isn't ADMIN)
      const updates = Object.entries(assignments).map(([playerId, teamId]) => ({
        id: playerId,
        teamId: teamId === 'none' ? null : teamId || null
      }))

      const resp = await fetch('/api/admin/players/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update assignments')
      }

      toast.success('Player assignments updated successfully!')
      fetchData() // Refresh data
    } catch (error: any) {
      console.error('Error updating assignments:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        name: error?.name,
        stack: error?.stack
      })
      
      // Try to stringify the error object
      try {
        console.error('Full error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (stringifyError) {
        console.error('Could not stringify error:', stringifyError)
      }
      
      // Better error message handling
      let errorMessage = 'Failed to update assignments'
      if (error?.message) {
        errorMessage += `: ${error.message}`
      } else if (error?.details) {
        errorMessage += `: ${error.details}`
      } else if (error?.hint) {
        errorMessage += `: ${error.hint}`
      } else if (error?.name) {
        errorMessage += `: ${error.name}`
      } else {
        errorMessage += ': Unknown error occurred'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlayer = async (playerId: string) => {
    try {
      const resp = await fetch('/api/admin/players/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [{ id: playerId, teamId: assignments[playerId] === 'none' ? null : assignments[playerId] || null }] })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update assignment')
      }

      toast.success('Player assignment updated!')
      fetchData() // Refresh data
    } catch (error: any) {
      console.error('Error updating player assignment:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        name: error?.name,
        stack: error?.stack
      })
      
      // Try to stringify the error object
      try {
        console.error('Full error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (stringifyError) {
        console.error('Could not stringify error:', stringifyError)
      }
      
      // Better error message handling
      let errorMessage = 'Failed to update assignment'
      if (error?.message) {
        errorMessage += `: ${error.message}`
      } else if (error?.details) {
        errorMessage += `: ${error.details}`
      } else if (error?.hint) {
        errorMessage += `: ${error.hint}`
      } else if (error?.name) {
        errorMessage += `: ${error.name}`
      } else {
        errorMessage += ': Unknown error occurred'
      }
      
      toast.error(errorMessage)
    }
  }

  const filteredPlayers = filterTeam === 'all' 
    ? players 
    : players.filter(player => 
        filterTeam === 'unassigned' 
          ? !player.team 
          : player.team?.id === filterTeam
      )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Assign Players to Teams</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
                             <SelectContent>
                 <SelectItem value="all">All Players</SelectItem>
                 <SelectItem value="unassigned">Unassigned Players</SelectItem>
                 {teams.map((team) => (
                   <SelectItem key={team.id} value={team.id}>
                     {team.name}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleSaveAll} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{player.profile.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{player.profile.username} • {player.profile.university}
                    </p>
                    {player.team && (
                      <Badge variant="secondary" className="mt-1">
                        Currently: {player.team.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Select
                      value={assignments[player.id] || ''}
                      onValueChange={(value) => handleAssignmentChange(player.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                                             <SelectContent>
                         <SelectItem value="none">No Team</SelectItem>
                         {teams.map((team) => (
                           <SelectItem key={team.id} value={team.id}>
                             {team.name} ({team.university})
                           </SelectItem>
                         ))}
                       </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSavePlayer(player.id)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filterTeam === 'all' 
                  ? 'No players found' 
                  : filterTeam === 'unassigned'
                    ? 'All players are assigned to teams'
                    : 'No players in this team'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
