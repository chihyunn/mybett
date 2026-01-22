# Tasks: Sports Quant Betting Control System

**Input**: Design documents from `/specs/001-sports-quant-betting/`
**Prerequisites**: plan.md, spec.md, data-model.md

**Tests**: Unit tests included for core business logic (Edge 계산, 베팅 추천) as per Constitution III requirement.

**Organization**: Tasks grouped by user story. US1+US2 combined as they're tightly coupled (Edge 계산 → 즉시 추천).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Next.js + Prisma + SQLite 프로젝트 초기화

- [x] T001 Initialize Next.js 14+ project with TypeScript in repository root
- [x] T002 Install dependencies: prisma, @prisma/client, tailwindcss, vitest
- [x] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [x] T004 [P] Configure Tailwind CSS in tailwind.config.ts and src/app/globals.css
- [x] T005 [P] Configure Vitest in vitest.config.ts
- [x] T006 Create .env file with DATABASE_URL="file:./dev.db"

---

## Phase 2: Foundational (Database & Core Infrastructure)

**Purpose**: DB 스키마, 시드 데이터, 핵심 비즈니스 로직 - 모든 User Story의 기반

**⚠️ CRITICAL**: 이 Phase 완료 전까지 User Story 작업 불가

- [x] T007 Create Prisma schema in prisma/schema.prisma (Sport, Team, BetType, Bet, Balance models per data-model.md)
- [x] T008 Run prisma migrate dev to create SQLite database
- [x] T009 [P] Create static team data in src/data/teams.ts (NBA 30팀, NHL 32팀, MLB 30팀)
- [x] T010 [P] Create BetType seed data in src/data/betTypes.ts (SPREAD_PLUS, SPREAD_MINUS, OVER, UNDER)
- [x] T011 Create Prisma seed script in prisma/seed.ts (Sport, Team, BetType, initial Balance)
- [x] T012 Run prisma db seed to populate initial data
- [x] T013 [P] Create Prisma client singleton in src/lib/db.ts
- [x] T014 [P] Implement Edge calculation functions in src/lib/edge.ts (calculatePredictedEdge, calculateRealizedEdge)
- [x] T015 [P] Implement betting recommendation logic in src/lib/betting.ts (recommendBetAmount with balance awareness)
- [x] T016 [P] Write unit tests for edge.ts in tests/unit/edge.test.ts
- [x] T017 [P] Write unit tests for betting.ts in tests/unit/betting.test.ts

**Checkpoint**: 데이터베이스 준비 완료, 핵심 로직 테스트 통과

---

## Phase 3: User Story 1+2 - 예측 입력 & 베팅 추천 (Priority: P1) 🎯 MVP

**Goal**: 스포츠/매치업/베팅타입 선택 → 확률 입력 → Edge 계산 → 베팅 금액 추천

**Independent Test**: 예측 입력 화면에서 확률 입력 시 Edge와 추천 금액이 즉시 표시됨

### API Routes

- [x] T018 [P] [US1] Create GET /api/sports route in src/app/api/sports/route.ts (스포츠 목록)
- [x] T019 [P] [US1] Create GET /api/sports/[sportId]/teams route in src/app/api/sports/[sportId]/teams/route.ts (팀 목록)
- [x] T020 [P] [US1] Create GET /api/bet-types route in src/app/api/bet-types/route.ts (베팅 타입 목록)
- [x] T021 [US1] Create POST /api/bets route in src/app/api/bets/route.ts (베팅 생성 with Edge 계산 & 추천)

### UI Components

- [x] T022 [P] [US1] Create SportSelector component in src/components/SportSelector.tsx
- [x] T023 [P] [US1] Create TeamSelector component in src/components/TeamSelector.tsx (팀A, 팀B 드롭다운)
- [x] T024 [P] [US1] Create BetTypeSelector component in src/components/BetTypeSelector.tsx (베팅타입 + 대상팀 선택)
- [x] T025 [P] [US1] Create ProbabilityInput component in src/components/ProbabilityInput.tsx (pAgent, pMarket 입력)
- [x] T026 [P] [US2] Create EdgeDisplay component in src/components/EdgeDisplay.tsx (Δp 표시)
- [x] T027 [P] [US2] Create BetRecommendation component in src/components/BetRecommendation.tsx (추천금액 or 비추천)

