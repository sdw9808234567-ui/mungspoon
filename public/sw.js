// ─────────────────────────────────────────────────────────────
// 멍스푼 서비스 워커 (앱 뒤에서 조용히 일하는 도우미)
//
// 하는 일
//  1) 한 번 열어 본 화면·글꼴·그림 파일을 휴대폰에 보관 → 다음엔 더 빨리 열림
//  2) 인터넷이 끊겨도 마지막으로 본 화면을 보여 줌 (안드로이드 앱 요건)
//
// 안전 원칙
//  - 재료 분석·레시피 생성(/api/)은 절대 보관하지 않고 항상 서버에 새로 물어봅니다.
//  - 화면(HTML)은 '인터넷 먼저' → 새 버전이 배포되면 바로 반영됩니다.
// ─────────────────────────────────────────────────────────────
const CACHE = "mungspoon-v1"; // 이름을 바꾸면 예전 보관본이 지워져요

// 설치 직후: 첫 화면을 미리 보관해 둡니다 (오프라인 대비)
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add("/")).catch(() => {}));
  self.skipWaiting(); // 새 버전을 기다리지 않고 바로 적용
});

// 새 버전이 켜지면: 이름이 다른 예전 보관함 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 우리 사이트의 '가져오기(GET)' 요청만 다룹니다. API는 건드리지 않아요.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // ① 화면 이동(HTML): 인터넷 먼저 → 실패하면 보관본 → 그것도 없으면 첫 화면
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // ② 빌드된 파일(/_next/static/)·아이콘: 이름에 버전이 붙어 내용이 안 바뀌므로 보관본 먼저
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          }),
      ),
    );
  }
});
