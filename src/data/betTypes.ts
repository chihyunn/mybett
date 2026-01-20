export const BET_TYPES = [
  {
    code: 'SPREAD_PLUS',
    name: '+핸디캡',
    description: '언더독 스프레드 베팅',
  },
  {
    code: 'SPREAD_MINUS',
    name: '-핸디캡',
    description: '페이버릿 스프레드 베팅',
  },
  {
    code: 'OVER',
    name: '오버',
    description: '토탈 오버 베팅',
  },
  {
    code: 'UNDER',
    name: '언더',
    description: '토탈 언더 베팅',
  },
] as const;

export type BetTypeCode = (typeof BET_TYPES)[number]['code'];