### Page Integration

- [x] T028 [US1] Create prediction page in src/app/predict/page.tsx (모든 컴포넌트 통합)
- [x] T029 [US1] Implement form validation (확률 0~1 범위, 팀A≠팀B)
- [x] T030 [US2] Implement real-time Edge calculation and recommendation display on probability input

**Checkpoint**: 예측 입력 → Edge 계산 → 베팅 추천까지 전체 플로우 작동

---

## Phase 4: User Story 3 - 결과 입력 및 기록 (Priority: P2)

**Goal**: 베팅 결과(승/패) 입력 → 실현 에지 계산 → 밸런스 업데이트

**Independent Test**: 결과 입력 후 밸런스가 정확히 변경됨

### API Routes

- [x] T031 [US3] Create GET /api/bets route in src/app/api/bets/route.ts (베팅 목록 조회 - 기존 파일 확장)
- [x] T032 [US3] Create PATCH /api/bets/[id]/result route in src/app/api/bets/[id]/result/route.ts (결과 입력)
- [x] T033 [US3] Implement Balance update logic in result route (승리/패배에 따른 밸런스 변경)

### UI Components

- [x] T034 [P] [US3] Create BetHistoryTable component in src/components/BetHistoryTable.tsx (베팅 기록 목록)
- [x] T035 [P] [US3] Create ResultInput component in src/components/ResultInput.tsx (승/패 + 실제금액 입력)

### Page Integration

- [x] T036 [US3] Create history page in src/app/history/page.tsx (베팅 기록 + 결과 입력)
- [x] T037 [US3] Add bet submission flow in predict page (예측 후 베팅 저장)

**Checkpoint**: 베팅 생성 → 결과 입력 → 밸런스 업데이트 플로우 작동

---

## Phase 5: User Story 4 - 예측 에지 vs 실현 에지 분석 (Priority: P2)

**Goal**: 팀별/베팅타입별/전체 포트폴리오 에지 분석

**Independent Test**: 10회 이상 베팅 기록 시 팀별 Δp vs Δr 오차 표시

### Business Logic

- [x] T038 [US4] Implement analysis functions in src/lib/analysis.ts (getTeamAnalysis, getBetTypeAnalysis, getPortfolioAnalysis)
- [x] T039 [P] [US4] Write unit tests for analysis.ts in tests/unit/analysis.test.ts

### API Routes

- [x] T040 [US4] Create GET /api/analysis route in src/app/api/analysis/route.ts (팀별/베팅타입별/전체 분석)

### UI Components

- [x] T041 [P] [US4] Create AnalysisTable component in src/components/AnalysisTable.tsx (팀별 분석 테이블)
- [x] T042 [P] [US4] Create PortfolioSummary component in src/components/PortfolioSummary.tsx (전체 포트폴리오 요약)

### Page Integration

- [x] T043 [US4] Create analysis page in src/app/analysis/page.tsx (분석 대시보드)
- [x] T044 [US4] Add sport filter and minimum bet count filter to analysis page

**Checkpoint**: 팀별/전체 에지 분석 페이지 작동

---

## Phase 6: User Story 5 - 밸런스 및 수익 대시보드 (Priority: P3)

**Goal**: 현재 밸런스, 누적 수익, 총 베팅 횟수, 승률 대시보드

**Independent Test**: 대시보드에서 $5,000 시작 밸런스와 누적 수익 표시

### API Routes

- [x] T045 [US5] Create GET /api/balance route in src/app/api/balance/route.ts (현재 밸런스 조회)

### UI Components

