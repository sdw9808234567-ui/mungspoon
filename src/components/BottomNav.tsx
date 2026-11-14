"use client";
// 하단 내비게이션 — 모든 화면 아래에 고정됩니다.
import Link from "next/link";
import { usePathname } from "next/navigation";

// 메뉴 목록: 주소, 이름, 아이콘 그림(SVG 선)
const ITEMS = [
  { href: "/", label: "홈", d: "M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" },
  { href: "/make", label: "만들기", d: "M12 3c3 0 5 2.2 5 5s-2 5-5 5-5-2.2-5-5 2-5 5-5zm0 10v8" },
  { href: "/check", label: "안전검사", d: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.500-7-10V6zm-3 9l2 2 4-4" },
  { href: "/box", label: "보관함", d: "M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" },
  { href: "/profile", label: "프로필", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-3.500 3-6 7-6s7 2.500 7 6" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-20 border-t border-sand bg-paper/95 backdrop-blur">
      <ul className="mx-auto flex max-w-[480px] pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((it) => {
          // 현재 보고 있는 화면이면 진하게 표시 (레시피 상세는 보관함으로 취급)
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href) || (it.href === "/box" && path.startsWith("/recipe"));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-[13px] ${active ? "font-semibold text-brown" : "text-muted"}`}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={it.d} />
                </svg>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
