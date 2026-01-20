<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - Initial constitution ratification)

Modified principles: N/A (initial version)

Added sections:
- Core Principles (5 principles)
- Development Workflow
- Quality Standards
- Governance

Removed sections: N/A

Templates status:
- ✅ plan-template.md: Compatible (Constitution Check section exists)
- ✅ spec-template.md: Compatible (requirements align with principles)
- ✅ tasks-template.md: Compatible (phase structure aligns)

Follow-up TODOs: None
-->

# MyBet Constitution

## Core Principles

### I. Simplicity First

모든 구현은 가장 단순한 해결책을 선택한다.
- YAGNI: 현재 필요한 것만 구현, 미래 요구사항 추측 금지
- 한 함수/클래스는 한 가지 일만 수행
- 복잡한 추상화보다 명확한 코드 우선
- "이해하기 쉬운가?"가 모든 코드 리뷰의 첫 번째 질문

### II. Clean Code

읽기 쉽고 유지보수 가능한 코드를 작성한다.
- 의미있는 네이밍: 변수/함수명만 봐도 의도 파악 가능
- 일관된 코드 스타일 (프로젝트 linter/formatter 설정 준수)
- 주석보다 자기문서화 코드 우선
- 중복 제거, 단 과도한 DRY로 복잡해지면 중복 허용

### III. Test-Driven Confidence

테스트는 변경에 대한 자신감을 주는 도구다.
- 핵심 비즈니스 로직은 반드시 테스트 커버리지 확보
- 베팅 계산, 금액 처리 등 금융 로직은 테스트 필수
- 테스트가 깨지면 배포 불가
- 테스트는 문서 역할도 수행 (사용 예시)

### IV. Secure by Design

베팅 앱의 특성상 보안은 기본이다.
- 사용자 입력은 항상 검증/새니타이즈
- 금액/배당률 계산은 서버 사이드에서만 수행
- 민감 정보(비밀번호, API 키 등)는 절대 로그/코드에 노출 금지
- 인증/인가 로직은 검증된 라이브러리 사용

### V. Explicit Over Implicit

암묵적인 것보다 명시적인 것을 선호한다.
- 설정값은 하드코딩 대신 환경변수/설정파일
- 에러는 조용히 삼키지 않고 명시적으로 처리
- 의존성은 명확히 선언 (package.json, requirements.txt 등)
- API 응답 형식은 명확하게 문서화

## Development Workflow

### 코드 작성 흐름
1. 요구사항 명확화 (spec.md)
2. 설계 검토 (plan.md)
3. 구현 → 테스트 → 리팩토링
4. 코드 리뷰 → 머지

### 브랜치 전략
- `main`: 배포 가능한 상태 유지
- `feature/xxx`: 기능 개발
- PR 통해서만 main에 머지

### 커밋 메시지
- 한글 또는 영어 일관되게
- 변경 이유를 간단히 설명
- 예: "feat: 배팅 취소 기능 추가", "fix: 배당률 계산 오류 수정"

## Quality Standards

### 코드 품질
- 린터/포매터 통과 필수
- 타입 안전성 확보 (TypeScript strict 권장)
- 순환 의존성 금지

### 성능
- API 응답 시간 < 500ms (p95)
- 불필요한 DB 쿼리 방지
- N+1 쿼리 금지

### 문서화
- README: 프로젝트 실행 방법 필수
- API: 엔드포인트별 요청/응답 명세
- 복잡한 비즈니스 로직: 주석 또는 별도 문서

## Governance

이 Constitution은 프로젝트의 기본 원칙을 정의한다.

### 수정 절차
1. 수정 제안 문서화
2. 팀 리뷰 및 합의
3. Constitution 업데이트 (버전 증가)
4. 관련 템플릿/문서 동기화

### 버전 정책
- MAJOR: 원칙 삭제/재정의 (하위 호환 깨짐)
- MINOR: 원칙 추가 또는 섹션 확장
- PATCH: 문구 수정, 오타 정정

### 준수 검증
- 모든 PR은 Constitution 원칙 위반 여부 검토
- 위반 시 정당한 사유 문서화 필요

**Version**: 1.0.0 | **Ratified**: 2025-01-20 | **Last Amended**: 2025-01-20
