// ─────────────────────────────────────────────────────────────
// 안드로이드 앱 ↔ 웹사이트 '주인 확인' 파일
// 주소: /.well-known/assetlinks.json
//
// ★ 왜 필요해요?
//   플레이스토어 앱(TWA)이 이 웹사이트를 열 때, 이 파일로 "같은 주인"임을 확인하면
//   위쪽 주소창 없이 진짜 앱처럼 꽉 찬 화면으로 보여 줍니다.
//
// ★ 코드를 고칠 필요 없이 Vercel 환경변수 2개만 넣으면 됩니다.
//   - TWA_PACKAGE_NAME : PWABuilder에서 정한 패키지 이름 (예: app.vercel.mungspoon.twa)
//   - TWA_SHA256       : 서명 지문(SHA-256). 여러 개면 쉼표(,)로 구분
//                        (PWABuilder 키 + 플레이 콘솔 '앱 서명 키' 둘 다 넣는 걸 추천)
//   값이 없으면 빈 목록 []을 돌려줍니다 (웹사이트 동작에는 영향 없음).
// ─────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic"; // 환경변수를 바꾸면 다시 배포 없이도 반영되도록

export function GET() {
  const pkg = process.env.TWA_PACKAGE_NAME?.trim();
  const prints = (process.env.TWA_SHA256 ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const body =
    pkg && prints.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: prints },
          },
        ]
      : [];

  return Response.json(body, { headers: { "cache-control": "public, max-age=300" } });
}
