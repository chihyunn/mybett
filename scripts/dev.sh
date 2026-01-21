#!/bin/bash

# Local development script - switches Prisma to SQLite

echo "🔧 Setting up local development (SQLite)..."

# Switch schema to SQLite
sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Generate Prisma client
npx prisma generate

echo "✅ Ready! Starting dev server..."

# Run Next.js dev server
npx next dev

# On exit, restore PostgreSQL schema
echo "🔄 Restoring PostgreSQL schema..."
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
npx prisma generate
