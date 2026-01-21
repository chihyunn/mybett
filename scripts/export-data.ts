/**
 * Export SQLite data to JSON for PostgreSQL migration
 * Run with: npx ts-node scripts/export-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

// Use SQLite for export - use absolute path
import * as path from 'path';
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

async function exportData() {
  console.log('Exporting data from SQLite...');

  const sports = await prisma.sport.findMany();
  const teams = await prisma.team.findMany();
  const betTypes = await prisma.betType.findMany();
  const bets = await prisma.bet.findMany();
  const balance = await prisma.balance.findMany();
  const balanceHistory = await prisma.balanceHistory.findMany();

  const data = {
    sports,
    teams,
    betTypes,
    bets,
    balance,
    balanceHistory,
    exportedAt: new Date().toISOString(),
  };

  fs.writeFileSync('prisma/seed-data.json', JSON.stringify(data, null, 2));
  console.log('Data exported to prisma/seed-data.json');
  console.log(`- Sports: ${sports.length}`);
  console.log(`- Teams: ${teams.length}`);
  console.log(`- BetTypes: ${betTypes.length}`);
  console.log(`- Bets: ${bets.length}`);
  console.log(`- Balance: ${balance.length}`);
  console.log(`- BalanceHistory: ${balanceHistory.length}`);

  await prisma.$disconnect();
}

exportData().catch(console.error);
