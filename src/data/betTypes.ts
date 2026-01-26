export const BET_TYPES = [
  {
    code: 'ML',
    name: '승패',
    description: '머니라인 베팅 (승리팀 예측)',
  },
  {
    code: 'SPREAD',
    name: '핸디캡',
    description: '핸디캡 스프레드 베팅',
  },
  {
    code: 'TOTAL',
    name: '오버/언더',
    description: '토탈 포인트/맵 오버언더 베팅',
  },
] as const;

export type BetTypeCode = (typeof BET_TYPES)[number]['code'];
