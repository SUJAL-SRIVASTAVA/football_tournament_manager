import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin profile
  const adminProfile = await prisma.profile.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'Tournament Admin',
      university: 'University of Technology',
      role: 'ADMIN',
    },
  })

  // Create teams
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { name: 'Tech Titans' },
      update: {},
      create: {
        name: 'Tech Titans',
        university: 'University of Technology',
        groupLabel: 'A',
      },
    }),
    prisma.team.upsert({
      where: { name: 'Digital Dragons' },
      update: {},
      create: {
        name: 'Digital Dragons',
        university: 'Digital University',
        groupLabel: 'A',
      },
    }),
    prisma.team.upsert({
      where: { name: 'Code Crushers' },
      update: {},
      create: {
        name: 'Code Crushers',
        university: 'Coding Institute',
        groupLabel: 'B',
      },
    }),
    prisma.team.upsert({
      where: { name: 'Byte Busters' },
      update: {},
      create: {
        name: 'Byte Busters',
        university: 'Byte University',
        groupLabel: 'B',
      },
    }),
  ])

  // Create player profiles
  const players = await Promise.all([
    prisma.profile.upsert({
      where: { username: 'john_doe' },
      update: {},
      create: {
        username: 'john_doe',
        fullName: 'John Doe',
        university: 'University of Technology',
        role: 'PLAYER',
      },
    }),
    prisma.profile.upsert({
      where: { username: 'jane_smith' },
      update: {},
      create: {
        username: 'jane_smith',
        fullName: 'Jane Smith',
        university: 'Digital University',
        role: 'PLAYER',
      },
    }),
    prisma.profile.upsert({
      where: { username: 'bob_wilson' },
      update: {},
      create: {
        username: 'bob_wilson',
        fullName: 'Bob Wilson',
        university: 'Coding Institute',
        role: 'PLAYER',
      },
    }),
    prisma.profile.upsert({
      where: { username: 'alice_brown' },
      update: {},
      create: {
        username: 'alice_brown',
        fullName: 'Alice Brown',
        university: 'Byte University',
        role: 'PLAYER',
      },
    }),
  ])

  // Create player records
  const playerRecords = await Promise.all([
    prisma.player.upsert({
      where: { profileId: players[0].id },
      update: {},
      create: {
        profileId: players[0].id,
        teamId: teams[0].id,
      },
    }),
    prisma.player.upsert({
      where: { profileId: players[1].id },
      update: {},
      create: {
        profileId: players[1].id,
        teamId: teams[1].id,
      },
    }),
    prisma.player.upsert({
      where: { profileId: players[2].id },
      update: {},
      create: {
        profileId: players[2].id,
        teamId: teams[2].id,
      },
    }),
    prisma.player.upsert({
      where: { profileId: players[3].id },
      update: {},
      create: {
        profileId: players[3].id,
        teamId: teams[3].id,
      },
    }),
  ])

  // Create matches
  const matches = await Promise.all([
    prisma.match.create({
      data: {
        homeTeamId: teams[0].id,
        awayTeamId: teams[1].id,
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        venue: 'Main Stadium',
        status: 'UPCOMING',
        groupLabel: 'A',
      },
    }),
    prisma.match.create({
      data: {
        homeTeamId: teams[2].id,
        awayTeamId: teams[3].id,
        startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        venue: 'Training Ground',
        status: 'UPCOMING',
        groupLabel: 'B',
      },
    }),
    prisma.match.create({
      data: {
        homeTeamId: teams[0].id,
        awayTeamId: teams[2].id,
        startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        venue: 'Main Stadium',
        status: 'DONE',
        homeScore: 2,
        awayScore: 1,
        groupLabel: 'A',
      },
    }),
  ])

  // Create goals for the completed match
  await Promise.all([
    prisma.goal.create({
      data: {
        matchId: matches[2].id,
        playerId: playerRecords[0].id,
        minute: 15,
        ownGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        matchId: matches[2].id,
        playerId: playerRecords[0].id,
        minute: 67,
        ownGoal: false,
      },
    }),
    prisma.goal.create({
      data: {
        matchId: matches[2].id,
        playerId: playerRecords[2].id,
        minute: 89,
        ownGoal: false,
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${teams.length} teams, ${players.length} players, ${matches.length} matches`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

