// '재료 안전성 검사' 화면
import IngredientFlow from "@/components/IngredientFlow";
import { PageTitle, TopBar } from "@/components/ui";

export default function CheckPage() {
  return (
    <main>
      <TopBar />
      <PageTitle title="재료 안전성 검사" sub="강아지에게 써도 되는 재료인지 확인해요. 자료가 없는 재료는 안전하다고 말하지 않아요." />
      <IngredientFlow mode="check" />
    </main>
  );
}