- [x] T046 [P] [US5] Create BalanceCard component in src/components/BalanceCard.tsx (현재 밸런스)
- [x] T047 [P] [US5] Create ProfitCard component in src/components/ProfitCard.tsx (누적 수익)
- [x] T048 [P] [US5] Create StatsCard component in src/components/StatsCard.tsx (총 베팅, 승률)

### Page Integration

- [x] T049 [US5] Create dashboard in src/app/page.tsx (메인 페이지 = 대시보드)
- [x] T050 [US5] Add navigation between dashboard, predict, history, analysis pages

**Checkpoint**: 메인 대시보드에서 전체 성과 확인 가능

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 전체 시스템 개선 및 마무리

- [x] T051 [P] Add loading states to all pages
- [x] T052 [P] Add error handling and user-friendly error messages
- [x] T053 [P] Improve UI styling with Tailwind (consistent theme)
- [x] T054 Run all unit tests and fix any failures
- [x] T055 Manual E2E test: 예측 입력 → 베팅 추천 → 결과 입력 → 분석 확인

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
┌───────────────────────────────────────────────┐
│  User Stories can proceed in priority order:   │
│  Phase 3 (US1+2) → Phase 4 (US3) → Phase 5 (US4) → Phase 6 (US5) │
└───────────────────────────────────────────────┘
    ↓
