"use client"

import { useEffect, useState } from "react"
// import { createAdminClient } from "@/lib/supabase/admin"
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
        // No Supabase calls - just set loading to false
        setLoading(false)
      } catch (error) {
        console.error("Error fetching admin requests:", error)
        toast.error("Failed to load admin requests")
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