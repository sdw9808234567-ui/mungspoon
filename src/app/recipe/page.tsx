"use client";
// 레시피 상세 화면 — 주소: /recipe?id=레시피번호
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AdSlot, BigButton, TopBar, TreatArt, hasTreatPhoto } from "@/components/ui";
import { addLog, markViewed, shrinkPhoto, toggleFavorite, useFavorites, useLogs, useRecipes } from "@/lib/store";
import type { Recipe } from "@/lib/types";

function Inner() {
  const id = useSearchParams().get("id") ?? "";
  const [recipes, loaded] = useRecipes();
  const [favorites] = useFavorites();
  const [logs] = useLogs();
  const recipe = recipes.find((r) => r.id === id);

  // 화면을 열면 '최근 본 레시피'에 기록
  useEffect(() => {
    if (recipe) markViewed(recipe.id);
  }, [recipe]);

  if (!loaded) return <p className="px-5 text-muted">불러오는 중…</p>;
  if (!recipe) {
    return (
      <div className="px-5">
        <p className="rounded-xl bg-hold-bg px-4 py-4">
          이 기기에 저장된 레시피를 찾지 못했어요. 레시피는 만든 기기의 브라우저에만 저장돼요.
        </p>
        <Link href="/make" className="mt-4 block min-h-14 rounded-2xl bg-brown px-5 py-3.5 text-center text-[18px] font-semibold text-paper">
          새 레시피 만들기
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(recipe.id);
  const myLogs = logs.filter((l) => l.recipeId === recipe.id);
  const extra = recipe.ingredients.filter((i) => !i.owned);

  return (
    <article className="px-5">
      {/* 완성 이미지: 직접 만든 사진이 있으면 그 사진, 없으면 예시 그림 */}
      {myLogs[0]?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={myLogs[0].photo} alt={`${recipe.name} 직접 만든 사진`} className="aspect-[6/5] w-full rounded-2xl object-cover" />
      ) : (
        <figure>
          <TreatArt type={recipe.type} className="aspect-[6/5] w-full rounded-2xl" />
          <figcaption className="mt-1.5 text-[14px] text-muted">
            {/* 대표 사진이 있으면 '예시 사진'임을 알리고, 없으면 사진 올리는 방법만 안내 */}
            {hasTreatPhoto(recipe.type)
              ? "예시 사진이에요. 실제 모습은 재료에 따라 달라요. 아래 ‘만든 기록 남기기’에서 직접 찍은 사진으로 바꿀 수 있어요."
              : "아래 ‘만든 기록 남기기’에서 직접 찍은 사진을 올리면 여기에 보여요."}
          </figcaption>
        </figure>
      )}

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-muted">{recipe.typeLabel}</p>
          <h1 className="font-display text-[30px] font-bold leading-tight">{recipe.name}</h1>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(recipe.id)}
          aria-pressed={isFav}
          className={`min-h-12 shrink-0 rounded-full border-2 border-brown px-4 font-semibold ${isFav ? "bg-brown text-paper" : "bg-paper text-brown"}`}
        >
          {isFav ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
        </button>
      </div>

      <p className="mt-2 text-[14px] text-muted">
        {recipe.source === "ai" ? "AI가 만들고 멍스푼 안전성 검증을 통과한 레시피" : "멍스푼 기본 배합 규칙으로 만든 레시피 (AI 미사용)"}
      </p>

      {/* 안내문 (AI 실패, 제외 재료 등) */}
      {recipe.notices.length > 0 && (
        <ul className="mt-4 space-y-1.5 rounded-xl bg-beige px-4 py-3 text-[16px]">
          {recipe.notices.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}

      {/* 온도·시간 요약 */}
      <dl className="mt-5 grid grid-cols-3 divide-x divide-sand rounded-2xl border border-sand bg-paper text-center">
        <div className="px-2 py-3"><dt className="text-[14px] text-muted">조리 기구</dt><dd className="font-semibold">{recipe.method.split(" ")[0]}</dd></div>
        <div className="px-2 py-3"><dt className="text-[14px] text-muted">조리 온도</dt><dd className="font-semibold">{recipe.tempC === null ? "찜" : `${recipe.tempC}℃`}</dd></div>
        <div className="px-2 py-3"><dt className="text-[14px] text-muted">조리 시간</dt><dd className="font-semibold">{recipe.timeMin}분</dd></div>
      </dl>
      <p className="mt-1.5 text-[14px] text-muted">{recipe.tempNote} / {recipe.method}</p>

      {/* 재료 계량표 */}
      <Section title="재료와 계량">
        <ul className="space-y-2">
          {recipe.ingredients.map((i) => (
            <li key={i.name} className="flex items-baseline text-[18px]">
              <span className={i.owned ? "" : "font-semibold text-caution"}>
                {i.name}{!i.owned && " (추가 필요)"}
              </span>
              <span className="leader" aria-hidden />
              <span className="font-semibold tabular-nums">{i.grams}g</span>
            </li>
          ))}
        </ul>
        {extra.length > 0 && (
          <p className="mt-3 rounded-xl bg-caution-bg px-4 py-3 text-caution">
            선택하지 않은 재료가 더 필요해요: {extra.map((e) => e.name).join(", ")}
          </p>
        )}
      </Section>

      <Section title="만드는 방법">
        <ol className="space-y-3">
          {recipe.steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brown text-[15px] font-semibold text-paper">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="익힘 확인 방법"><p>{recipe.doneness}</p></Section>

      <Section title="보관">
        <p>{recipe.storage}</p>
        <p className="mt-2"><strong>보관 기간</strong> {recipe.shelfLife}</p>
        <p className="mt-2 text-muted">냄새가 변했거나 곰팡이·끈적임이 보이면 기간이 남았어도 버려 주세요.</p>
      </Section>

      <Section title="급여 시 주의사항">
        <ul className="list-disc space-y-1.5 pl-5">
          {recipe.feedingCautions.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Section>

      <Section title={`예상 열량 약 ${recipe.calories.totalKcal}kcal (전체)`}>
        <table className="w-full text-[16px]">
          <caption className="sr-only">재료별 열량 계산 근거</caption>
          <thead>
            <tr className="border-b border-sand text-left text-muted">
              <th className="py-1.5 font-normal">재료</th><th className="py-1.5 text-right font-normal">사용량</th>
              <th className="py-1.5 text-right font-normal">100g당</th><th className="py-1.5 text-right font-normal">열량</th>
            </tr>
          </thead>
          <tbody>
            {recipe.calories.rows.map((r) => (
              <tr key={r.name} className="border-b border-sand/60">
                <td className="py-1.5">{r.name}</td>
                <td className="py-1.5 text-right tabular-nums">{r.grams}g</td>
                <td className="py-1.5 text-right tabular-nums">{r.kcalPer100g}</td>
                <td className="py-1.5 text-right tabular-nums">{r.kcal}kcal</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[15px] text-muted">계산식: 사용량(g) ÷ 100 × 100g당 열량. {recipe.calories.note}</p>
      </Section>

      <LogForm recipe={recipe} />

      {myLogs.length > 0 && (
        <p className="mt-4">
          이 레시피로 만든 기록 {myLogs.length}건 — <Link href="/box?tab=logs" className="font-semibold text-brown underline underline-offset-2">보관함에서 보기</Link>
        </p>
      )}
      <AdSlot id="recipe-bottom" />
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-display text-[22px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** '직접 만든 간식 기록' 남기기 (메모 + 사진) */
function LogForm({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [msg, setMsg] = useState("");

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await shrinkPhoto(file)); // 사진을 작게 줄여서 보관
      setMsg("");
    } catch {
      setMsg("사진을 읽지 못했어요. 다른 사진으로 시도해 주세요.");
    }
  };

  const save = () => {
    const ok = addLog({
      id: crypto.randomUUID(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      date: new Date().toISOString(),
      memo: memo.trim(),
      photo,
    });
    if (!ok) {
      setMsg("저장 공간이 부족해 기록을 저장하지 못했어요. 보관함에서 오래된 사진 기록을 지운 뒤 다시 눌러 주세요.");
      return;
    }
    setMemo("");
    setPhoto(undefined);
    setOpen(false);
    setMsg("만든 기록을 저장했어요.");
  };

  return (
    <section className="mt-10 rounded-2xl border border-sand bg-paper p-4">
      <h2 className="font-display text-[22px] font-bold">만든 기록 남기기</h2>
      {!open ? (
        <div className="mt-3">
          <BigButton variant="ghost" onClick={() => { setOpen(true); setMsg(""); }}>이 간식 만들었어요</BigButton>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="font-semibold">메모</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="예: 쌀가루 10g 더 넣었더니 모양이 잘 잡혔어요"
              className="mt-1 w-full rounded-xl border-2 border-sand bg-cream px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="font-semibold">완성 사진 (선택)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="mt-1 block w-full text-[16px] file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-beige file:px-4 file:font-semibold file:text-espresso"
            />
          </label>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="선택한 완성 사진 미리보기" className="h-40 w-full rounded-xl object-cover" />
          )}
          <BigButton onClick={save}>기록 저장하기</BigButton>
        </div>
      )}
      {msg && <p role="status" className="mt-3 font-medium text-brown">{msg}</p>}
    </section>
  );
}

export default function RecipePage() {
  return (
    <main>
      <TopBar right={<Link href="/box" className="min-h-11 px-2 py-2 font-semibold text-brown">보관함</Link>} />
      <Suspense fallback={<p className="px-5 text-muted">불러오는 중…</p>}>
        <Inner />
      </Suspense>
    </main>
  );
}
