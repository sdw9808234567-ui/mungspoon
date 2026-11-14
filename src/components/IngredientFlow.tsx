"use client";
// ─────────────────────────────────────────────────────────────
// 재료 선택 → 안전성 분석 → (만들기 화면이면) 종류 선택 → 레시피 생성
//
// mode="make"  : '내 재료로 간식 만들기' 화면
// mode="check" : '재료 안전성 검사' 화면 (분석 결과만 보여 줌)
// ─────────────────────────────────────────────────────────────
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STARTER_NAMES } from "@/lib/safety/db";
import { saveRecipe, useProfile } from "@/lib/store";
import { TREAT_TYPES, type AnalysisItem, type AnalysisResult, type TreatType } from "@/lib/types";
import { BigButton, VerdictTag } from "./ui";

type Props = { mode: "make" | "check"; initialSelected?: string[]; initialType?: TreatType };

export default function IngredientFlow({ mode, initialSelected = [], initialType }: Props) {
  const router = useRouter();
  const [profile] = useProfile();

  const [selected, setSelected] = useState<string[]>(initialSelected); // 선택한 재료
  const [custom, setCustom] = useState(""); // 직접 입력 칸
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null); // 분석 결과
  const [type, setType] = useState<TreatType | null>(initialType ?? null); // 간식 종류
  const [busy, setBusy] = useState<"" | "analyze" | "recipe">(""); // 진행 중인 작업
  const [error, setError] = useState(""); // 오류 안내

  // 재료가 바뀌면 이전 분석 결과는 무효 → 다시 분석하도록 지웁니다
  const changeSelected = (next: string[]) => {
    setSelected(next);
    setAnalysis(null);
    setError("");
  };
  const toggle = (name: string) =>
    changeSelected(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]);

  // 직접 입력한 재료 추가
  const addCustom = () => {
    const name = custom.trim();
    if (!name) return;
    if (!selected.includes(name)) changeSelected([...selected, name]);
    setCustom("");
  };

  // ① 안전성 분석 요청 (서버 /api/analyze)
  const analyze = async () => {
    setError("");
    if (selected.length === 0) {
      setError("재료를 하나 이상 선택해 주세요.");
      return;
    }
    setBusy("analyze");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ingredients: selected, profile }),
      });
      const data: AnalysisResult = await res.json();
      if (!data.ok) setError(data.error ?? "분석하지 못했어요.");
      else setAnalysis(data);
    } catch {
      setError("서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.");
    } finally {
      setBusy("");
    }
  };

  // ② 레시피 생성 요청 (서버 /api/recipe) → 저장 → 레시피 화면으로 이동
  const makeRecipe = async () => {
    setError("");
    if (!type) {
      setError("만들 간식 종류를 선택해 주세요.");
      return;
    }
    setBusy("recipe");
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ingredients: selected, type, profile }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "레시피를 만들지 못했어요.");
        if (data.analysis?.ok) setAnalysis(data.analysis);
        return;
      }
      if (!saveRecipe(data.recipe)) {
        setError("저장 공간이 부족해 레시피를 저장하지 못했어요. 보관함에서 사진이 있는 기록을 정리해 주세요.");
        return;
      }
      router.push(`/recipe?id=${data.recipe.id}`);
    } catch {
      setError("서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.");
    } finally {
      setBusy("");
    }
  };

  const customItems = selected.filter((s) => !STARTER_NAMES.includes(s));

  return (
    <div className="px-5">
      {/* ── 재료 선택 ───────────────────────────── */}
      <section aria-labelledby="pick">
        <h2 id="pick" className="text-[19px] font-semibold">집에 있는 재료를 골라 주세요</h2>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {STARTER_NAMES.map((name) => {
            const on = selected.includes(name);
            return (
              <li key={name}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(name)}
                  className={`min-h-12 rounded-full border-2 px-4 text-[17px] transition-colors ${on ? "border-brown bg-brown font-semibold text-paper" : "border-sand bg-paper text-espresso"}`}
                >
                  {name}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 목록에 없는 재료 직접 입력 */}
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addCustom();
          }}
        >
          <label className="sr-only" htmlFor="custom">목록에 없는 재료 직접 입력</label>
          <input
            id="custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={30}
            placeholder="목록에 없는 재료 입력 (예: 오이)"
            className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-sand bg-paper px-4 placeholder:text-muted/70"
          />
          <button type="submit" className="min-h-12 shrink-0 rounded-xl border-2 border-brown bg-paper px-4 font-semibold text-brown">
            추가
          </button>
        </form>
        {customItems.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {customItems.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  aria-label={`${name} 빼기`}
                  className="min-h-11 rounded-full border-2 border-brown bg-beige px-4 font-semibold text-espresso"
                >
                  {name} <span aria-hidden>✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── 분석 버튼 ───────────────────────────── */}
      {!analysis && (
        <div className="mt-6">
          <BigButton onClick={analyze} disabled={busy !== ""}>
            {busy === "analyze" ? "분석하는 중…" : `선택한 재료 ${selected.length}개 안전성 분석하기`}
          </BigButton>
        </div>
      )}

      {/* 오류 안내 (화면 낭독기가 바로 읽도록 role=alert) */}
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-block-bg px-4 py-3 font-medium text-block">
          {error}
        </p>
      )}

      {/* ── 분석 결과 ───────────────────────────── */}
      {analysis && (
        <section aria-labelledby="result" className="mt-8">
          <h2 id="result" className="text-[19px] font-semibold">안전성 분석 결과</h2>

          {/* 위험 재료가 있으면 맨 위에 크게 알림 */}
          {!analysis.canGenerate && analysis.blockReason && (
            <p role="alert" className="mt-3 rounded-xl border-2 border-block bg-block-bg px-4 py-3 font-semibold text-block">
              {analysis.blockReason}
            </p>
          )}
          {analysis.canGenerate && analysis.heldNames.length > 0 && (
            <p className="mt-3 rounded-xl bg-hold-bg px-4 py-3 text-hold">
              분석 보류된 재료({analysis.heldNames.join(", ")})는 레시피에서 빼고 만들어요.
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {analysis.items.map((item) => (
              <ResultCard key={item.input} item={item} onRemove={() => toggle(item.input)} />
            ))}
          </ul>

          <p className="mt-4 text-[15px] text-muted">
            이 결과는 공개된 반려동물 영양 자료를 정리한 참고 정보이며, 수의사의 진료를 대신하지 않아요.
          </p>

          {/* ── 만들기 화면: 종류 선택 + 레시피 생성 ── */}
          {mode === "make" && analysis.canGenerate && (
            <div className="mt-8">
              <h2 className="text-[19px] font-semibold">어떤 간식을 만들까요?</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2.5">
                {TREAT_TYPES.map((t) => {
                  const on = type === t.id;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setType(t.id)}
                        className={`min-h-16 w-full rounded-2xl border-2 px-3 py-2 text-left transition-colors ${on ? "border-brown bg-beige" : "border-sand bg-paper"}`}
                      >
                        <span className="block text-[17px] font-semibold">{t.label}</span>
                        <span className="block text-[14px] text-muted">{t.hint}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5">
                <BigButton onClick={makeRecipe} disabled={busy !== ""}>
                  {busy === "recipe" ? "레시피 만드는 중…" : "이 재료로 레시피 만들기"}
                </BigButton>
              </div>
            </div>
          )}

          {mode === "check" && analysis.canGenerate && (
            <div className="mt-6">
              <BigButton
                variant="ghost"
                onClick={() => router.push(`/make?ing=${encodeURIComponent(analysis.usableNames.join(","))}`)}
              >
                통과한 재료로 간식 만들러 가기
              </BigButton>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/** 재료 한 건의 분석 결과 카드 (자세한 내용은 눌러서 펼침) */
function ResultCard({ item, onRemove }: { item: AnalysisItem; onRemove: () => void }) {
  const edge = { 1: "border-l-ok", 2: "border-l-caution", 3: "border-l-block", 4: "border-l-hold" }[item.category];
  return (
    <li className={`rounded-xl border border-sand border-l-[6px] bg-paper p-4 ${edge}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[19px] font-semibold">{item.input}</h3>
        {/* 못 쓰는 재료는 바로 뺄 수 있게 */}
        {!item.usable && (
          <button type="button" onClick={onRemove} className="min-h-10 shrink-0 rounded-lg border-2 border-brown px-3 text-[15px] font-semibold text-brown">
            빼기
          </button>
        )}
      </div>
      <div className="mt-1.5">
        <VerdictTag category={item.category} label={item.categoryLabel} />
      </div>
      <p className="mt-2.5">{item.summary}</p>

      {(item.category === 1 || item.category === 2 || item.profileConflict) && (
        <details className="mt-3">
          <summary className="min-h-10 cursor-pointer py-1.5 font-semibold text-brown">주의사항·조리법·출처 보기</summary>
          <dl className="mt-2 space-y-3 text-[16px]">
            <Row title="사용 시 주의사항" lines={item.cautions} />
            <Row title="적절한 조리 방법" lines={[item.cooking]} />
            <Row title="피해야 하는 첨가물·가공 형태" lines={item.avoidAdditives} />
            <Row title="알레르기 주의" lines={[item.allergyNote]} />
            <SourceRow item={item} />
          </dl>
        </details>
      )}
      {item.category === 3 && !item.profileConflict && (
        <dl className="mt-3 space-y-3 text-[16px]">
          <Row title="혹시 이미 먹었다면" lines={item.cautions} />
          <SourceRow item={item} />
        </dl>
      )}
      {item.category === 4 && <p className="mt-2 text-[16px] text-muted">{item.cautions[0]}</p>}
    </li>
  );
}

function Row({ title, lines }: { title: string; lines: string[] }) {
  const shown = lines.filter(Boolean);
  if (shown.length === 0) return null;
  return (
    <div>
      <dt className="font-semibold">{title}</dt>
      {shown.map((l) => (
        <dd key={l} className="text-espresso/90">{l}</dd>
      ))}
    </div>
  );
}

/** 정보의 출처와 검증 상태 */
function SourceRow({ item }: { item: AnalysisItem }) {
  const status =
    item.verification === "verified" ? "출처 본문에서 직접 확인" : item.verification === "partial" ? "부분 확인" : "출처 없음";
  return (
    <div>
      <dt className="font-semibold">정보 출처와 검증 상태</dt>
      <dd>
        검증 상태: {status} (2026-11-14 기준)
        {item.verificationNote && <span className="block text-muted">{item.verificationNote}</span>}
      </dd>
      {item.sources.map((s) => (
        <dd key={s.url}>
          <a href={s.url} target="_blank" rel="noreferrer" className="text-brown underline underline-offset-2">
            {s.name}
          </a>
        </dd>
      ))}
    </div>
  );
}
