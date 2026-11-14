"use client";
// ─────────────────────────────────────────────────────────────
// 기기 저장소 (localStorage) — 프로필·레시피·즐겨찾기·만든 기록 보관
//
// ★ 지금은 "이 휴대폰의 브라우저"에만 저장됩니다. (회원가입 없이 바로 사용)
//   브라우저 데이터를 지우거나 다른 기기로 바꾸면 보이지 않습니다.
//   나중에 Supabase(온라인 DB)를 붙일 때는 이 파일의 read/write만 바꾸면 됩니다.
// ─────────────────────────────────────────────────────────────
import { useMemo, useSyncExternalStore } from "react";
import { EMPTY_PROFILE, type DogProfile, type MakeLog, type Recipe } from "./types";

export const KEYS = {
  profile: "ms_profile",
  recipes: "ms_recipes", // 최근 생성 레시피 (최신순, 최대 30개)
  favorites: "ms_favorites", // 즐겨찾기한 레시피 id 목록
  viewed: "ms_viewed", // 최근 본 레시피 id 목록
  logs: "ms_logs", // 직접 만든 간식 기록
} as const;

const EVENT = "ms-store-change";

/** 저장소 읽기 (없거나 깨져 있으면 기본값) */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** 저장소 쓰기 — 성공하면 true, 용량 초과 등으로 실패하면 false */
export function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVENT)); // 화면들에게 "바뀌었어요" 알림
    return true;
  } catch {
    return false;
  }
}

// 저장소가 바뀌면 화면을 다시 그리도록 React에 연결하는 부분
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * 저장된 값을 화면에서 쓰는 훅
 * @returns [값, 불러오기 완료 여부]
 */
export function useStored<T>(key: string, fallback: T): [T, boolean] {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    () => undefined, // 서버에서 미리 그릴 때는 '아직 모름'
  );
  const value = useMemo(() => {
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }, [raw, fallback]);
  return [value, raw !== undefined];
}

// 기본값은 매번 새로 만들면 화면이 계속 다시 그려지므로 한 번만 만들어 둡니다
const NO_RECIPES: Recipe[] = [];
const NO_IDS: string[] = [];
const NO_LOGS: MakeLog[] = [];

export const useProfile = () => useStored<DogProfile>(KEYS.profile, EMPTY_PROFILE);
export const useRecipes = () => useStored<Recipe[]>(KEYS.recipes, NO_RECIPES);
export const useFavorites = () => useStored<string[]>(KEYS.favorites, NO_IDS);
export const useViewed = () => useStored<string[]>(KEYS.viewed, NO_IDS);
export const useLogs = () => useStored<MakeLog[]>(KEYS.logs, NO_LOGS);

/** 새 레시피 저장 (즐겨찾기한 레시피는 30개 제한에서 지워지지 않게 보호) */
export function saveRecipe(recipe: Recipe): boolean {
  const favs = read<string[]>(KEYS.favorites, []);
  const all = [recipe, ...read<Recipe[]>(KEYS.recipes, []).filter((r) => r.id !== recipe.id)];
  const kept = all.filter((r, i) => i < 30 || favs.includes(r.id));
  return write(KEYS.recipes, kept);
}

/** 즐겨찾기 켜기/끄기 */
export function toggleFavorite(id: string): boolean {
  const favs = read<string[]>(KEYS.favorites, []);
  return write(KEYS.favorites, favs.includes(id) ? favs.filter((f) => f !== id) : [id, ...favs]);
}

/** 최근 본 레시피에 추가 (최대 10개) */
export function markViewed(id: string) {
  const viewed = read<string[]>(KEYS.viewed, []);
  if (viewed[0] === id) return;
  write(KEYS.viewed, [id, ...viewed.filter((v) => v !== id)].slice(0, 10));
}

/** 만든 기록 추가 */
export function addLog(log: MakeLog): boolean {
  return write(KEYS.logs, [log, ...read<MakeLog[]>(KEYS.logs, [])]);
}

/** 만든 기록 삭제 */
export function removeLog(id: string) {
  write(KEYS.logs, read<MakeLog[]>(KEYS.logs, []).filter((l) => l.id !== id));
}

/**
 * 사진을 작게 줄여서 글자(data URL)로 바꾸기
 * 휴대폰 사진은 몇 MB라 그대로는 저장할 수 없어, 긴 변 640px·JPEG로 줄입니다.
 */
export function shrinkPhoto(file: File, maxSide = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 읽지 못했어요."));
    };
    img.src = url;
  });
}
