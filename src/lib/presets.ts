// 홈 화면에 보여 줄 "기본 조합" — 누르면 재료와 종류가 미리 선택된 만들기 화면으로 이동합니다.
// (실제 이용 통계가 아직 없으므로 '인기 순위'가 아니라 기본 조합 예시입니다.)
import type { TreatType } from "./types";

export type Preset = { title: string; type: TreatType; ingredients: string[] };

export const PRESETS: Preset[] = [
  { title: "단호박 쿠키", type: "cookie", ingredients: ["단호박", "쌀가루"] },
  { title: "고구마 머핀", type: "muffin", ingredients: ["고구마", "계란", "쌀가루"] },
  { title: "닭가슴살 당근 한입 간식", type: "bite", ingredients: ["닭가슴살", "당근", "쌀가루"] },
  { title: "단호박 계란 푸딩", type: "pudding", ingredients: ["단호박", "계란"] },
  { title: "바나나 블루베리 케이크", type: "cake", ingredients: ["바나나", "블루베리", "계란", "쌀가루"] },
  { title: "고구마 도넛", type: "donut", ingredients: ["고구마", "계란", "쌀가루"] },
  { title: "두부 사과 말랑 간식", type: "soft", ingredients: ["두부", "사과", "쌀가루"] },
];

/** 만들기 화면 주소 만들기 */
export const presetHref = (p: Preset) =>
  `/make?type=${p.type}&ing=${encodeURIComponent(p.ingredients.join(","))}`;
