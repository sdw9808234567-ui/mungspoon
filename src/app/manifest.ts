// ─────────────────────────────────────────────────────────────
// 앱 설치 정보(웹 앱 매니페스트) — 주소: /manifest.webmanifest
//
// ★ 이 파일이 있으면 휴대폰에서 '홈 화면에 추가'로 앱처럼 설치할 수 있고,
//   PWABuilder(구글 플레이 포장 도구)가 이 정보를 읽어 안드로이드 앱(.aab)을 만듭니다.
// ★ Next.js가 이 파일을 자동으로 <link rel="manifest">로 연결해 줍니다.
// ─────────────────────────────────────────────────────────────
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "멍스푼 - 강아지 수제간식 레시피", // 설치 화면·스토어에 보이는 전체 이름
    short_name: "멍스푼", // 휴대폰 홈 화면 아이콘 아래 이름 (짧게)
    description: "집에 있는 재료의 안전성을 먼저 확인하고, 통과한 재료로만 강아지 수제간식 레시피를 만들어요.",
    lang: "ko",
    dir: "ltr",
    start_url: "/", // 앱을 켜면 처음 열리는 화면
    scope: "/",
    display: "standalone", // 주소창 없이 진짜 앱처럼 보이게
    orientation: "portrait", // 세로 화면 고정
    background_color: "#fbf6ec", // 앱이 켜질 때 잠깐 보이는 바탕색 (크림)
    theme_color: "#fbf6ec", // 상단 상태표시줄 색
    categories: ["food", "lifestyle"],
    icons: [
      // any = 일반 아이콘, maskable = 안드로이드가 동그라미·네모 등으로 잘라 쓰는 아이콘
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
