'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Edit, Trash2, Users, Search } from 'lucide-react'

interface Team {
  id: string
  name: string
  university: string
  groupLabel: string | null
  description: string | null
  players: {
    id: string
    profile: {
      username: string
      fullName: string
    }
  }[]
}

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          university,
          groupLabel,
          players:players(
            id,
            profile:profiles(username, fullName)
          )
        `)
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = createClient()
      
      // First, remove all players from this team
      await supabase
        .from('players')
        .update({ teamId: null })
        .eq('teamId', teamId)

      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      toast.success('Team deleted successfully!')
      fetchTeams()
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error('Failed to delete team')
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.groupLabel && team.groupLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading teams...</div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold">Team Management</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => router.push('/admin/teams/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Team
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{team.name}</h3>
                      {team.groupLabel && (
                        <Badge variant="secondary">Group {team.groupLabel}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{team.university}</p>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mb-3">{team.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {team.players.length} players
                    </div>
                    {team.players.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Players:</p>
                        <div className="flex flex-wrap gap-2">
                          {team.players.map((player) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              {player.profile.fullName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No teams found matching your search' : 'No teams created yet'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => router.push('/admin/teams/create')}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Team
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

