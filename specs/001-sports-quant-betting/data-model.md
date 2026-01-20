# Data Model: Sports Quant Betting Control System

**Date**: 2026-01-21
**Feature**: 001-sports-quant-betting

## Entity Relationship Diagram

```
┌─────────────┐       1:N       ┌─────────────┐
│   Sport     │────────────────▶│    Team     │
└─────────────┘                 └─────────────┘
      │                               │
      │ 1:N                      teamA│1:N  teamB│1:N
      ▼                               ▼          ▼
┌──────────────────────────────────────────────────────┐
│                         Bet                           │
│  (sportId, teamAId, teamBId, selectedTeam, betType)  │
│  - teamA vs teamB 매치업                              │
│  - selectedTeam: 어느 팀에 베팅했는지 (A or B)         │
└──────────────────────────────────────────────────────┘
                      │
                      │ aggregates to (both teams)
                      ▼
┌─────────────────────────────────────────────┐
│              EdgeAnalysis                    │
│  (computed view, not stored)                │
└─────────────────────────────────────────────┘

┌─────────────┐
│   Balance   │  (singleton - 1 record)
└─────────────┘
```

## Entities

### Sport

스포츠 타입 (NBA, NHL, MLB)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (cuid) | PK | 고유 식별자 |
| name | String | UNIQUE, NOT NULL | 스포츠명 (NBA, NHL, MLB) |
| teams | Team[] | - | 소속 팀 목록 (relation) |
| bets | Bet[] | - | 해당 스포츠 베팅 기록 (relation) |
| createdAt | DateTime | DEFAULT NOW | 생성일시 |

### Team

팀 정보

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (cuid) | PK | 고유 식별자 |
| name | String | NOT NULL | 팀명 |
| sportId | String | FK → Sport | 소속 스포츠 |
| sport | Sport | - | 스포츠 (relation) |
| betsAsTeamA | Bet[] | - | 팀A로 참여한 베팅 (relation) |
| betsAsTeamB | Bet[] | - | 팀B로 참여한 베팅 (relation) |
| createdAt | DateTime | DEFAULT NOW | 생성일시 |

**Unique Constraint**: (sportId, name) - 같은 스포츠 내 팀명 중복 불가

### Bet

개별 베팅 기록 (매치업 기반)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (cuid) | PK | 고유 식별자 |
| sportId | String | FK → Sport | 스포츠 |
| teamAId | String | FK → Team | 팀A (매치업) |
| teamBId | String | FK → Team | 팀B (매치업) |
| selectedTeam | Enum | NOT NULL | 베팅 대상 팀 (A or B) |
| betTypeId | String | FK → BetType | 베팅 타입 |
| pAgent | Float | NOT NULL, 0~1 | 에이전트 확률 |
| pMarket | Float | NOT NULL, 0~1 | 시장 확률 |
| predictedEdge | Float | NOT NULL | 예측 에지 (Δp = pAgent - pMarket) |
| recommendedAmount | Int | NULLABLE | 추천 금액 ($200/$250/$350 or null) |
| actualAmount | Int | NULLABLE | 실제 베팅 금액 |
| result | Int | NULLABLE, 0 or 1 | 결과 (null=미정, 0=패, 1=승) |
| realizedEdge | Float | NULLABLE | 실현 에지 (Δr = result - pMarket) |
| profitLoss | Float | NULLABLE | 수익/손실 |
| createdAt | DateTime | DEFAULT NOW | 생성일시 |
| settledAt | DateTime | NULLABLE | 결과 입력일시 |

**예시**: Lakers vs Celtics, Lakers +핸디캡 베팅
- teamAId: Lakers
- teamBId: Celtics
- selectedTeam: A
- betType: SPREAD_PLUS

**Indexes**:
- sportId (분석 필터)
- teamAId, teamBId (팀별 분석 - 양쪽 모두)
- createdAt (시간순 조회)

### BetType

