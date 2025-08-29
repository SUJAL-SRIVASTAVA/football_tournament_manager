'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Save } from 'lucide-react'

interface Team {
  id: string
  name: string
  university: string
}

export default function CreateMatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    startsAt: '',
    venue: '',
    description: ''
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  // Fetch teams safely with TypeScript
  const fetchTeams = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, university')
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching teams:', error.message)
        toast.error(`Failed to load teams: ${error.message}`)
      } else {
        console.error('Unknown error fetching teams:', error)
        toast.error('Failed to load teams: Unknown error')
      }
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.homeTeamId === formData.awayTeamId) {
      toast.error('Home team and away team cannot be the same')
      setLoading(false)
      return
    }

    try {
      const resp = await fetch('/api/admin/matches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeamId: formData.homeTeamId,
          awayTeamId: formData.awayTeamId,
          startsAt: formData.startsAt,
          venue: formData.venue,
          status: 'UPCOMING',
          homeScore: 0,
          awayScore: 0
        })
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create match')
      }

      toast.success('Match scheduled successfully!')
      router.push('/admin')
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating match:', error.message)
        toast.error(`Failed to schedule match: ${error.message}`)
      } else {
        console.error('Unknown error creating match:', error)
        toast.error('Failed to schedule match: Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Schedule Match</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTeamId">Home Team *</Label>
                  <Select
                    value={formData.homeTeamId || ''}
                    onValueChange={(value) => handleInputChange('homeTeamId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id || ''}>
                          {team.name} ({team.university})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awayTeamId">Away Team *</Label>
                  <Select
                    value={formData.awayTeamId || ''}
                    onValueChange={(value) => handleInputChange('awayTeamId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id || ''}>
                          {team.name} ({team.university})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startsAt">Match Date & Time *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => handleInputChange('startsAt', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="Enter match venue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter match description (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Scheduling...' : 'Schedule Match'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
