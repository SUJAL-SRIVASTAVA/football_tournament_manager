export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          fullName: string
          university: string
          role: 'PLAYER' | 'ADMIN'
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          username: string
          fullName: string
          university: string
          role?: 'PLAYER' | 'ADMIN'
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          username?: string
          fullName?: string
          university?: string
          role?: 'PLAYER' | 'ADMIN'
          createdAt?: string
          updatedAt?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          university: string
          groupLabel: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          university: string
          groupLabel?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          university?: string
          groupLabel?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      players: {
        Row: {
          id: string
          profileId: string
          teamId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          profileId: string
          teamId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          profileId?: string
          teamId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      matches: {
        Row: {
          id: string
          homeTeamId: string
          awayTeamId: string
          startsAt: string
          venue: string
          status: 'UPCOMING' | 'LIVE' | 'DONE'
          homeScore: number
          awayScore: number
          groupLabel: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          homeTeamId: string
          awayTeamId: string
          startsAt: string
          venue: string
          status?: 'UPCOMING' | 'LIVE' | 'DONE'
          homeScore?: number
          awayScore?: number
          groupLabel?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          homeTeamId?: string
          awayTeamId?: string
          startsAt?: string
          venue?: string
          status?: 'UPCOMING' | 'LIVE' | 'DONE'
          homeScore?: number
          awayScore?: number
          groupLabel?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      goals: {
        Row: {
          id: string
          matchId: string
          playerId: string
          minute: number
          ownGoal: boolean
          createdAt: string
        }
        Insert: {
          id?: string
          matchId: string
          playerId: string
          minute: number
          ownGoal?: boolean
          createdAt?: string
        }
        Update: {
          id?: string
          matchId?: string
          playerId?: string
          minute?: number
          ownGoal?: boolean
          createdAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

