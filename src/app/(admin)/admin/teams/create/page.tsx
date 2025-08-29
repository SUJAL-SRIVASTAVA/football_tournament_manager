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
import { ArrowLeft, Plus, Save, AlertTriangle } from 'lucide-react'

export default function CreateTeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    university: ''
  })

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAdmin(false)
        return
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Team name is required')
      return
    }
    
    if (!formData.university.trim()) {
      toast.error('University name is required')
      return
    }
    
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Check authentication status first
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw new Error('Authentication failed')
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('User authenticated:', user.id)
      
      // Check admin status again before submission
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (profileError) {
        console.error('Profile fetch error:', profileError)
        throw new Error('Failed to verify admin status')
      }
      
      if (profile?.role !== 'ADMIN') {
        throw new Error('User does not have admin privileges')
      }
      
      console.log('Admin status confirmed:', profile.role)
      
      // Prepare data for insertion
      const teamData = {
        name: formData.name.trim(),
        university: formData.university.trim()
      }
      
      console.log('Inserting team data:', teamData)
      
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()

      console.log('Supabase response:', { data, error })

      if (error) throw error

      toast.success('Team created successfully!')
      router.push('/admin')
    } catch (error: any) {
      console.error('Error creating team:', error)
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
      let errorMessage = 'Failed to create team'
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
                You don't have administrator privileges to access this page.
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
          <h1 className="text-2xl font-bold">Create New Team</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Team Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="Enter university name"
                  required
                />
              </div>

              

              

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Team'}
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
