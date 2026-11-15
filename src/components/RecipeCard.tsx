// 레시피 목록에 쓰는 카드 (그림 + 이름 + 종류)
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { TreatArt } from "./ui";

export default function RecipeCard({ recipe, photo }: { recipe: Recipe; photo?: string }) {
  return (
    <Link href={`/recipe?id=${recipe.id}`} className="flex items-center gap-4 rounded-2xl bg-paper p-3 shadow-card active:bg-beige">
      {/* 사진이 먼저 눈에 들어오도록 크게: 직접 찍은 사진 → 없으면 종류별 대표 이미지 */}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={`${recipe.name} 직접 만든 사진`} className="h-[104px] w-[124px] shrink-0 rounded-xl object-cover" />
      ) : (
        <TreatArt type={recipe.type} className="h-[104px] w-[124px] shrink-0 rounded-xl" />
      )}
      <span className="min-w-0">
        <span className="block truncate text-[18px] font-semibold">{recipe.name}</span>
        <span className="block text-[15px] text-muted">
          {recipe.typeLabel} / {recipe.method.split(" ")[0]} {recipe.timeMin}분
        </span>
      </span>
    </Link>
  );
}
