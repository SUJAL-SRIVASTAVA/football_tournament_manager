'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Search, Play, Square } from 'lucide-react'

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
}

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
          homeTeam:teams!homeTeamId(name),
          awayTeam:teams!awayTeamId(name),
          startsAt,
          venue,
          status,
          homeScore,
          awayScore,
          description
        `)
        .order('startsAt', { ascending: false })

      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMatch = async (matchId: string, matchName: string) => {
    if (!confirm(`Are you sure you want to delete match "${matchName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (error) throw error

      toast.success('Match deleted successfully!')
      fetchMatches()
    } catch (error) {
      console.error('Error deleting match:', error)
      toast.error('Failed to delete match')
    }
  }

  const handleStartMatch = async (matchId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('matches')
        .update({ status: 'LIVE' })
        .eq('id', matchId)

      if (error) throw error

      toast.success('Match started!')
      fetchMatches()
    } catch (error) {
      console.error('Error starting match:', error)
      toast.error('Failed to start match')
    }
  }

  const handleEndMatch = async (matchId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('matches')
        .update({ status: 'DONE' })
        .eq('id', matchId)

      if (error) throw error

      toast.success('Match ended!')
      fetchMatches()
    } catch (error) {
      console.error('Error ending match:', error)
      toast.error('Failed to end match')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'destructive'
      case 'DONE':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading matches...</div>
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
          <h1 className="text-2xl font-bold">Match Management</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="DONE">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => router.push('/admin/matches/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Match
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredMatches.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(match.status)}>
                        {match.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.startsAt).toLocaleDateString()}
                      </div>
                      <div>{new Date(match.startsAt).toLocaleTimeString()}</div>
                      <div>{match.venue}</div>
                    </div>
                    {match.description && (
                      <p className="text-sm text-muted-foreground mb-3">{match.description}</p>
                    )}
                    {match.status !== 'UPCOMING' && (
                      <div className="text-2xl font-bold">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {match.status === 'UPCOMING' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartMatch(match.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {match.status === 'LIVE' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEndMatch(match.id)}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/matches/live`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteMatch(match.id, `${match.homeTeam.name} vs ${match.awayTeam.name}`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMatches.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No matches found matching your criteria' 
                  : 'No matches scheduled yet'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/admin/matches/create')}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Match
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

