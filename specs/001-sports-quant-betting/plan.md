# Implementation Plan: Sports Quant Betting Control System

**Branch**: `001-sports-quant-betting` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sports-quant-betting/spec.md`

## Summary

스포츠 베팅 퀀트 관제 시스템 구축. 에이전트 확률과 시장 확률의 Edge를 계산하고, Edge 크기에 따라 동적 베팅 금액($200/$350)을 추천. 팀별/전체 포트폴리오 수준에서 예측 에지(Δp) vs 실현 에지(Δr) 오차를 분석하여 에이전트 정확도 검증.

**기술 접근**: Next.js 풀스택 + SQLite로 개인용 로컬 시스템 구축. Sport-Team 관계를 미리 구축해두고 선택 기반 입력.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**: Next.js 14+ (App Router), Prisma ORM, Tailwind CSS
**Storage**: SQLite (Prisma adapter) - 개인용 로컬 시스템
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web (localhost, 추후 Vercel 배포 가능)
**Project Type**: Web (Next.js 풀스택)
**Performance Goals**: 대시보드 2초 이내 로딩, Edge 계산 즉시 (spec SC-001, SC-005)
**Constraints**: 단일 사용자, 로컬 저장, 오프라인 가능
**Scale/Scope**: 3개 스포츠(NBA/NHL/MLB), ~90개 팀, 수천 베팅 기록

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Next.js 풀스택으로 단일 프로젝트, SQLite로 설치 없이 사용 |
| II. Clean Code | ✅ PASS | TypeScript strict, Prisma ORM으로 타입 안전성 |
| III. Test-Driven | ✅ PASS | Edge 계산, 밸런스 로직은 필수 테스트 (금융 로직) |
| IV. Secure by Design | ✅ PASS | 서버사이드 계산, 입력 검증 |
| V. Explicit Over Implicit | ✅ PASS | 환경변수 설정, 명시적 에러 처리 |

## Project Structure

### Documentation (this feature)

```text
specs/001-sports-quant-betting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI spec
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 대시보드 (밸런스, 수익)
│   ├── predict/
│   │   └── page.tsx       # 예측 입력 화면
│   ├── history/
│   │   └── page.tsx       # 베팅 기록
│   ├── analysis/
│   │   └── page.tsx       # 에지 분석 (팀별/전체)
│   └── api/
│       ├── bets/
│       │   └── route.ts   # POST: 베팅 생성, GET: 목록
│       ├── bets/[id]/
│       │   └── route.ts   # PATCH: 결과 입력
│       ├── balance/
│       │   └── route.ts   # GET: 현재 밸런스
│       └── analysis/
│           └── route.ts   # GET: 에지 분석
├── components/
│   ├── SportSelector.tsx
│   ├── TeamSelector.tsx
│   ├── BetTypeSelector.tsx
│   ├── ProbabilityInput.tsx
│   ├── EdgeDisplay.tsx
│   ├── BetRecommendation.tsx
│   └── AnalysisTable.tsx
├── lib/
│   ├── db.ts              # Prisma client
│   ├── edge.ts            # Edge 계산 로직 (Δp, Δr)
│   ├── betting.ts         # 베팅 추천 로직
│   └── analysis.ts        # 분석 집계 로직
└── data/
    └── teams.ts           # 스포츠별 팀 데이터 (정적)

prisma/
├── schema.prisma          # DB 스키마
└── seed.ts                # 초기 데이터 (스포츠, 팀)

tests/
├── unit/
│   ├── edge.test.ts
│   ├── betting.test.ts
│   └── analysis.test.ts
└── e2e/
    └── betting-flow.spec.ts
```

**Structure Decision**: Next.js App Router 기반 풀스택. `src/lib/`에 핵심 비즈니스 로직 분리. `src/data/`에 정적 팀 데이터.

## Complexity Tracking

> 없음 - Constitution 위반 없음
