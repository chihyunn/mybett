import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedData {
  sports: Array<{ id: string; name: string; createdAt: string }>;
  teams: Array<{ id: string; name: string; sportId: string; createdAt: string }>;
  betTypes: Array<{ id: string; code: string; name: string; description: string | null }>;
  bets: Array<{
    id: string;
    sportId: string;
    teamAId: string;
    teamBId: string;
    selectedTeam: 'A' | 'B';
    betTypeId: string;
    pAgent: number;
    pMarket: number;
    predictedEdge: number;
    recommendedAmount: number | null;
    actualAmount: number | null;
    result: number | null;
    realizedEdge: number | null;
    profitLoss: number | null;
    createdAt: string;
    settledAt: string | null;
  }>;
  balance: Array<{
    id: string;
    initialAmount: number;
    currentAmount: number;
    totalProfit: number;
    totalBets: number;
    wins: number;
    losses: number;
  }>;
  balanceHistory: Array<{
    id: string;
    amount: number;
    profit: number;
    betId: string | null;
    type: string;
    createdAt: string;
  }>;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Check if seed-data.json exists (migration mode)
  const seedDataPath = path.join(__dirname, 'seed-data.json');

  if (fs.existsSync(seedDataPath)) {
    console.log('📦 Found seed-data.json - restoring data from backup...');

    const data: SeedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    // Clear existing data in correct order (respect foreign keys)
    await prisma.balanceHistory.deleteMany();
    await prisma.bet.deleteMany();
    await prisma.balance.deleteMany();
    await prisma.team.deleteMany();
    await prisma.betType.deleteMany();
    await prisma.sport.deleteMany();

    // Restore Sports
    for (const sport of data.sports) {
      await prisma.sport.create({
        data: {
          id: sport.id,
          name: sport.name,
          createdAt: new Date(sport.createdAt),
        },
      });
    }
    console.log(`✅ Restored ${data.sports.length} sports`);

    // Restore Teams
    for (const team of data.teams) {
      await prisma.team.create({
        data: {
          id: team.id,
          name: team.name,
          sportId: team.sportId,
          createdAt: new Date(team.createdAt),
        },
      });
    }
    console.log(`✅ Restored ${data.teams.length} teams`);

    // Restore BetTypes
    for (const betType of data.betTypes) {
      await prisma.betType.create({
        data: {
          id: betType.id,
          code: betType.code,
          name: betType.name,
          description: betType.description,
        },
      });
    }
    console.log(`✅ Restored ${data.betTypes.length} bet types`);

    // Restore Bets
    for (const bet of data.bets) {
      await prisma.bet.create({
        data: {
          id: bet.id,
          sportId: bet.sportId,
          teamAId: bet.teamAId,
          teamBId: bet.teamBId,
          selectedTeam: bet.selectedTeam,
          betTypeId: bet.betTypeId,
          pAgent: bet.pAgent,
          pMarket: bet.pMarket,
          predictedEdge: bet.predictedEdge,
          recommendedAmount: bet.recommendedAmount,
          actualAmount: bet.actualAmount,
          result: bet.result,
          realizedEdge: bet.realizedEdge,
          profitLoss: bet.profitLoss,
          createdAt: new Date(bet.createdAt),
          settledAt: bet.settledAt ? new Date(bet.settledAt) : null,
        },
      });
    }
    console.log(`✅ Restored ${data.bets.length} bets`);

    // Restore Balance
    for (const bal of data.balance) {
      await prisma.balance.create({
        data: {
          id: bal.id,
          initialAmount: bal.initialAmount,
          currentAmount: bal.currentAmount,
          totalProfit: bal.totalProfit,
          totalBets: bal.totalBets,
          wins: bal.wins,
          losses: bal.losses,
        },
      });
    }
    console.log(`✅ Restored balance`);

    // Restore BalanceHistory
    for (const history of data.balanceHistory) {
      await prisma.balanceHistory.create({
        data: {
          id: history.id,
          amount: history.amount,
          profit: history.profit,
          betId: history.betId,
          type: history.type,
          createdAt: new Date(history.createdAt),
        },
      });
    }
    console.log(`✅ Restored ${data.balanceHistory.length} balance history records`);

  } else {
    console.log('🆕 No seed-data.json found - creating fresh database...');

    // Import default data
    const { SPORTS, TEAMS } = await import('../src/data/teams');
    const { BET_TYPES } = await import('../src/data/betTypes');

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
