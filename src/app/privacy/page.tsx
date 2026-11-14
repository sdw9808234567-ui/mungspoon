// 개인정보처리방침 화면 — 주소: /privacy
// ★ 구글 플레이스토어에 앱을 올릴 때 '개인정보처리방침 주소'가 꼭 필요해서 만든 화면입니다.
// ★ 실제 코드 동작과 똑같이 적었어요. (기능을 바꾸면 이 내용도 함께 고쳐 주세요)
import { PageTitle, TopBar } from "@/components/ui";

const UPDATED = "2026년 11월 14일"; // 마지막 수정일

export default function PrivacyPage() {
  return (
    <main>
      <TopBar />
      <PageTitle title="개인정보처리방침" sub={`시행일: ${UPDATED}`} />
      <div className="space-y-6 px-5 pb-6 text-[16px] leading-relaxed">
        <Section title="1. 한눈에 보기">
          <ul className="list-disc space-y-1 pl-5">
            <li>멍스푼은 <b>회원가입이 없고</b>, 이름·전화번호·이메일 같은 개인정보를 수집하지 않아요.</li>
            <li>강아지 프로필, 만든 레시피, 즐겨찾기, 만든 기록(메모·사진)은 <b>사용자의 휴대폰 안에만</b> 저장돼요.</li>
            <li>광고·분석 도구를 쓰지 않으며, 정보를 다른 회사에 팔거나 넘기지 않아요.</li>
          </ul>
        </Section>

        <Section title="2. 휴대폰에만 저장되는 정보">
          <p>
            강아지 이름·체중·나이·알레르기·먹으면 안 되는 재료·건강 메모, 생성한 레시피, 즐겨찾기, 만든 기록의 메모와 사진은
            브라우저 저장소(localStorage)에 보관돼요. 사진은 휴대폰 안에서 작게 줄여 저장하며 서버로 보내지 않아요.
            앱을 지우거나 브라우저 데이터를 삭제하면 함께 지워져요.
          </p>
        </Section>

        <Section title="3. 서버로 잠깐 보내는 정보">
          <p>
            재료 안전성 분석과 레시피 생성을 위해, 선택한 <b>재료 이름</b>과 <b>간식 종류</b>, 그리고 등록한
            <b> 강아지 프로필(이름·체중·나이·알레르기·먹으면 안 되는 재료·건강 메모)</b>을 멍스푼 서버(Vercel)로 보내요.
            이 정보는 알레르기 재료를 걸러 내고 주의사항을 만드는 데만 쓰이며 <b>서버에 저장하지 않아요.</b>
          </p>
          <p className="mt-2">
            AI 기능이 켜져 있는 경우에만, 안전성 검사를 통과한 재료 이름과 프로필의 알레르기·먹으면 안 되는 재료·건강 메모가
            레시피 작성을 위해 AI 서비스(Anthropic)로 전달돼요. 현재 기본 설정은 AI를 사용하지 않아요.
          </p>
        </Section>

        <Section title="4. 사진·카메라 권한">
          <p>‘만든 기록’에 사진을 넣을 때만 사진 선택 화면을 열어요. 고른 사진은 휴대폰에만 저장돼요.</p>
        </Section>

        <Section title="5. 외부 링크">
          <p>블로그 버튼은 네이버 블로그 ‘바른 멍생활’로 이동해요. 이동한 사이트는 해당 사이트의 개인정보처리방침을 따라요.</p>
        </Section>

        <Section title="6. 어린이">
          <p>멍스푼은 어린이를 대상으로 하지 않으며, 어린이의 개인정보를 일부러 수집하지 않아요.</p>
        </Section>

        <Section title="7. 문의">
          <p>
            개인정보 관련 문의는 네이버 블로그 ‘바른 멍생활’(blog.naver.com/ssm4579)의 댓글·쪽지로 남겨 주세요.
            방침이 바뀌면 이 화면에서 시행일과 함께 알려 드려요.
          </p>
        </Section>
      </div>
    </main>
  );
}

/** 소제목 + 내용 묶음 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-paper p-4 shadow-card">
      <h2 className="mb-2 font-display text-[19px] font-bold">{title}</h2>
      {children}
    </section>
  );
}