Phase 7: Polish
```

### User Story Dependencies

- **US1+US2 (P1)**: Foundational 완료 후 시작 가능 - 다른 스토리 의존 없음
- **US3 (P2)**: US1+US2 완료 후 시작 (베팅 생성 기능 필요)
- **US4 (P2)**: US3 완료 후 시작 (결과 입력된 베팅 데이터 필요)
- **US5 (P3)**: Foundational 완료 후 시작 가능 (Balance만 필요), 단 US3 후 더 의미있음

### Parallel Opportunities per Phase

**Phase 2 (Foundational)**:
```
T009, T010 (seed data) - parallel
T013, T014, T015 (lib files) - parallel
T016, T017 (tests) - parallel
```

**Phase 3 (US1+US2)**:
```
T018, T019, T020 (API routes) - parallel
T022, T023, T024, T025, T026, T027 (components) - parallel
```

**Phase 4 (US3)**:
```
T034, T035 (components) - parallel
```

**Phase 5 (US4)**:
```
T041, T042 (components) - parallel
```

**Phase 6 (US5)**:
```
T046, T047, T048 (components) - parallel
```

---

## Implementation Strategy

### MVP First (Phase 1-3)

1. Setup 완료
2. Foundational 완료 + 테스트 통과
3. US1+US2 완료: **예측 입력 → Edge 계산 → 베팅 추천** ✅ MVP
4. **STOP and VALIDATE**: 핵심 플로우 테스트

### Incremental Delivery

| Phase | Deliverable | Value |
|-------|-------------|-------|
| 1-2 | Infrastructure | 기반 |
| 3 | 예측 + 추천 | 🎯 MVP |
| 4 | 결과 기록 | 성과 추적 |
| 5 | 에지 분석 | 에이전트 검증 |
| 6 | 대시보드 | 전체 모니터링 |

---

## Summary

| Category | Count |
|----------|-------|
| Total Tasks | 55 |
| Phase 1 (Setup) | 6 |
| Phase 2 (Foundational) | 11 |
| Phase 3 (US1+US2) | 13 |
| Phase 4 (US3) | 7 |
| Phase 5 (US4) | 7 |
| Phase 6 (US5) | 6 |
| Phase 7 (Polish) | 5 |
| Parallel Tasks [P] | 30 |

**MVP Scope**: Phase 1-3 (30 tasks) → 예측 입력 & 베팅 추천 기능

---

## Phase 8: Dark Mode UI (Enhancement)

**Spec**: [dark-mode-spec.md](./dark-mode-spec.md)
**Goal**: 전체 앱에 다크모드 일관성 있게 적용

**Foundation (이미 완료)**:
- [x] T056 ThemeContext 생성 (src/contexts/ThemeContext.tsx)
- [x] T057 CSS 변수 정의 (src/app/globals.css)
- [x] T058 설정 페이지 토글 UI (src/app/settings/page.tsx)
- [x] T059 [P] TopHeader 다크모드 (src/components/TopHeader.tsx)
- [x] T060 [P] BottomNav 다크모드 (src/components/BottomNav.tsx)
- [x] T061 [P] BalanceCard 다크모드 (src/components/BalanceCard.tsx)
- [x] T062 [P] ProfitCard 다크모드 (src/components/ProfitCard.tsx)
- [x] T063 [P] StatsCard 다크모드 (src/components/StatsCard.tsx)
- [x] T064 BalanceChart 다크모드 (src/components/BalanceChart.tsx)
- [x] T065 ROIAnalysis 다크모드 (src/components/ROIAnalysis.tsx)

### Pages (P1)

- [ ] T066 [DM] Dashboard 페이지 다크모드 in src/app/page.tsx (로딩, 카드래퍼, Quick Actions, 최근베팅)
- [ ] T067 [DM] Predict 페이지 다크모드 in src/app/predict/page.tsx (로딩, 폼섹션, 버튼)
- [ ] T068 [DM] History 페이지 다크모드 in src/app/history/page.tsx (필터버튼, 테이블컨테이너)
- [ ] T069 [DM] Analysis 페이지 다크모드 in src/app/analysis/page.tsx (필터섹션, CrossAnalysisTable)

### Core Components (P2)

- [ ] T070 [P] [DM] BetHistoryTable 다크모드 in src/components/BetHistoryTable.tsx (테이블 전체)
- [ ] T071 [P] [DM] ResultInput 다크모드 in src/components/ResultInput.tsx (모달 전체)
- [ ] T072 [P] [DM] EdgeDisplay 다크모드 in src/components/EdgeDisplay.tsx
- [ ] T073 [P] [DM] BetRecommendation 다크모드 in src/components/BetRecommendation.tsx

### Input Components (P3)

- [ ] T074 [P] [DM] ProbabilityInput 다크모드 in src/components/ProbabilityInput.tsx
- [ ] T075 [P] [DM] TeamSelector 다크모드 in src/components/TeamSelector.tsx
- [ ] T076 [P] [DM] BetTypeSelector 다크모드 in src/components/BetTypeSelector.tsx
- [ ] T077 [P] [DM] SportSelector 다크모드 in src/components/SportSelector.tsx

### Analysis Components (P4)

- [ ] T078 [P] [DM] AnalysisTable 다크모드 in src/components/AnalysisTable.tsx
- [ ] T079 [P] [DM] PortfolioSummary 다크모드 in src/components/PortfolioSummary.tsx
- [ ] T080 [P] [DM] MddCard 다크모드 in src/components/MddCard.tsx
- [ ] T081 [P] [DM] StreakWarningBanner 다크모드 in src/components/StreakWarningBanner.tsx

### Final

- [ ] T082 다크모드 전체 QA 및 일관성 확인

**Checkpoint**: 전체 앱 다크모드 지원 완료

---

## Dark Mode Task Summary

| Priority | Tasks | Status |
|----------|-------|--------|
| Foundation | T056-T065 (10) | ✅ 완료 |
| P1 Pages | T066-T069 (4) | ⬜ 대기 |
| P2 Core Components | T070-T073 (4) | ⬜ 대기 |
| P3 Input Components | T074-T077 (4) | ⬜ 대기 |
| P4 Analysis Components | T078-T081 (4) | ⬜ 대기 |
| Final QA | T082 (1) | ⬜ 대기 |
| **Total Dark Mode** | **27** | **10/27** |

### Parallel Opportunities

**Pages (P1)**: 순차 실행 권장 (공통 패턴 확립 후)

**Components (P2-P4)**:
```bash
# P2 동시 실행 가능
Task T070, T071, T072, T073 - 각각 독립 파일

# P3 동시 실행 가능
Task T074, T075, T076, T077 - 각각 독립 파일

# P4 동시 실행 가능
Task T078, T079, T080, T081 - 각각 독립 파일
```
