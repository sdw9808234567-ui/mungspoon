// 모든 화면을 감싸는 공통 틀 (로고가 있는 상단 + 하단 내비게이션)
import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "멍스푼 — 우리 강아지를 위한 건강한 한입",
  description: "집에 있는 재료의 안전성을 먼저 확인하고, 통과한 재료로만 강아지 수제간식 레시피를 만들어요.",
  applicationName: "멍스푼",
  // 아이폰에서 '홈 화면에 추가'했을 때 앱처럼 보이게 하는 설정
  appleWebApp: { capable: true, title: "멍스푼", statusBarStyle: "default" },
};

// 스마트폰 화면 설정 (주소창 색을 크림색으로)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf6ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {/* 스마트폰 폭(최대 480px)으로 가운데 정렬. 아래쪽은 내비게이션 높이만큼 비워 둡니다 */}
        <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-cream pb-28">{children}</div>
        <BottomNav />
        {/* 앱 설치·오프라인 도우미 등록 (화면에는 안 보여요) */}
        <PwaRegister />
      </body>
    </html>
  );
}
