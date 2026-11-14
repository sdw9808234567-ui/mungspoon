"use client";
// '내 재료로 간식 만들기' 화면
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import IngredientFlow from "@/components/IngredientFlow";
import { PageTitle, TopBar } from "@/components/ui";
import { TREAT_TYPES } from "@/lib/types";

function Inner() {
  // 주소에 ?ing=단호박,쌀가루&type=cookie 가 있으면 미리 선택해 둡니다 (홈의 기본 조합에서 넘어온 경우)
  const params = useSearchParams();
  const ing = (params.get("ing") ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
  const type = TREAT_TYPES.find((t) => t.id === params.get("type"))?.id;
  // key를 주면 주소가 바뀔 때 선택 상태가 새로 시작됩니다
  return <IngredientFlow key={params.toString()} mode="make" initialSelected={ing} initialType={type} />;
}

export default function MakePage() {
  return (
    <main>
      <TopBar />
      <PageTitle title="내 재료로 간식 만들기" sub="재료의 안전성을 먼저 확인하고, 통과한 재료로만 레시피를 만들어요." />
      <Suspense fallback={<p className="px-5 text-muted">불러오는 중…</p>}>
        <Inner />
      </Suspense>
    </main>
  );
}
