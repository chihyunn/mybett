/**
 * Add NFL sport and teams to database
 * Run with: npx tsx scripts/add-nfl.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NFL_TEAMS = [
  // AFC East
  'Buffalo Bills',
  'Miami Dolphins',
  'New England Patriots',
  'New York Jets',
  // AFC North
  'Baltimore Ravens',
  'Cincinnati Bengals',
  'Cleveland Browns',
  'Pittsburgh Steelers',
  // AFC South
  'Houston Texans',
  'Indianapolis Colts',
  'Jacksonville Jaguars',
  'Tennessee Titans',
  // AFC West
  'Denver Broncos',
  'Kansas City Chiefs',
  'Las Vegas Raiders',
  'Los Angeles Chargers',
  // NFC East
  'Dallas Cowboys',
  'New York Giants',
  'Philadelphia Eagles',
  'Washington Commanders',
  // NFC North
  'Chicago Bears',
  'Detroit Lions',
  'Green Bay Packers',
  'Minnesota Vikings',
  // NFC South
  'Atlanta Falcons',
  'Carolina Panthers',
  'New Orleans Saints',
  'Tampa Bay Buccaneers',
  // NFC West
  'Arizona Cardinals',
  'Los Angeles Rams',
  'San Francisco 49ers',
  'Seattle Seahawks',
];

async function main() {
  console.log('🏈 Adding NFL to database...');

  // Create NFL sport
  const nfl = await prisma.sport.upsert({
    where: { name: 'NFL' },
    update: {},
    create: { name: 'NFL' },
  });

  console.log(`✅ Created sport: NFL (${nfl.id})`);

  // Add teams
  let count = 0;
  for (const teamName of NFL_TEAMS) {
    await prisma.team.upsert({
      where: {
        sportId_name: {
          sportId: nfl.id,
          name: teamName,
        },
      },
      update: {},
      create: {
        name: teamName,
        sportId: nfl.id,
      },
    });
    count++;
  }

  console.log(`✅ Added ${count} NFL teams`);
  console.log('🎉 Done!');

  await prisma.$disconnect();
}

main().catch(console.error);