베팅 타입 (정규화된 테이블)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (cuid) | PK | 고유 식별자 |
| code | String | UNIQUE, NOT NULL | 코드 (SPREAD_PLUS, SPREAD_MINUS, OVER, UNDER) |
| name | String | NOT NULL | 표시명 |
| description | String | NULLABLE | 설명 |
| bets | Bet[] | - | 해당 타입 베팅 기록 (relation) |

**초기 데이터**:
| code | name | description |
|------|------|-------------|
| SPREAD_PLUS | +핸디캡 | 언더독 스프레드 베팅 |
| SPREAD_MINUS | -핸디캡 | 페이버릿 스프레드 베팅 |
| OVER | 오버 | 토탈 오버 베팅 |
| UNDER | 언더 | 토탈 언더 베팅 |

### SelectedTeam (Enum)

| Value | Description |
|-------|-------------|
| A | 팀A에 베팅 |
| B | 팀B에 베팅 |

### Balance

사용자 밸런스 상태 (싱글톤 - 1개 레코드)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, DEFAULT "main" | 고유 식별자 |
| initialAmount | Float | NOT NULL, DEFAULT 5000 | 시작 금액 |
| currentAmount | Float | NOT NULL, DEFAULT 5000 | 현재 금액 |
| totalProfit | Float | NOT NULL, DEFAULT 0 | 누적 수익 |
| totalBets | Int | NOT NULL, DEFAULT 0 | 총 베팅 수 |
| wins | Int | NOT NULL, DEFAULT 0 | 승리 수 |
| losses | Int | NOT NULL, DEFAULT 0 | 패배 수 |
| updatedAt | DateTime | DEFAULT NOW | 최종 업데이트 |

## Computed Views (Not Stored)

### EdgeAnalysis

팀별/전체 에지 분석 (쿼리 시 집계)

| Field | Type | Description |
|-------|------|-------------|
| level | String | 분석 레벨 ("team" or "portfolio") |
| sportId | String? | 스포츠 (팀별 분석 시) |
| teamId | String? | 팀 (팀별 분석 시) |
| teamName | String? | 팀명 |
| betCount | Int | 총 베팅 수 |
| avgPredictedEdge | Float | 평균 Δp |
| avgRealizedEdge | Float | 평균 Δr |
| edgeError | Float | 오차 (avgΔp - avgΔr) |
| winRate | Float | 승률 |

