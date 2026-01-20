# Research: Sports Quant Betting Control System

**Date**: 2026-01-21
**Feature**: 001-sports-quant-betting

## Decision Log

### 1. Database Selection

**Decision**: SQLite (via Prisma)

**Rationale**:
- 개인용 단일 사용자 시스템
- 설치 없이 파일 하나로 동작
- 백업/이동 용이 (파일 복사)
- Prisma ORM으로 추상화되어 나중에 PostgreSQL 마이그레이션 가능

**Alternatives Considered**:
- PostgreSQL: 멀티유저/웹 배포엔 좋지만 개인용엔 오버킬
- JSON 파일: 간단하지만 쿼리 기능 부족, 분석 집계 어려움

### 2. Frontend Framework

**Decision**: Next.js 14+ (App Router)

**Rationale**:
- React 기반으로 컴포넌트 재사용성
- API Routes로 백엔드 통합 → 단일 프로젝트
- Server Components로 초기 로딩 최적화
- Vercel 배포 쉬움 (추후 필요시)

**Alternatives Considered**:
- React + Vite: SPA로 가벼움, 단 API 서버 따로 필요
- CLI Only: 빠른 개발 가능하나 대시보드/차트 시각화 어려움

### 3. ORM Selection

**Decision**: Prisma

**Rationale**:
- TypeScript 타입 자동 생성 → 타입 안전성
- SQLite/PostgreSQL 모두 지원 → 마이그레이션 용이
- 스키마 기반 마이그레이션
- 직관적인 쿼리 API

**Alternatives Considered**:
- Drizzle: 더 가벼움, 단 커뮤니티 작음
- Knex: 유연하지만 타입 안전성 직접 관리 필요
- Raw SQL: 간단하지만 유지보수 어려움

### 4. Sport-Team 관계 구조

**Decision**: 정적 데이터 + DB 시드

**Rationale**:
- NBA/NHL/MLB 팀 목록은 시즌 중 거의 변하지 않음
- `src/data/teams.ts`에 정적으로 정의
- Prisma seed로 DB에 초기화
- Sport ↔ Team 1:N 관계로 FK 연결

**구조**:
```typescript
// src/data/teams.ts
export const SPORTS = ['NBA', 'NHL', 'MLB'] as const;

export const TEAMS: Record<string, string[]> = {
  NBA: ['Lakers', 'Celtics', 'Warriors', ...], // 30팀
  NHL: ['Bruins', 'Rangers', 'Maple Leafs', ...], // 32팀
  MLB: ['Yankees', 'Dodgers', 'Red Sox', ...], // 30팀
};
```

**Alternatives Considered**:
- 외부 API 연동: 실시간 팀 정보지만 의존성 증가, 오프라인 불가
- 하드코딩만: DB 없이 가능하나 쿼리/분석 어려움

### 5. Edge 계산 로직 위치

**Decision**: Server-side (`src/lib/edge.ts`)

**Rationale**:
- Constitution IV (Secure by Design): 금액 계산은 서버에서
- 클라이언트 조작 방지
- 일관된 계산 보장

**공식 구현**:
```typescript
// 예측 에지
export const calculatePredictedEdge = (pAgent: number, pMarket: number): number => {
  return pAgent - pMarket; // Δp
};

// 실현 에지
export const calculateRealizedEdge = (result: 0 | 1, pMarket: number): number => {
  return result - pMarket; // Δr
};

// 베팅 추천 금액 (밸런스 고려)
export const recommendBetAmount = (edge: number, balance: number): number | null => {
  if (edge < 0.05) return null; // 5% 미만 비추천

  let recommended: number;
  if (edge < 0.10) recommended = 200;  // 5~10%: $200
  else recommended = 350;              // 10%+: $350

  // 밸런스가 추천 금액보다 적으면 가용 금액 반환
  return Math.min(recommended, balance);
};
```

### 6. UI 컴포넌트 라이브러리

**Decision**: Tailwind CSS + shadcn/ui

**Rationale**:
- 빠른 스타일링
- shadcn/ui: 복사해서 쓰는 방식 → 의존성 없음
- 대시보드, 테이블, 폼에 적합

**Alternatives Considered**:
- MUI: 무겁고 스타일 커스텀 어려움
- Chakra UI: 좋지만 shadcn이 더 가벼움
- Pure CSS: 시간 오래 걸림

### 7. 테스팅 전략

**Decision**: Vitest (unit) + Playwright (e2e)

**Rationale**:
- Vitest: Vite 기반으로 빠름, Jest 호환
- Playwright: 크로스 브라우저 e2e
- Constitution III: 금융 로직 테스트 필수

**테스트 우선순위**:
1. `edge.ts` - Edge 계산 (Δp, Δr)
2. `betting.ts` - 베팅 추천 금액
3. `analysis.ts` - 분석 집계
4. e2e: 예측 → 추천 → 결과 입력 플로우

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| SQLite vs PostgreSQL | SQLite (개인용) |
| 프론트엔드 스택 | Next.js |
| 백엔드 분리 여부 | 통합 (API Routes) |
| 팀 데이터 관리 | 정적 + DB 시드 |
