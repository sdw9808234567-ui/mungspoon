// 멍스푼 API 자동 테스트 — 실행: node tests/api-test.mjs http://localhost:3000
// 서버를 켠 상태(npm run dev 또는 npm start)에서 실행합니다.
const BASE = process.argv[2] ?? "http://localhost:3000";
let pass = 0, fail = 0;
const post = async (path, body) => {
  const res = await fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
};
const check = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "✅" : "❌"} ${name}${extra ? " — " + extra : ""}`); };
const cat = (r, input) => r.data.items.find((i) => i.input === input)?.category;

// 1) 정상 재료만 선택
let r = await post("/api/analyze", { ingredients: ["단호박", "쌀가루", "계란"] });
check("정상 재료만: 분석 통과", r.status === 200 && r.data.canGenerate && r.data.usableNames.length === 3);
r = await post("/api/recipe", { ingredients: ["단호박", "쌀가루", "계란"], type: "cookie" });
check("정상 재료만: 레시피 생성", r.status === 200 && r.data.ok && r.data.recipe.ingredients.every((i) => i.grams > 0), r.data.recipe?.name);
check("정상 재료만: 열량 합계 = 재료별 합", r.data.recipe.calories.totalKcal === r.data.recipe.calories.rows.reduce((s, x) => s + x.kcal, 0), r.data.recipe.calories.totalKcal + "kcal");

// 2) 위험 재료 선택
for (const bad of ["포도", "건포도", "자일리톨", "초콜릿", "양파", "마늘", "대파", "파", "마카다미아", "샤인머스캣", "초코 바나나", "건포도 식빵", "양파가루", "마늘빵", "아보카도", "커피"]) {
  r = await post("/api/analyze", { ingredients: [bad] });
  check(`위험 재료 차단: ${bad}`, cat(r, bad) === 3 && r.data.canGenerate === false);
}
r = await post("/api/recipe", { ingredients: ["포도"], type: "cookie" });
check("위험 재료만: 레시피 생성 거부(422)", r.status === 422 && !r.data.ok && !r.data.recipe);

// 3) 정상 + 위험 혼합 → 하나라도 있으면 중단
r = await post("/api/recipe", { ingredients: ["단호박", "쌀가루", "건포도"], type: "cookie" });
check("혼합: 레시피 생성 중단", r.status === 422 && !r.data.recipe, r.data.error);

// 4) 정보 부족 재료
r = await post("/api/analyze", { ingredients: ["오이", "용과"] });
check("미확인 재료: 분석 보류, 생성 불가", cat(r, "오이") === 4 && cat(r, "용과") === 4 && !r.data.canGenerate);
r = await post("/api/recipe", { ingredients: ["고구마", "쌀가루", "용과"], type: "soft" });
check("미확인+정상: 미확인은 빼고 생성", r.data.ok && !r.data.recipe.ingredients.some((i) => i.name === "용과") && r.data.recipe.notices.some((n) => n.includes("용과")));

// 4-1) 가공 상태·첨가물
for (const p of ["양념 닭가슴살", "가당 요거트", "바나나맛 우유", "무설탕 요거트", "고구마 맛탕", "블루베리잼", "훈제 닭가슴살"]) {
  r = await post("/api/analyze", { ingredients: [p] });
  check(`가공품 보류: ${p}`, cat(r, p) === 4);
}
r = await post("/api/analyze", { ingredients: ["무가당 플레인 요거트", "꿀고구마", "달걀", "파프리카", "파인애플"] });
check("오탐 없음: 무가당 요거트=2, 꿀고구마=1, 달걀=1", cat(r, "무가당 플레인 요거트") === 2 && cat(r, "꿀고구마") === 1 && cat(r, "달걀") === 1);
check("오탐 없음: 파프리카·파인애플은 금지(3)가 아니라 보류(4)", cat(r, "파프리카") === 4 && cat(r, "파인애플") === 4);

// 5) 재료 없이 실행
r = await post("/api/analyze", { ingredients: [] });
check("재료 없음: 400 + 안내", r.status === 400 && /하나 이상/.test(r.data.error));
r = await post("/api/recipe", { ingredients: [], type: "cookie" });
check("재료 없음: 레시피 거부", r.status === 422 && !r.data.ok);
r = await post("/api/recipe", "깨진 요청");
check("깨진 요청: 400", r.status === 400);
r = await post("/api/recipe", { ingredients: ["단호박"], type: "pizza" });
check("없는 간식 종류: 거부", !r.data.ok);

// 6) 프로필(알레르기) 반영
const profile = { name: "테스트", weightKg: "8", age: "1살", allergies: ["닭"], forbidden: ["두부"], healthNotes: "체중 관리 중" };
r = await post("/api/analyze", { ingredients: ["닭가슴살", "단호박"], profile });
check("프로필: 닭 알레르기 → 닭가슴살 차단", cat(r, "닭가슴살") === 3 && !r.data.canGenerate);
r = await post("/api/recipe", { ingredients: ["두부", "쌀가루"], type: "soft", profile });
check("프로필: 금지 재료 두부 → 생성 중단", r.status === 422);
r = await post("/api/recipe", { ingredients: ["단호박"], type: "pudding", profile: { ...profile, allergies: ["계란"] } });
check("프로필: 계란 알레르기 + 푸딩 → 계란을 몰래 추가하지 않고 거부", !r.data.ok, r.data.error);
r = await post("/api/recipe", { ingredients: ["단호박", "쌀가루"], type: "cookie", profile });
check("프로필: 건강 메모가 주의사항에 반영", r.data.ok && r.data.recipe.feedingCautions.some((c) => c.includes("체중 관리 중")));

// 7) 8가지 종류 × 여러 조합 모두 생성 + 추가 재료 표시
const combos = [["단호박"], ["고구마", "계란", "쌀가루"], ["닭가슴살", "당근"], ["바나나", "블루베리", "무가당 플레인 요거트"], ["사과"], ["브로콜리", "두부"], ["단호박", "고구마", "바나나", "사과", "계란", "쌀가루", "닭가슴살", "당근", "브로콜리", "무가당 플레인 요거트", "두부", "블루베리"]];
let all = true, n = 0;
for (const type of ["bread", "cookie", "muffin", "cake", "pudding", "donut", "bite", "soft"]) for (const c of combos) {
  r = await post("/api/recipe", { ingredients: c, type });
  n++;
  const ok = r.data.ok && r.data.recipe.steps.length >= 4 && r.data.recipe.calories.totalKcal > 0 && r.data.recipe.ingredients.every((i) => i.owned === (i.name === "물" || c.includes(i.name)));
  if (!ok) { all = false; console.log("   실패:", type, c.join("+"), r.data.error ?? ""); }
}
check(`8종류 × ${combos.length}조합 = ${n}개 레시피 모두 생성, '추가 필요' 표시 정확`, all);
r = await post("/api/recipe", { ingredients: ["쌀가루"], type: "cookie" });
check("몸통 재료 없음(쌀가루만): 친절한 안내로 거부", !r.data.ok && /하나 더/.test(r.data.error), r.data.error);
r = await post("/api/recipe", { ingredients: ["단호박"], type: "muffin" });
check("추가 재료 표시: 계란·쌀가루가 owned=false", r.data.recipe.ingredients.filter((i) => !i.owned).map((i) => i.name).sort().join() === "계란,쌀가루");

console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
if (r.data.recipe) console.log("예시 source:", r.data.recipe.source);
process.exit(fail ? 1 : 0);
