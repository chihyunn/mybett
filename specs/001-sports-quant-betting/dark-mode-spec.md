# Dark Mode UI Specification

**Date**: 2026-01-22
**Feature**: Dark Mode Support for All Pages/Components

## Overview

전체 앱에 다크모드 지원 적용. CSS 변수 기반으로 일관된 테마 적용.

## Design System

### CSS Variables (globals.css)

```css
:root {
  --background: #f8fafc;      /* 페이지 배경 */
  --foreground: #171717;      /* 기본 텍스트 */
  --card-bg: #ffffff;         /* 카드 배경 */
  --card-border: #e5e7eb;     /* 카드 테두리 */
  --muted: #6b7280;           /* 보조 텍스트 */
  --accent: #3b82f6;          /* 강조색 (blue-500) */
}

.dark {
  --background: #0f172a;      /* slate-900 */
  --foreground: #f1f5f9;      /* slate-100 */
  --card-bg: #1e293b;         /* slate-800 */
  --card-border: #334155;     /* slate-700 */
  --muted: #94a3b8;           /* slate-400 */
  --accent: #60a5fa;          /* blue-400 */
}
```

### Color Mapping Rules

| 기존 (Light) | 대체 방법 | 다크모드 결과 |
|-------------|----------|--------------|
| `bg-white` | `style={{ background: 'var(--card-bg)' }}` | slate-800 |
| `text-gray-900` | `style={{ color: 'var(--foreground)' }}` | slate-100 |
| `text-gray-500/600` | `style={{ color: 'var(--muted)' }}` | slate-400 |
| `bg-gray-50` | `style={{ background: 'var(--background)' }}` | slate-900 |
| `border-gray-200` | `style={{ borderColor: 'var(--card-border)' }}` | slate-700 |
| `bg-gray-200` (loading) | `style={{ background: 'var(--card-border)' }}` | slate-700 |

### Semantic Colors (유지)

다음 색상은 의미가 있어서 그대로 유지:
- `text-green-600`, `bg-green-50` → 승리/수익
- `text-red-600`, `bg-red-50` → 패배/손실
- `text-yellow-600`, `bg-yellow-50` → 경고/대기
- `text-blue-600`, `bg-blue-50` → 액션/추천

**다크모드 조정**: 50 계열 배경은 투명도로 변경
```css
/* Light */
bg-green-50 → rgba(34, 197, 94, 0.1)
bg-red-50 → rgba(239, 68, 68, 0.1)
```

---

## Page Specifications

### 1. Dashboard (page.tsx)

**Current Status**: ❌ 미지원

**Changes**:
- 로딩 skeleton: `bg-gray-200` → `var(--card-border)`
- 제목: `text-gray-900` → `var(--foreground)`
- 부제목: `text-gray-500` → `var(--muted)`
- 카드 래퍼: `bg-white` → `var(--card-bg)`
- 테두리: `border-gray-200` → `var(--card-border)`
- Quick Actions 카드: `bg-white` → `var(--card-bg)`
- 최근 베팅 섹션: `bg-white` → `var(--card-bg)`

### 2. Predict Page (predict/page.tsx)

**Current Status**: ❌ 미지원

**Changes**:
- 로딩 skeleton: `bg-gray-200` → `var(--card-border)`
- 제목: `text-gray-900` → `var(--foreground)`
- 폼 섹션: `bg-white` → `var(--card-bg)`
- 섹션 제목: `text-lg font-medium` → + `var(--foreground)`
- 에러 메시지: 배경 투명도 조정
- 성공 메시지: 배경 투명도 조정
- 버튼 비활성: `disabled:bg-gray-300` → 다크모드 대응
- 초기화 버튼: `bg-gray-200 text-gray-700` → 다크모드 대응

### 3. History Page (history/page.tsx)

**Current Status**: ❌ 미지원

**Changes**:
- 제목: `text-gray-900` → `var(--foreground)`
- 필터 버튼 (비활성): `bg-white text-gray-700` → 다크모드 대응
- 테이블 컨테이너: `bg-white` → `var(--card-bg)`
- 로딩 skeleton: `bg-gray-200` → `var(--card-border)`

### 4. Analysis Page (analysis/page.tsx)

**Current Status**: ⚠️ 일부 미지원

**Changes**:
- 제목: `text-gray-900` → `var(--foreground)`
- 섹션 제목: `text-gray-800` → `var(--foreground)`
- 필터 섹션: `bg-white` → `var(--card-bg)`
- 레이블: `text-gray-700` → `var(--foreground)`
- 테이블 컨테이너: `bg-white` → `var(--card-bg)`
- CrossAnalysisTable: 내부 색상 수정

---

## Component Specifications

### 1. BetHistoryTable.tsx

**Current Status**: ❌ 미지원

