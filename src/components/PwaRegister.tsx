"use client";
// 서비스 워커(public/sw.js)를 등록하는 보이지 않는 부품
// - 실제 배포(production)에서만 켭니다. 개발 중에는 예전 파일이 남아 헷갈리지 않도록 끕니다.
// - 화면에는 아무것도 그리지 않아요.
import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return; // 지원하지 않는 브라우저는 그냥 넘어감
    // 화면이 다 열린 뒤에 등록해서 첫 화면 속도에 영향이 없게 합니다
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
