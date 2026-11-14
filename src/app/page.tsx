"use client";
// 홈(메인) 화면
// ★ 2026-11 디자인 개선: 대표 강아지 일러스트, 그림자 카드, 아이콘 버튼
//   (기능·데이터 처리 방식은 이전과 똑같습니다)
import Link from "next/link";
import { useSyncExternalStore } from "react";
import RecipeCard from "@/components/RecipeCard";
import { AdSlot, TopBar, TreatArt } from "@/components/ui";
import { PRESETS, presetHref } from "@/lib/presets";
import { useLogs, useProfile, useRecipes, useViewed } from "@/lib/store";
import { TREAT_TYPES } from "@/lib/types";

/** 오늘 날짜를 '1970년부터 며칠째'인지 숫자로 (휴대폰 시간대 기준) */
const todayNumber = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60_000) / 86_400_000);
const noSubscribe = () => () => {};

export default function HomePage() {
  const [profile] = useProfile();
  const [recipes] = useRecipes();
  const [viewed] = useViewed();
  const [logs] = useLogs();

  // 오늘의 추천: 날짜를 숫자로 바꿔 기본 조합 중 하나를 고릅니다 (하루 동안 같은 추천)
  // 휴대폰의 오늘 날짜를 기준으로 합니다 (서버에서 미리 그릴 때는 0번으로 그렸다가 바로 바뀝니다)
  const dayIndex = useSyncExternalStore(noSubscribe, todayNumber, () => 0);
  const today = PRESETS[dayIndex % PRESETS.length];
  const others = PRESETS.filter((p) => p !== today);

  // 최근 본 레시피 (id 순서대로 실제 레시피 찾기)
  const recent = viewed.map((id) => recipes.find((r) => r.id === id)).filter((r) => !!r).slice(0, 3);
  const photoOf = (id: string) => logs.find((l) => l.recipeId === id && l.photo)?.photo;

  return (
    <main>
      <TopBar right={<Link href="/blog" className="min-h-11 rounded-full bg-paper px-4 py-2 text-[15px] font-semibold text-brown shadow-card">블로그</Link>} />

      {/* ── 대표 화면(히어로): 슬로건 + 강아지 일러스트 ── */}
      <section className="relative mx-5 mt-1 overflow-hidden rounded-[28px] bg-gradient-to-br from-paper via-beige to-[#f3d7b6] px-5 pt-6 pb-0 shadow-card">
        {/* 배경 장식 원 */}
        <span aria-hidden className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-white/50" />
        <span aria-hidden className="absolute bottom-6 -left-6 h-16 w-16 rounded-full bg-white/40" />
        {/* 글씨는 넓게 쓰고, 강아지는 오른쪽 아래에 앉혀서 슬로건이 어색하게 끊기지 않게 */}
        <div className="relative min-h-[240px] pb-6">
          <span className="inline-block rounded-full bg-paper/80 px-3 py-1 text-[13px] font-semibold text-brown">
            무첨가 · 재료 안전성 먼저
          </span>
          <p className="mt-3 font-display text-[27px] font-bold leading-[1.3]">
            우리 강아지를 위한<br />건강한 한입
          </p>
          <p className="mt-2 max-w-[55%] text-[14px] leading-snug text-muted">통과한 재료로만 레시피를 만들어요</p>
          {/* 멍스푼의 주인공: 하쿠 실제 사진 (public/haku.jpg) — 동그랗게 자르고 흰 테두리 + 그림자 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/haku.jpg"
            alt="멍스푼의 주인공 시바견 하쿠"
            width={132}
            height={132}
            className="absolute right-0 bottom-5 h-[132px] w-[132px] rounded-full border-4 border-paper object-cover shadow-lift"
          />
        </div>
      </section>

      {/* ── 강아지 프로필 ── */}
      <Link href="/profile" className="mx-5 mt-4 flex items-center gap-4 rounded-2xl bg-paper p-4 shadow-card active:bg-beige">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-beige to-sand font-display text-[24px] font-bold text-brown" aria-hidden>
          {profile.name ? profile.name[0] : <PawIcon className="h-7 w-7" />}
        </span>
        <span className="min-w-0 flex-1">
          {profile.name ? (
            <>
              <span className="block truncate text-[19px] font-semibold">{profile.name}</span>
              <span className="block truncate text-[15px] text-muted">
                {[profile.age, profile.weightKg && `${profile.weightKg}kg`, profile.allergies.length ? `알레르기: ${profile.allergies.join(", ")}` : "알레르기 등록 없음"].filter(Boolean).join(" / ")}
              </span>
            </>
          ) : (
            <>
              <span className="block text-[19px] font-semibold">강아지 프로필 등록하기</span>
              <span className="block text-[15px] text-muted">알레르기 재료를 레시피에서 자동으로 빼 드려요</span>
            </>
          )}
        </span>
        <Chevron />
      </Link>

      {/* ── 가장 중요한 두 버튼 ── */}
      <div className="mt-4 grid gap-3 px-5">
        <Link href="/make" className="flex min-h-[80px] items-center gap-4 rounded-2xl bg-gradient-to-br from-brown to-espresso px-5 text-paper shadow-lift active:opacity-90">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15" aria-hidden>
            {/* 숟가락 아이콘 (멍스푼) */}
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3c2.5 0 4.5 2.2 4.5 5S14.5 13 12 13 7.5 10.8 7.5 8 9.5 3 12 3zm0 10v8" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[20px] font-semibold">내 재료로 간식 만들기</span>
            <span className="block text-[14px] text-beige">재료 선택 → 안전성 분석 → 레시피</span>
          </span>
          <Chevron light />
        </Link>
        <Link href="/check" className="flex min-h-[68px] items-center gap-4 rounded-2xl bg-paper px-5 text-brown shadow-card active:bg-beige">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ok-bg text-ok" aria-hidden>
            {/* 방패 + 체크 아이콘 */}
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zm-3 9l2 2 4-4" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-semibold">재료 안전성 검사</span>
            <span className="block text-[14px] text-muted">이 재료, 강아지에게 써도 될까?</span>
          </span>
          <Chevron />
        </Link>
      </div>

      {/* ── 오늘의 추천 레시피 ── */}
      <Block title="오늘의 추천 레시피">
        <Link href={presetHref(today)} className="mx-5 block overflow-hidden rounded-[28px] bg-paper shadow-card active:opacity-90">
          <span className="relative block">
            <TreatArt type={today.type} className="aspect-[12/7] w-full" />
            <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-[13px] font-semibold text-brown shadow-card">
              오늘의 추천
            </span>
          </span>
          <span className="block p-5">
            <span className="block font-display text-[24px] font-bold">{today.title}</span>
            <span className="sr-only">필요한 재료: {today.ingredients.join(", ")}</span>
            <span className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
              {today.ingredients.map((i) => (
                <span key={i} className="rounded-full bg-beige px-3 py-1 text-[14px] text-espresso">{i}</span>
              ))}
            </span>
          </span>
        </Link>
      </Block>

      {/* ── 기본 수제간식 (이용 통계가 쌓이면 '인기 수제간식'으로 바꿀 자리) ── */}
      <Block title="기본 수제간식" sub="재료 2~4가지로 시작하기 좋은 조합">
        <ul className="flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-4">
          {others.map((p) => (
            <li key={p.title} className="w-44 shrink-0 snap-start">
              <Link href={presetHref(p)} className="block overflow-hidden rounded-3xl bg-paper shadow-card active:opacity-90">
                <TreatArt type={p.type} className="aspect-[6/5] w-full" />
                <span className="block p-3.5">
                  <span className="block text-[17px] font-semibold leading-snug">{p.title}</span>
                  <span className="mt-0.5 block text-[14px] text-muted">{p.ingredients.join(", ")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Block>

      {/* ── 카테고리 ── */}
      <Block title="종류별로 만들기">
        <ul className="grid grid-cols-4 gap-2.5 px-5">
          {TREAT_TYPES.map((t) => (
            <li key={t.id}>
              <Link href={`/make?type=${t.id}`} className="block overflow-hidden rounded-2xl bg-paper text-center shadow-card active:opacity-90">
                <TreatArt type={t.id} className="aspect-square w-full" />
                <span className="block px-1 py-2 text-[14px] font-semibold leading-tight">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Block>

      <AdSlot id="home-middle" />

      {/* ── 최근 본 레시피 ── */}
      <Block title="최근 본 레시피">
        <div className="px-5">
          {recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand bg-paper/60 px-5 py-6 text-center text-muted">
              레시피를 만들면 여기에 최근 본 순서대로 보여요.
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((r) => <li key={r!.id}><RecipeCard recipe={r!} photo={photoOf(r!.id)} /></li>)}
            </ul>
          )}
        </div>
      </Block>

      {/* ── 블로그 연결 ── */}
      <Block title="바른 멍생활 블로그">
        <Link href="/blog" className="mx-5 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-beige to-[#ead8b8] p-4 active:opacity-90">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-paper text-[15px] font-bold text-[#03c75a]" aria-hidden>
            blog
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold">블로그 방문 / 제작 후기 / 블로그 레시피</span>
            <span className="block text-[14px] text-muted">네이버 블로그 ‘바른 멍생활’로 연결돼요.</span>
          </span>
          <Chevron />
        </Link>
      </Block>

      {/* ── 맨 아래: 개인정보처리방침 (플레이스토어 등록에 필요) ── */}
      <footer className="mt-10 px-5 text-center text-[13px] text-muted">
        <Link href="/privacy" className="underline underline-offset-2">개인정보처리방침</Link>
        <p className="mt-1">© 멍스푼 · 바른 멍생활</p>
      </footer>
    </main>
  );
}

/** 구역 제목 + 내용 */
function Block({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 px-5">
        <h2 className="font-display text-[23px] font-bold">{title}</h2>
        {sub && <p className="text-[15px] text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/** 오른쪽 화살표 (">") */
function Chevron({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${light ? "text-beige" : "text-sand"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** 강아지 발바닥 아이콘 (프로필 미등록일 때) */
function PawIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      <ellipse cx="5.5" cy="10.5" rx="2" ry="2.6" />
      <ellipse cx="9.5" cy="6.5" rx="2" ry="2.6" />
      <ellipse cx="14.5" cy="6.5" rx="2" ry="2.6" />
      <ellipse cx="18.5" cy="10.5" rx="2" ry="2.6" />
    </svg>
  );
}
