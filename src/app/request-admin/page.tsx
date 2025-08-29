'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Shield, Clock, Check, X, AlertTriangle } from 'lucide-react'

interface AdminRequest {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  reviewedAt?: string
  reason?: string
}

export default function RequestAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adminRequest, setAdminRequest] = useState<AdminRequest | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user is already admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'ADMIN')

      // If not admin, check for existing request
      if (profile?.role !== 'ADMIN') {
        await fetchAdminRequest()
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchAdminRequest = async () => {
    try {
      const response = await fetch('/api/admin/request')
      const data = await response.json()
      
      if (response.ok) {
        setAdminRequest(data.adminRequest)
      }
    } catch (error) {
      console.error('Error fetching admin request:', error)
    }
  }

  const handleRequestAdmin = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        await fetchAdminRequest()
      } else {
        toast.error(data.error || 'Failed to submit admin request')
      }
    } catch (error) {
      console.error('Error submitting admin request:', error)
      toast.error('Failed to submit admin request')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="flex items-center gap-1"><Check className="h-3 w-3" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Shield className="h-5 w-5" />
                Already an Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You already have administrator privileges. You can access the admin dashboard.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => router.push('/admin')} className="flex-1">
                  Go to Admin Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                  Go Home
                </Button>
              </div>
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
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Request Admin Access</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Access Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Admin access allows you to manage teams, matches, and players</li>
                <li>• Your request will be reviewed by existing administrators</li>
                <li>• You will be notified once your request is approved or rejected</li>
                <li>• Only verified users can be granted admin privileges</li>
              </ul>
            </div>

            {adminRequest ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Your Request Status</h3>
                  {getStatusBadge(adminRequest.status)}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested:</span>
                      <span>{new Date(adminRequest.requestedAt).toLocaleString()}</span>
                    </div>
                    {adminRequest.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reviewed:</span>
                        <span>{new Date(adminRequest.reviewedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {adminRequest.reason && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reason:</span>
                        <span className="text-right">{adminRequest.reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {adminRequest.status === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Your request is pending review</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please wait for an existing administrator to review your request. You will be notified once a decision is made.
                    </p>
                  </div>
                )}

                {adminRequest.status === 'APPROVED' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Your request has been approved!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You now have administrator privileges. You can access the admin dashboard.
                    </p>
                    <Button 
                      onClick={() => router.push('/admin')} 
                      className="mt-3"
                    >
                      Go to Admin Dashboard
                    </Button>
                  </div>
                )}

                {adminRequest.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">Your request has been rejected</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      {adminRequest.reason || 'Your admin access request has been rejected. You may try again later.'}
                    </p>
                    <Button 
                      onClick={handleRequestAdmin} 
                      variant="outline"
                      className="mt-3"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit New Request'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Submit a request to become an administrator. This will allow you to manage the tournament, including creating teams, scheduling matches, and managing players.
                </p>
                
                <Button 
                  onClick={handleRequestAdmin} 
                  className="w-full"
                  disabled={loading}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting Request...' : 'Request Admin Access'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}








