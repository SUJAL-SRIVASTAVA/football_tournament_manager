// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { createClient } from '@/lib/supabase/client'
// import { toast } from 'sonner'
// import { ArrowLeft, Check, X, Clock, UserCheck, AlertTriangle } from 'lucide-react'

// interface AdminRequest {
//   id: string
//   userId: string
//   user: {
//     email: string
//     profile: {
//       fullName: string
//       username: string
//       university: string
//     }
//   }
//   status: 'PENDING' | 'APPROVED' | 'REJECTED'
//   requestedAt: string
//   reviewedBy?: string
//   reviewedAt?: string
//   reason?: string
// }

// export default function AdminConfirmationPage() {
//   const router = useRouter()
//   const [requests, setRequests] = useState<AdminRequest[]>([])
//   const [loading, setLoading] = useState(true)
//   const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
//   const [authLoading, setAuthLoading] = useState(true)

//   useEffect(() => {
//     checkAdminStatus()
//   }, [])

//   useEffect(() => {
//     if (isAdmin) {
//       fetchAdminRequests()
//     }
//   }, [isAdmin])

//   const checkAdminStatus = async () => {
//     try {
//       const supabase = createClient()
      
//       const { data: { user } } = await supabase.auth.getUser()
      
//       if (!user) {
//         setIsAdmin(false)
//         return
//       }

//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('role')
//         .eq('id', user.id)
//         .single()

//       setIsAdmin(profile?.role === 'ADMIN')
//     } catch (error) {
//       console.error('Error checking admin status:', error)
//       setIsAdmin(false)
//     } finally {
//       setAuthLoading(false)
//     }
//   }

//   const fetchAdminRequests = async () => {
//     try {
//       const supabase = createClient()
//       const { data, error } = await supabase
//         .from('admin_requests')
//         .select(`
//           id,
//           userId,
//           status,
//           requestedAt,
//           reviewedBy,
//           reviewedAt,
//           reason,
//           user:profiles!userId(
//             email,
//             fullName,
//             username,
//             university
//           )
//         `)
//         .order('requestedAt', { ascending: false })

//       if (error) throw error
//       const normalized: AdminRequest[] = (data || []).map((r: any) => ({
//         id: r.id,
//         userId: r.userId,
//         status: r.status,
//         requestedAt: r.requestedAt,
//         reviewedBy: r.reviewedBy,
//         reviewedAt: r.reviewedAt,
//         reason: r.reason,
//         user: {
//           email: r.user?.email ?? '',
//           profile: {
//             fullName: r.user?.fullName ?? '',
//             username: r.user?.username ?? '',
//             university: r.user?.university ?? ''
//           }
//         }
//       }))
//       setRequests(normalized)
//     } catch (error) {
//       console.error('Error fetching admin requests:', error)
//       toast.error('Failed to load admin requests')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleApproveRequest = async (requestId: string, userId: string) => {
//     try {
//       const supabase = createClient()
      
//       // Update the admin request status
//       const { error: requestError } = await supabase
//         .from('admin_requests')
//         .update({
//           status: 'APPROVED',
//           reviewedBy: (await supabase.auth.getUser()).data.user?.id,
//           reviewedAt: new Date().toISOString()
//         })
//         .eq('id', requestId)

//       if (requestError) throw requestError

//       // Update the user's role to ADMIN
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .update({ role: 'ADMIN' })
//         .eq('id', userId)

//       if (profileError) throw profileError

//       toast.success('Admin request approved successfully!')
//       fetchAdminRequests()
//     } catch (error) {
//       console.error('Error approving admin request:', error)
//       toast.error('Failed to approve admin request')
//     }
//   }

//   const handleRejectRequest = async (requestId: string, _userId: string) => {
//     try {
//       const supabase = createClient()
      
//       const { error } = await supabase
//         .from('admin_requests')
//         .update({
//           status: 'REJECTED',
//           reviewedBy: (await supabase.auth.getUser()).data.user?.id,
//           reviewedAt: new Date().toISOString()
//         })
//         .eq('id', requestId)

//       if (error) throw error

//       toast.success('Admin request rejected!')
//       fetchAdminRequests()
//     } catch (error) {
//       console.error('Error rejecting admin request:', error)
//       toast.error('Failed to reject admin request')
//     }
//   }

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'PENDING':
//         return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>
//       case 'APPROVED':
//         return <Badge variant="default" className="flex items-center gap-1"><Check className="h-3 w-3" />Approved</Badge>
//       case 'REJECTED':
//         return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" />Rejected</Badge>
//       default:
//         return <Badge variant="secondary">{status}</Badge>
//     }
//   }

//   if (authLoading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">Checking admin privileges...</div>
//       </div>
//     )
//   }

