"use client";
// 레시피 보관함 — 즐겨찾기 / 최근 생성 / 만든 기록
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RecipeCard from "@/components/RecipeCard";
import { PageTitle, TopBar } from "@/components/ui";
import { removeLog, useFavorites, useLogs, useRecipes } from "@/lib/store";

const TABS = [
  { id: "recent", label: "최근 생성" },
  { id: "fav", label: "즐겨찾기" },
  { id: "logs", label: "만든 기록" },
] as const;

function Inner() {
  const router = useRouter();
  const tab = useSearchParams().get("tab") ?? "recent";
  const [recipes, loaded] = useRecipes();
  const [favorites] = useFavorites();
  const [logs] = useLogs();

  // 레시피별 가장 최근 사진 (카드에 실제 사진을 보여 주기 위해)
  const photoOf = (id: string) => logs.find((l) => l.recipeId === id && l.photo)?.photo;
  const favRecipes = recipes.filter((r) => favorites.includes(r.id));

  return (
    <div className="px-5">
      {/* 탭 버튼 */}
      <div role="tablist" aria-label="보관함 구분" className="grid grid-cols-3 gap-1 rounded-2xl bg-beige p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => router.replace(`/box?tab=${t.id}`)}
            className={`min-h-12 rounded-xl text-[16px] font-semibold ${tab === t.id ? "bg-paper text-espresso shadow-sm" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {!loaded ? (
          <p className="text-muted">불러오는 중…</p>
        ) : tab === "logs" ? (
          logs.length === 0 ? (
            <Empty text="아직 만든 기록이 없어요. 레시피 화면 아래의 ‘이 간식 만들었어요’를 눌러 사진과 메모를 남겨 보세요." />
          ) : (
            <ul className="space-y-4">
              {logs.map((l) => (
                <li key={l.id} className="overflow-hidden rounded-2xl border border-sand bg-paper">
                  {l.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.photo} alt={`${l.recipeName} 직접 만든 사진`} className="aspect-[4/3] w-full object-cover" />
                  )}
                  <div className="p-4">
                    <p className="text-[15px] text-muted">{new Date(l.date).toLocaleDateString("ko-KR")}</p>
                    <Link href={`/recipe?id=${l.recipeId}`} className="text-[18px] font-semibold text-brown underline underline-offset-2">
                      {l.recipeName}
                    </Link>
                    {l.memo && <p className="mt-1.5 whitespace-pre-wrap">{l.memo}</p>}
                    <button type="button" onClick={() => removeLog(l.id)} className="mt-2 min-h-10 text-[15px] text-muted underline underline-offset-2">
                      이 기록 지우기
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (tab === "fav" ? favRecipes : recipes).length === 0 ? (
          <Empty text={tab === "fav" ? "즐겨찾기한 레시피가 없어요. 레시피 화면에서 ☆ 즐겨찾기를 눌러 주세요." : "아직 만든 레시피가 없어요."} />
        ) : (
          <ul className="space-y-3">
            {(tab === "fav" ? favRecipes : recipes).map((r) => (
              <li key={r.id}><RecipeCard recipe={r} photo={photoOf(r.id)} /></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-sand px-5 py-8 text-center">
      <p>{text}</p>
      <Link href="/make" className="mt-4 inline-block min-h-12 rounded-xl bg-brown px-5 py-2.5 font-semibold text-paper">
        내 재료로 간식 만들기
      </Link>
    </div>
  );
}

export default function BoxPage() {
  return (
    <main>
      <TopBar />
      <PageTitle title="레시피 보관함" sub="이 기기의 브라우저에 저장돼요." />
      <Suspense fallback={<p className="px-5 text-muted">불러오는 중…</p>}>
        <Inner />
      </Suspense>
    </main>
  );
}
