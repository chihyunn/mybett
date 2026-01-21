/**
 * Script to recalculate BalanceHistory based on corrected profitLoss
 */

import prisma from '../src/lib/db';

async function fixBalanceHistory() {
  console.log('🔄 Recalculating balance history...\n');

  // Get all balance history ordered by time
  const history = await prisma.balanceHistory.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${history.length} history entries\n`);

  let runningBalance = 0;

  for (const entry of history) {
    if (entry.type === 'INITIAL') {
      runningBalance = entry.amount;
      console.log(`📍 INITIAL: $${runningBalance.toLocaleString()}`);
      continue;
    }

    // Get the bet to find correct profitLoss
    if (!entry.betId) continue;

    const bet = await prisma.bet.findUnique({
      where: { id: entry.betId },
    });

    if (!bet || bet.profitLoss === null) continue;

    const correctProfit = bet.profitLoss;
    const correctAmount = runningBalance + correctProfit;

    if (entry.profit !== correctProfit || entry.amount !== correctAmount) {
      console.log(`✏️  ${entry.type} (bet ${entry.betId.slice(-8)}):`);
      console.log(`    profit: $${entry.profit} → $${correctProfit}`);
      console.log(`    amount: $${entry.amount.toLocaleString()} → $${correctAmount.toLocaleString()}\n`);

      await prisma.balanceHistory.update({
        where: { id: entry.id },
        data: {
          profit: correctProfit,
          amount: correctAmount,
        },
      });
    } else {
      console.log(`✅ ${entry.type}: $${correctProfit} → $${correctAmount.toLocaleString()} (already correct)`);
    }

    runningBalance = correctAmount;
  }

  console.log(`\n✅ Done! Final balance: $${runningBalance.toLocaleString()}`);
}

fixBalanceHistory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
