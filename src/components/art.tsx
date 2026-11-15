// ─────────────────────────────────────────────────────────────
// 간식 이미지 부품 (프리미엄 펫 베이커리 콘셉트)
//
// ★ 2026-11 전면 개편: 만화 같은 그림(SVG 일러스트)을 모두 없앴습니다.
//   - 실제 음식 사진이 있으면 → 사진을 보여 줍니다.
//   - 아직 사진이 없으면   → 베이커리 메뉴판 같은 '글자 타일'을 보여 줍니다.
//
// ★ 사진 넣는 방법 (코드 한 줄만 고치면 돼요)
//   1) 사진 파일을 public/treats/ 폴더에 넣습니다. (예: public/treats/cookie.jpg)
//      권장: 가로 960 × 세로 800 (6:5 비율), JPG, 150KB 이하
//   2) 아래 TREAT_PHOTOS 에 한 줄 추가합니다. (예: cookie: "/treats/cookie.jpg",)
//   → 홈·레시피·보관함 등 모든 화면에 자동으로 적용됩니다.
// ─────────────────────────────────────────────────────────────
import type { TreatType } from "@/lib/types";

/** 간식 종류별 실제 사진 주소. 사진이 준비된 종류만 적습니다. */
export const TREAT_PHOTOS: Partial<Record<TreatType, string>> = {
  // cookie: "/treats/cookie.jpg",
  // bread: "/treats/bread.jpg",
  // muffin: "/treats/muffin.jpg",
  // cake: "/treats/cake.jpg",
  // pudding: "/treats/pudding.jpg",
  // donut: "/treats/donut.jpg",
  // bite: "/treats/bite.jpg",
  // soft: "/treats/soft.jpg",
};

/** 이 종류의 실제 사진이 등록되어 있는지 */
export const hasTreatPhoto = (type: TreatType) => !!TREAT_PHOTOS[type];

/** 글자 타일에 쓰는 이름 (영문은 작게, 한글은 크게) */
const NAMES: Record<TreatType, { en: string; ko: string }> = {
  cookie: { en: "COOKIE", ko: "쿠키" },
  bread: { en: "BREAD", ko: "강아지 빵" },
  muffin: { en: "MUFFIN", ko: "머핀" },
  cake: { en: "CAKE", ko: "케이크" },
  pudding: { en: "PUDDING", ko: "푸딩" },
  donut: { en: "DONUT", ko: "도넛" },
  bite: { en: "BITE", ko: "한입 간식" },
  soft: { en: "SOFT", ko: "말랑한 간식" },
};

/**
 * 간식 이미지 (사진 또는 글자 타일)
 * - type: 간식 종류
 * - className: 크기·비율·모서리 (예: "aspect-[6/5] w-full rounded-2xl")
 * 다른 화면들이 예전 이름(TreatArt) 그대로 불러 쓰므로 이름은 유지했습니다.
 */
export function TreatArt({ type, className = "" }: { type: TreatType; className?: string }) {
  const photo = TREAT_PHOTOS[type];
  const name = NAMES[type];

  // ① 실제 사진이 있을 때: 칸을 꽉 채워 보여 줍니다 (loading="lazy" = 화면에 보일 때만 불러와 빠르게)
  if (photo) {
    return (
      <span className={`relative block overflow-hidden bg-beige ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={`${name.ko} 예시 사진`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </span>
    );
  }

  // ② 사진이 없을 때: 린넨(천) 느낌의 차분한 바탕 + 메뉴판 같은 글자
  //    [container-type:inline-size] → 타일 크기에 맞춰 글자 크기가 자동으로 변합니다 (cqw 단위)
  return (
    <span
      role="img"
      aria-label={`${name.ko} (사진 준비 중)`}
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f1e6d3] via-[#eadcc4] to-[#dfcdb0] [container-type:inline-size] ${className}`}
    >
      {/* 얇은 안쪽 테두리: 고급 포장 상자 같은 느낌 */}
      <span aria-hidden className="absolute inset-[5%] rounded-[inherit] border border-white/60" />
      <span aria-hidden className="text-[7cqw] font-medium tracking-[0.32em] text-brown/60">{name.en}</span>
      <span aria-hidden className="mt-[2cqw] font-display text-[15cqw] font-bold leading-none text-espresso/85">{name.ko}</span>
    </span>
  );
}