**Changes**:
- 빈 상태: `text-gray-500` → `var(--muted)`
- 테이블 헤더: `bg-gray-50 text-gray-500` → `var(--background)`, `var(--muted)`
- 테이블 바디: `bg-white` → `var(--card-bg)`
- 행 호버: `hover:bg-gray-50` → 다크모드 대응
- 텍스트: `text-gray-900`, `text-gray-500` → 변수 사용
- 구분선: `divide-gray-200` → `var(--card-border)`
- 뱃지 (대기/승/패): 배경 투명도 조정

### 2. ResultInput.tsx (Modal)

**Current Status**: ❌ 미지원

**Changes**:
- 모달 배경: `bg-white` → `var(--card-bg)`
- 제목: `text-gray-900` → `var(--foreground)`
- 베팅 정보 박스: `bg-gray-50` → `var(--background)`
- 레이블: `text-gray-700` → `var(--foreground)`
- 입력 필드: `border-gray-300` → `var(--card-border)`
- 버튼 비선택: `bg-gray-100 text-gray-700` → 다크모드 대응
- 취소 버튼: `bg-gray-200 text-gray-700` → 다크모드 대응

### 3. ProbabilityInput.tsx

**Current Status**: ❌ 미지원

**Changes**:
- 레이블: `text-gray-700` → `var(--foreground)`
- 입력 필드: `border-gray-300` → `var(--card-border)`
- 비활성: `disabled:bg-gray-100` → 다크모드 대응
- 퍼센트 표시: `text-gray-500` → `var(--muted)`
- 설명: `text-gray-500` → `var(--muted)`

### 4. EdgeDisplay.tsx

**Current Status**: ❌ 미지원

**Changes**:
- 기본 상태: `bg-gray-50 border-gray-200 text-gray-500` → 변수 사용
- 의미 색상: `bg-red-50`, `bg-yellow-50`, `bg-green-50` → 투명도 버전

### 5. BetRecommendation.tsx

**Current Status**: ❌ 미지원

**Changes**:
- 기본 상태: `bg-gray-50 border-gray-200 text-gray-500` → 변수 사용
- 모드 토글 버튼: `bg-gray-200 text-gray-600` → 다크모드 대응
- Kelly 카드: `bg-white` → `var(--card-bg)`
- 의미 색상: 투명도 버전으로 조정

### 6. MddCard.tsx

**Current Status**: ❌ 미지원

**Changes**:
- 기본 카드: `bg-white text-gray-500` → 변수 사용
- 의미 색상: 유지하되 텍스트 가독성 확보

### 7. TeamSelector.tsx

**확인 필요** → 다크모드 미지원 시 수정

### 8. BetTypeSelector.tsx

**확인 필요** → 다크모드 미지원 시 수정

### 9. AnalysisTable.tsx

**확인 필요** → 다크모드 미지원 시 수정

### 10. PortfolioSummary.tsx

**확인 필요** → 다크모드 미지원 시 수정

### 11. StreakWarningBanner.tsx

**확인 필요** → 다크모드 미지원 시 수정

---

## Implementation Pattern

### Standard Pattern

```tsx
'use client';
import { useTheme } from '@/contexts/ThemeContext';

export default function Component() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="rounded-lg shadow"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--foreground)',
      }}
    >
      <p style={{ color: 'var(--muted)' }}>Secondary text</p>
    </div>
  );
}
```

### Semantic Color Pattern (승리/패배 등)

```tsx
// Light: bg-green-50
// Dark: transparent with opacity
<div
  className="rounded-lg"
  style={{
    background: isDark
      ? 'rgba(34, 197, 94, 0.15)'
      : 'rgb(240, 253, 244)', // green-50
    color: isDark ? '#4ade80' : '#16a34a', // green-400 : green-600
  }}
>
```

---

## Checklist

### Already Supported ✅
- [x] ThemeContext
- [x] globals.css variables
- [x] settings/page.tsx (toggle)
- [x] TopHeader
- [x] BottomNav
- [x] BalanceCard
- [x] ProfitCard
- [x] StatsCard
- [x] BalanceChart
- [x] ROIAnalysis

### To Be Updated ❌
- [ ] page.tsx (Dashboard)
- [ ] predict/page.tsx
- [ ] history/page.tsx
- [ ] analysis/page.tsx
- [ ] BetHistoryTable.tsx
- [ ] ResultInput.tsx
- [ ] ProbabilityInput.tsx
- [ ] EdgeDisplay.tsx
- [ ] BetRecommendation.tsx
- [ ] MddCard.tsx
- [ ] TeamSelector.tsx
- [ ] BetTypeSelector.tsx
- [ ] AnalysisTable.tsx
- [ ] PortfolioSummary.tsx
- [ ] StreakWarningBanner.tsx

---

## Priority

1. **P1**: 메인 페이지들 (Dashboard, Predict, History, Analysis)
2. **P2**: 핵심 컴포넌트 (BetHistoryTable, ResultInput, EdgeDisplay, BetRecommendation)
3. **P3**: 입력 컴포넌트 (ProbabilityInput, TeamSelector, BetTypeSelector)
4. **P4**: 분석 컴포넌트 (AnalysisTable, PortfolioSummary, MddCard, StreakWarningBanner)
