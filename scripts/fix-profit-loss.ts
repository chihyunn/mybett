/**
 * Script to recalculate profitLoss for all settled bets
 * based on actual market odds
 */

import prisma from '../src/lib/db';

async function fixProfitLoss() {
  console.log('🔄 Recalculating profit/loss for settled bets...\n');

  // Get all settled bets
  const settledBets = await prisma.bet.findMany({
    where: { result: { not: null } },
  });

  console.log(`Found ${settledBets.length} settled bets\n`);

  let totalDiff = 0;
  const updates: { id: string; old: number; new: number; diff: number }[] = [];

  for (const bet of settledBets) {
    const result = bet.result as 0 | 1;
    const actualAmount = bet.actualAmount!;
    const pMarket = bet.pMarket;

    // Calculate correct profit/loss
    let correctProfitLoss: number;
    if (result === 1) {
      const odds = 1 / pMarket;
      correctProfitLoss = Math.round(actualAmount * (odds - 1));
    } else {
      correctProfitLoss = -actualAmount;
    }

    const currentProfitLoss = bet.profitLoss!;
    const diff = correctProfitLoss - currentProfitLoss;

    if (diff !== 0) {
      updates.push({
        id: bet.id,
        old: currentProfitLoss,
        new: correctProfitLoss,
        diff,
      });
      totalDiff += diff;

      // Update the bet
      await prisma.bet.update({
        where: { id: bet.id },
        data: { profitLoss: correctProfitLoss },
      });

      console.log(
        `✏️  Bet ${bet.id.slice(-8)}: pMarket=${pMarket.toFixed(2)}, ` +
        `amount=$${actualAmount}, result=${result === 1 ? 'WIN' : 'LOSS'}`
      );
      console.log(
        `    profitLoss: $${currentProfitLoss} → $${correctProfitLoss} (${diff >= 0 ? '+' : ''}${diff})\n`
      );
    }
  }

  if (updates.length === 0) {
    console.log('✅ All profit/loss values are already correct!');
    return;
  }

  // Update balance
  console.log(`📊 Updating balance by total diff: ${totalDiff >= 0 ? '+' : ''}$${totalDiff}`);

  await prisma.balance.update({
    where: { id: 'main' },
    data: {
      currentAmount: { increment: totalDiff },
      totalProfit: { increment: totalDiff },
    },
  });

  // Get updated balance
  const balance = await prisma.balance.findUnique({ where: { id: 'main' } });

  console.log(`\n✅ Done! Updated ${updates.length} bets.`);
  console.log(`💰 New balance: $${balance?.currentAmount.toLocaleString()}`);
  console.log(`📈 New total profit: $${balance?.totalProfit.toLocaleString()}`);
}

fixProfitLoss()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
