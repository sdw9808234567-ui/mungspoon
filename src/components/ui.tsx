// 여러 화면에서 함께 쓰는 작은 부품들
import Link from "next/link";
import type { Category } from "@/lib/safety/db";
import type { TreatType } from "@/lib/types";

/** 멍스푼 로고: 숟가락 그림 + 이름 */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="멍스푼 홈으로">
      {/* 숟가락: 볼 안에 강아지 발바닥 볼록살 하나 */}
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <ellipse cx="13" cy="12" rx="9" ry="10" transform="rotate(-38 13 12)" fill="#6f4e37" />
        <rect x="19" y="18" width="5" height="15" rx="2.5" transform="rotate(-38 21.500 25.500)" fill="#6f4e37" />
        <ellipse cx="13" cy="12.500" rx="3.600" ry="3" fill="#f0e4cd" />
        <circle cx="8.500" cy="8.500" r="1.500" fill="#f0e4cd" />
        <circle cx="13" cy="6.500" r="1.500" fill="#f0e4cd" />
        <circle cx="17.500" cy="8.500" r="1.500" fill="#f0e4cd" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[26px] font-bold text-espresso">멍스푼</span>
        <span className="block text-[11px] tracking-[0.18em] text-muted">MUNG SPOON</span>
      </span>
    </Link>
  );
}

/** 화면 상단 (로고 + 오른쪽 링크) */
export function TopBar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3">
      <Logo />
      {right}
    </header>
  );
}

/** 화면 제목 */
export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 pt-2 pb-4">
      <h1 className="font-display text-[28px] font-bold leading-tight">{title}</h1>
      {sub && <p className="mt-1.5 text-muted">{sub}</p>}
    </div>
  );
}

/** 안전성 4단계 꼬리표 — 색만으로 구분하지 않도록 기호와 글자를 함께 씁니다 */
const VERDICT: Record<Category, { cls: string; mark: string }> = {
  1: { cls: "bg-ok-bg text-ok", mark: "○" },
  2: { cls: "bg-caution-bg text-caution", mark: "△" },
  3: { cls: "bg-block-bg text-block", mark: "✕" },
  4: { cls: "bg-hold-bg text-hold", mark: "?" },
};
export function VerdictTag({ category, label }: { category: Category; label: string }) {
  const v = VERDICT[category];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[14px] font-semibold ${v.cls}`}>
      <span aria-hidden>{v.mark}</span>
      {label}
    </span>
  );
}

/** 큰 버튼 (갈색 = 주요 동작, 테두리 = 보조 동작) */
export function BigButton({
  children, variant = "primary", className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const look = variant === "primary"
    ? "bg-brown text-paper active:bg-espresso disabled:bg-sand disabled:text-paper"
    : "border-2 border-brown text-brown bg-paper active:bg-beige disabled:border-sand disabled:text-sand";
  return (
    <button {...rest} className={`min-h-14 w-full rounded-2xl px-5 text-[18px] font-semibold transition-colors ${look} ${className}`}>
      {children}
    </button>
  );
}

/**
 * 간식 종류별 그림 (사진이 없을 때 보여 주는 '예시 그림')
 * 실제 완성 사진은 '만든 기록'에 직접 찍어 올릴 수 있습니다.
 */
export function TreatArt({ type, className = "" }: { type: TreatType; className?: string }) {
  const c = { dough: "#d9a45b", dark: "#a8743a", light: "#f3d9a4", cream: "#fffdf8" };
  const art: Record<TreatType, React.ReactNode> = {
    cookie: (<><circle cx="60" cy="50" r="30" fill={c.dough} /><circle cx="50" cy="42" r="4" fill={c.dark} /><circle cx="70" cy="46" r="4" fill={c.dark} /><circle cx="58" cy="62" r="4" fill={c.dark} /></>),
    bread: (<><path d="M28 62c-8-26 8-40 32-40s40 14 32 40z" fill={c.dough} /><rect x="26" y="60" width="68" height="14" rx="5" fill={c.dark} /></>),
    muffin: (<><path d="M30 46c0-16 14-24 30-24s30 8 30 24z" fill={c.dough} /><path d="M34 48h52l-7 30H41z" fill={c.dark} /></>),
    cake: (<><rect x="28" y="40" width="64" height="36" rx="6" fill={c.dough} /><rect x="28" y="40" width="64" height="12" rx="6" fill={c.cream} /><circle cx="60" cy="33" r="6" fill={c.dark} /></>),
    pudding: (<><path d="M36 76l8-40h32l8 40z" fill={c.light} /><path d="M42 44l2-8h32l2 8z" fill={c.dark} /></>),
    donut: (<><circle cx="60" cy="50" r="30" fill={c.dough} /><circle cx="60" cy="50" r="11" fill="#f0e4cd" /><path d="M36 42a26 26 0 0 1 48 0c-6 6-10-2-16 3s-10-4-16 1-10-1-16-4z" fill={c.cream} /></>),
    bite: (<><circle cx="44" cy="58" r="14" fill={c.dough} /><circle cx="74" cy="60" r="14" fill={c.dark} /><circle cx="60" cy="38" r="14" fill={c.light} /></>),
    soft: (<><ellipse cx="46" cy="58" rx="18" ry="13" fill={c.light} /><ellipse cx="76" cy="50" rx="18" ry="13" fill={c.dough} /></>),
  };
  return (
    <svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="간식 예시 그림">
      <rect width="120" height="100" fill="#f0e4cd" />
      {art[type]}
    </svg>
  );
}

/**
 * 광고 자리 — 지금은 아무것도 보여 주지 않습니다.
 * 나중에 광고를 넣을 때 이 부품 안쪽만 채우면 모든 화면에 적용됩니다.
 */
export function AdSlot({ id }: { id: string }) {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "1") return null;
  return <div data-ad-slot={id} className="mx-5 my-4 min-h-24 rounded-xl border border-dashed border-sand" />;
}