**계산 쿼리 예시**:
```sql
-- 팀별 분석 (해당 팀이 teamA 또는 teamB로 참여한 모든 베팅)
SELECT
  t.id as teamId,
  t.name as teamName,
  COUNT(*) as betCount,
  AVG(b.predictedEdge) as avgPredictedEdge,
  AVG(b.realizedEdge) as avgRealizedEdge,
  AVG(b.predictedEdge) - AVG(b.realizedEdge) as edgeError
FROM Team t
JOIN Bet b ON (b.teamAId = t.id OR b.teamBId = t.id)
WHERE b.result IS NOT NULL
GROUP BY t.id, t.name
HAVING COUNT(*) >= 10;

-- 베팅타입별 분석
SELECT
  bt.code as betType,
  bt.name as betTypeName,
  COUNT(*) as betCount,
  AVG(b.predictedEdge) as avgPredictedEdge,
  AVG(b.realizedEdge) as avgRealizedEdge,
  AVG(b.predictedEdge) - AVG(b.realizedEdge) as edgeError
FROM BetType bt
JOIN Bet b ON b.betTypeId = bt.id
WHERE b.result IS NOT NULL
GROUP BY bt.id, bt.code, bt.name;

-- 팀 + 베팅타입 복합 분석 (예: Lakers +핸디캡 정확도)
SELECT
  t.name as teamName,
  bt.name as betTypeName,
  COUNT(*) as betCount,
  AVG(b.predictedEdge) as avgPredictedEdge,
  AVG(b.realizedEdge) as avgRealizedEdge
FROM Team t
JOIN Bet b ON (b.teamAId = t.id OR b.teamBId = t.id)
JOIN BetType bt ON b.betTypeId = bt.id
WHERE b.result IS NOT NULL
GROUP BY t.id, t.name, bt.id, bt.name
HAVING COUNT(*) >= 5;

-- 전체 포트폴리오
SELECT
  COUNT(*) as betCount,
  AVG(predictedEdge) as avgPredictedEdge,
  AVG(realizedEdge) as avgRealizedEdge,
  AVG(predictedEdge) - AVG(realizedEdge) as edgeError
FROM Bet
WHERE result IS NOT NULL;
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Sport {
  id        String   @id @default(cuid())
  name      String   @unique
  teams     Team[]
  bets      Bet[]
  createdAt DateTime @default(now())
}

model Team {
  id           String   @id @default(cuid())
  name         String
  sportId      String
  sport        Sport    @relation(fields: [sportId], references: [id])
  betsAsTeamA  Bet[]    @relation("TeamA")
  betsAsTeamB  Bet[]    @relation("TeamB")
  createdAt    DateTime @default(now())

  @@unique([sportId, name])
}

model BetType {
  id          String  @id @default(cuid())
  code        String  @unique
  name        String
  description String?
  bets        Bet[]
}

enum SelectedTeam {
  A
  B
}

model Bet {
  id                String       @id @default(cuid())
  sportId           String
  sport             Sport        @relation(fields: [sportId], references: [id])
  teamAId           String
  teamA             Team         @relation("TeamA", fields: [teamAId], references: [id])
  teamBId           String
  teamB             Team         @relation("TeamB", fields: [teamBId], references: [id])
  selectedTeam      SelectedTeam
  betTypeId         String
  betType           BetType      @relation(fields: [betTypeId], references: [id])
  pAgent            Float
  pMarket           Float
  predictedEdge     Float
  recommendedAmount Int?
  actualAmount      Int?
  result            Int?         // 0 or 1
  realizedEdge      Float?
  profitLoss        Float?
  createdAt         DateTime     @default(now())
  settledAt         DateTime?

  @@index([sportId])
  @@index([teamAId])
  @@index([teamBId])
  @@index([betTypeId])
  @@index([createdAt])
}

model Balance {
  id            String   @id @default("main")
  initialAmount Float    @default(5000)
  currentAmount Float    @default(5000)
  totalProfit   Float    @default(0)
  totalBets     Int      @default(0)
  wins          Int      @default(0)
  losses        Int      @default(0)
  updatedAt     DateTime @default(now()) @updatedAt
}
```

## Validation Rules

### Bet Creation
- `pAgent`: 0.00 ≤ x ≤ 1.00
- `pMarket`: 0.00 ≤ x ≤ 1.00
- `sportId`: 존재하는 Sport 참조
- `teamAId`, `teamBId`: 존재하는 Team 참조, 해당 Sport 소속
- `teamAId` ≠ `teamBId`: 같은 팀끼리 매치업 불가
- `selectedTeam`: A 또는 B
- `betTypeId`: 존재하는 BetType 참조

### Result Input
- `result`: 0 (패배) 또는 1 (승리)
- `actualAmount`: 양수
- 베팅 결과 입력 시 Balance 자동 업데이트

## State Transitions

### Bet Lifecycle

```
[CREATED] → [SETTLED]
    │           │
    │           └── result 입력됨
    │               realizedEdge 계산됨
    │               Balance 업데이트됨
    │
    └── result = null
        realizedEdge = null
```

### Balance Update (결과 입력 시)

```
IF result = 1 (승리):
  currentAmount += actualAmount
  totalProfit += actualAmount
  wins += 1

IF result = 0 (패배):
  currentAmount -= actualAmount
  totalProfit -= actualAmount
  losses += 1

totalBets += 1
```
