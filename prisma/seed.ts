import { PrismaClient } from '@prisma/client';
import { SPORTS, TEAMS } from '../src/data/teams';
import { BET_TYPES } from '../src/data/betTypes';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Sports and Teams
  for (const sportName of SPORTS) {
    const sport = await prisma.sport.upsert({
      where: { name: sportName },
      update: {},
      create: { name: sportName },
    });

    console.log(`✅ Created sport: ${sportName}`);

    for (const teamName of TEAMS[sportName]) {
      await prisma.team.upsert({
        where: {
          sportId_name: {
            sportId: sport.id,
            name: teamName,
          },
        },
        update: {},
        create: {
          name: teamName,
          sportId: sport.id,
        },
      });
    }

    console.log(`  - Added ${TEAMS[sportName].length} teams`);
  }

  // Create BetTypes
  for (const betType of BET_TYPES) {
    await prisma.betType.upsert({
      where: { code: betType.code },
      update: {},
      create: {
        code: betType.code,
        name: betType.name,
        description: betType.description,
      },
    });
  }

  console.log(`✅ Created ${BET_TYPES.length} bet types`);

  // Create initial Balance
  await prisma.balance.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      initialAmount: 5000,
      currentAmount: 5000,
      totalProfit: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
    },
  });

  console.log('✅ Created initial balance: $5,000');

  // Create initial Balance History entry
  const existingHistory = await prisma.balanceHistory.findFirst({
    where: { type: 'INITIAL' },
  });

  if (!existingHistory) {
    await prisma.balanceHistory.create({
      data: {
        amount: 5000,
        profit: 0,
        type: 'INITIAL',
      },
    });
    console.log('✅ Created initial balance history');
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
