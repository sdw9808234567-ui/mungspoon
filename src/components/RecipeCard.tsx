// 레시피 목록에 쓰는 카드 (그림 + 이름 + 종류)
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { TreatArt } from "./ui";

export default function RecipeCard({ recipe, photo }: { recipe: Recipe; photo?: string }) {
  return (
    <Link href={`/recipe?id=${recipe.id}`} className="flex items-center gap-4 rounded-2xl border border-sand bg-paper p-3 active:bg-beige">
      {/* 직접 찍은 사진이 있으면 사진을, 없으면 예시 그림을 보여 줍니다 */}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={`${recipe.name} 직접 만든 사진`} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
      ) : (
        <TreatArt type={recipe.type} className="h-20 w-24 shrink-0 rounded-xl" />
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
