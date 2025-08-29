import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Calendar, Trophy } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Football Tournament</h1>
        <p className="text-muted-foreground">
          Manage your tournament with live scores and real-time updates
        </p>
      </div>

      <div className="space-y-4">
        <Link href="/register">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-primary" />
                Register as Player
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join the tournament by creating your player profile
              </p>
              <Button className="w-full">Get Started</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                View Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Check upcoming fixtures and live match updates
              </p>
              <Button variant="outline" className="w-full">Browse Matches</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leaderboard">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-primary" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                See top scorers and team standings
              </p>
              <Button variant="outline" className="w-full">View Rankings</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Scan QR code to register • Live updates • Mobile optimized
        </p>
      </div>
    </div>
  )
}
