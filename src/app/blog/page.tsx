// 블로그 연결 화면 — 네이버 블로그 '바른 멍생활'
// 기본 주소는 아래 DEFAULT_BLOG 입니다. 환경변수(NEXT_PUBLIC_BLOG_URL 등)를 넣으면 그 주소가 우선합니다.
// ★ 실제로 존재하지 않는 게시글·후기는 만들어 넣지 않습니다. 블로그로 이동하는 링크만 제공합니다.
import { PageTitle, TopBar } from "@/components/ui";

const DEFAULT_BLOG = "https://blog.naver.com/ssm4579"; // 네이버 블로그 '바른 멍생활'
const BLOG = process.env.NEXT_PUBLIC_BLOG_URL || DEFAULT_BLOG;
const LINKS = [
  { label: "블로그 방문하기", desc: "‘바른 멍생활’ 첫 화면으로 이동해요.", url: BLOG },
  { label: "실제 수제간식 제작 후기", desc: "직접 만들어 본 후기 글 모음으로 이동해요.", url: process.env.NEXT_PUBLIC_BLOG_REVIEW_URL || BLOG },
  { label: "블로그 레시피 보기", desc: "블로그에 올린 레시피 글 모음으로 이동해요.", url: process.env.NEXT_PUBLIC_BLOG_RECIPE_URL || BLOG },
];

export default function BlogPage() {
  return (
    <main>
      <TopBar />
      <PageTitle title="바른 멍생활" sub="멍스푼을 만든 사람이 운영하는 네이버 블로그예요." />
      <ul className="space-y-3 px-5">
        {LINKS.map((l) => (
          <li key={l.label}>
            {l.url ? (
              <a href={l.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-sand bg-paper p-4 active:bg-beige">
                <span className="block text-[19px] font-semibold text-brown">{l.label}</span>
                <span className="block text-muted">{l.desc} (새 창)</span>
              </a>
            ) : (
              <div aria-disabled className="rounded-2xl border border-dashed border-sand p-4">
                <span className="block text-[19px] font-semibold text-muted">{l.label}</span>
                <span className="block text-muted">블로그 주소가 아직 연결되지 않았어요.</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
