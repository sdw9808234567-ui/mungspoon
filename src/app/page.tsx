"use client";
// 홈(메인) 화면
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
      <TopBar right={<Link href="/blog" className="min-h-11 px-2 py-2 font-semibold text-brown">블로그</Link>} />

      {/* 슬로건 */}
      <p className="px-5 font-display text-[30px] font-bold leading-snug">
        우리 강아지를 위한<br />건강한 한입
      </p>

      {/* 강아지 프로필 */}
      <Link href="/profile" className="mx-5 mt-5 flex items-center gap-4 rounded-2xl border border-sand bg-paper p-4 active:bg-beige">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-beige font-display text-[24px] font-bold text-brown" aria-hidden>
          {profile.name ? profile.name[0] : "멍"}
        </span>
        <span className="min-w-0">
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
      </Link>

      {/* 가장 중요한 두 버튼 */}
      <div className="mt-5 grid gap-3 px-5">
        <Link href="/make" className="flex min-h-[72px] items-center justify-between rounded-2xl bg-brown px-5 text-paper active:bg-espresso">
          <span>
            <span className="block text-[21px] font-semibold">내 재료로 간식 만들기</span>
            <span className="block text-[15px] text-beige">재료 선택 → 안전성 분석 → 레시피</span>
          </span>
        </Link>
        <Link href="/check" className="flex min-h-16 items-center rounded-2xl border-2 border-brown bg-paper px-5 text-brown active:bg-beige">
          <span>
            <span className="block text-[19px] font-semibold">재료 안전성 검사</span>
            <span className="block text-[15px] text-muted">이 재료, 강아지에게 써도 될까?</span>
          </span>
        </Link>
      </div>

      {/* 오늘의 추천 레시피 */}
      <Block title="오늘의 추천 레시피">
        <Link href={presetHref(today)} className="mx-5 block overflow-hidden rounded-3xl border border-sand bg-paper active:bg-beige">
          <TreatArt type={today.type} className="aspect-[12/7] w-full" />
          <span className="block p-4">
            <span className="block font-display text-[24px] font-bold">{today.title}</span>
            <span className="block text-muted">필요한 재료: {today.ingredients.join(", ")}</span>
          </span>
        </Link>
      </Block>

      {/* 기본 수제간식 (이용 통계가 쌓이면 '인기 수제간식'으로 바꿀 자리) */}
      <Block title="기본 수제간식" sub="재료 2~4가지로 시작하기 좋은 조합">
        <ul className="flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {others.map((p) => (
            <li key={p.title} className="w-40 shrink-0 snap-start">
              <Link href={presetHref(p)} className="block overflow-hidden rounded-2xl border border-sand bg-paper active:bg-beige">
                <TreatArt type={p.type} className="aspect-[6/5] w-full" />
                <span className="block p-3">
                  <span className="block text-[17px] font-semibold leading-snug">{p.title}</span>
                  <span className="mt-0.5 block text-[14px] text-muted">{p.ingredients.join(", ")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Block>

      {/* 카테고리 */}
      <Block title="종류별로 만들기">
        <ul className="grid grid-cols-4 gap-2 px-5">
          {TREAT_TYPES.map((t) => (
            <li key={t.id}>
              <Link href={`/make?type=${t.id}`} className="block overflow-hidden rounded-2xl border border-sand bg-paper text-center active:bg-beige">
                <TreatArt type={t.id} className="aspect-[6/5] w-full" />
                <span className="block px-1 py-2 text-[15px] font-semibold leading-tight">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Block>

      <AdSlot id="home-middle" />

      {/* 최근 본 레시피 */}
      <Block title="최근 본 레시피">
        <div className="px-5">
          {recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand px-5 py-6 text-center text-muted">
              레시피를 만들면 여기에 최근 본 순서대로 보여요.
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((r) => <li key={r!.id}><RecipeCard recipe={r!} photo={photoOf(r!.id)} /></li>)}
            </ul>
          )}
        </div>
      </Block>

      {/* 블로그 연결 */}
      <Block title="바른 멍생활 블로그">
        <Link href="/blog" className="mx-5 block rounded-2xl bg-beige p-4 active:bg-sand">
          <span className="block text-[18px] font-semibold">블로그 방문 / 제작 후기 / 블로그 레시피</span>
          <span className="block text-muted">네이버 블로그 ‘바른 멍생활’로 연결돼요.</span>
        </Link>
      </Block>
    </main>
  );
}

function Block({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <div className="mb-3 px-5">
        <h2 className="font-display text-[23px] font-bold">{title}</h2>
        {sub && <p className="text-[15px] text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}