//   if (!isAdmin) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-md mx-auto">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-red-600">
//                 <AlertTriangle className="h-5 w-5" />
//                 Access Denied
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <p className="text-muted-foreground">
//                 You don&apos;t have administrator privileges to access this page.
//               </p>
//               <Button onClick={() => router.push('/')} className="w-full">
//                 Go Home
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">Loading admin requests...</div>
//       </div>
//     )
//   }

//   const pendingRequests = requests.filter(req => req.status === 'PENDING')
//   const processedRequests = requests.filter(req => req.status !== 'PENDING')

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center gap-4 mb-6">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => router.push('/admin')}
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Dashboard
//           </Button>
//           <h1 className="text-2xl font-bold">Admin Role Confirmation</h1>
//         </div>

//         {/* Pending Requests */}
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Clock className="h-5 w-5" />
//               Pending Requests ({pendingRequests.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {pendingRequests.length === 0 ? (
//               <p className="text-muted-foreground text-center py-8">
//                 No pending admin requests
//               </p>
//             ) : (
//               <div className="space-y-4">
//                 {pendingRequests.map((request) => (
//                   <div key={request.id} className="border rounded-lg p-4">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <h3 className="font-medium">{request.user.profile.fullName}</h3>
//                         <p className="text-sm text-muted-foreground">
//                           @{request.user.profile.username} • {request.user.profile.university}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {request.user.email}
//                         </p>
//                         <p className="text-sm text-muted-foreground mt-2">
//                           Requested: {new Date(request.requestedAt).toLocaleString()}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {getStatusBadge(request.status)}
//                         <div className="flex gap-2">
//                           <Button
//                             size="sm"
//                             onClick={() => handleApproveRequest(request.id, request.userId)}
//                           >
//                             <Check className="h-4 w-4 mr-1" />
//                             Approve
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => handleRejectRequest(request.id, request.userId)}
//                           >
//                             <X className="h-4 w-4 mr-1" />
//                             Reject
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Processed Requests */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <UserCheck className="h-5 w-5" />
//               Processed Requests ({processedRequests.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {processedRequests.length === 0 ? (
//               <p className="text-muted-foreground text-center py-8">
//                 No processed admin requests
//               </p>
//             ) : (
//               <div className="space-y-4">
//                 {processedRequests.map((request) => (
//                   <div key={request.id} className="border rounded-lg p-4">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <h3 className="font-medium">{request.user.profile.fullName}</h3>
//                         <p className="text-sm text-muted-foreground">
//                           @{request.user.profile.username} • {request.user.profile.university}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {request.user.email}
//                         </p>
//                         <div className="flex gap-4 text-sm text-muted-foreground mt-2">
//                           <span>Requested: {new Date(request.requestedAt).toLocaleString()}</span>
//                           {request.reviewedAt && (
//                             <span>Reviewed: {new Date(request.reviewedAt).toLocaleString()}</span>
//                           )}
//                         </div>
//                         {request.reason && (
//                           <p className="text-sm text-muted-foreground mt-1">
//                             Reason: {request.reason}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {getStatusBadge(request.status)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// 


"use client"

import { useEffect, useState } from "react"
import { createAdminClient } from "@/lib/supabase/admin"
import { toast } from "sonner"

// ✅ Cleaned-up AdminRequest type
type AdminRequest = {
  id: string
  userId: string
  status: string
  requestedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  reason: string | null
  user: {
    email: string
    fullName: string
    username: string
    university: string
  }
}

export default function ConfirmAdminPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(false)
        // Commented out to avoid Supabase calls
        /*
        const supabase = createAdminClient()
        const { data, error } = await supabase
          .from("admin_requests")
          .select(`
            id,
            userId,
            status,
            requestedAt,
            reviewedBy,
            reviewedAt,
            reason,
            user (
              email,
              fullName,
              username,
              university
            )
          `)

        if (error) throw error

        const formatted = (data || []).map((req: any) => {
          const userData = Array.isArray(req.user) ? req.user[0] : req.user;
          
          return {
            ...req,
            user: {
              email: userData?.email ?? "",
              fullName: userData?.fullName ?? "",
              username: userData?.username ?? "",
              university: userData?.university ?? "",
            },
          };
        })

        setRequests(formatted)
        */
      } catch (error) {
        console.error("Error fetching admin requests:", error)
        toast.error("Failed to load admin requests")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Requests</h1>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req.id} className="border p-4 rounded-lg shadow">
              <p><strong>Email:</strong> {req.user.email}</p>
              <p><strong>Full Name:</strong> {req.user.fullName}</p>
              <p><strong>Username:</strong> {req.user.username}</p>
              <p><strong>University:</strong> {req.user.university}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <p><strong>Requested At:</strong> {req.requestedAt}</p>
              {req.reason && <p><strong>Reason:</strong> {req.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}