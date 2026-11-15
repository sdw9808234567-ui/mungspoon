// 여러 화면에서 함께 쓰는 작은 부품들
import Link from "next/link";
import type { Category } from "@/lib/safety/db";

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
 * 간식 이미지: 실제 사진 또는 글자 타일 (art.tsx에 있어요)
 * 다른 화면들은 지금처럼 ui.tsx에서 TreatArt를 불러오면 됩니다.
 */
export { TreatArt, hasTreatPhoto } from "./art";

/**
 * 광고 자리 — 지금은 아무것도 보여 주지 않습니다.
 * 나중에 광고를 넣을 때 이 부품 안쪽만 채우면 모든 화면에 적용됩니다.
 */
export function AdSlot({ id }: { id: string }) {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "1") return null;
  return <div data-ad-slot={id} className="mx-5 my-4 min-h-24 rounded-xl border border-dashed border-sand" />;
}
