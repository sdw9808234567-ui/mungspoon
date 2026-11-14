// ─────────────────────────────────────────────────────────────
// 멍스푼 일러스트 모음 (사진 대신 쓰는 고급 SVG 그림)
//
// ★ SVG = 코드로 그리는 그림이라 아무리 확대해도 깨지지 않고,
//   파일 용량도 사진보다 훨씬 작아서 앱이 빨리 열립니다.
// ★ 그라데이션(색이 자연스럽게 번지는 효과)·그림자·접시·토핑을 넣어
//   '진짜 간식처럼' 입체감 있게 그렸어요.
// ★ 한 화면에 같은 그림이 여러 번 나와도 색 정보가 섞이지 않도록
//   useId()로 그림마다 고유한 이름표(id)를 붙입니다.
// ─────────────────────────────────────────────────────────────
import { useId } from "react";
import type { TreatType } from "@/lib/types";

/* ── 공통 색상표 ── */
const C = {
  doughHi: "#f6d29a", // 반죽 밝은 부분
  dough: "#e0a85c", // 반죽 기본
  doughLo: "#b9772f", // 반죽 그늘
  crust: "#9c6128", // 겉면 진한 부분
  cream: "#fffaf0", // 크림·요거트
  berry: "#4a4b8c", // 블루베리
  berryHi: "#8d8fd0",
  carrot: "#ec8f3c", // 당근
  leaf: "#7da35a", // 잎(파슬리·민트)
  shadow: "rgba(90,55,20,0.22)",
};

/* 간식 종류마다 배경 파스텔 색을 다르게 (가운데 밝게 → 가장자리 진하게) */
const BG: Record<TreatType, [string, string]> = {
  cookie: ["#fff4e4", "#f5d9b8"],
  bread: ["#fff8e2", "#f2e0b0"],
  muffin: ["#fff0ec", "#f1cfc4"],
  cake: ["#f4f7ea", "#d9e4c6"],
  pudding: ["#fffbe3", "#f4e3a0"],
  donut: ["#fff0f2", "#f2cfd6"],
  bite: ["#f1f5ea", "#d6e2c4"],
  soft: ["#eef5f8", "#cbdde8"],
};

/** 도넛 위 요거트 글레이즈처럼 '물결치는 타원' 모양의 선을 만드는 도우미 함수 */
function wavyEllipse(cx: number, cy: number, rx: number, ry: number, wave: number, bumps: number) {
  const pts: string[] = [];
  const steps = 96; // 점을 많이 찍을수록 부드러워요
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    // 아래쪽(sin>0)에서만 물결이 흘러내리도록 → 흘러내린 요거트 느낌
    const drip = Math.max(0, Math.sin(t)) * wave * (0.6 + 0.4 * Math.cos(t * bumps));
    const x = cx + Math.cos(t) * rx;
    const y = cy + Math.sin(t) * (ry + drip);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ") + "Z";
}

/** 일정한 규칙으로 흩뿌린 점 위치 (매번 같은 위치가 나오도록 난수 대신 계산식 사용) */
function scatter(n: number, cx: number, cy: number, rx: number, ry: number, seed = 1) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 137.5 + seed * 40) * (Math.PI / 180); // 해바라기 씨앗 배열(황금각)
    const r = Math.sqrt((i + 0.5) / n);
    return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r, i };
  });
}

/**
 * 간식 종류별 일러스트 (사진이 없을 때 보여 주는 '예시 그림')
 * 실제 완성 사진은 '만든 기록'에 직접 찍어 올릴 수 있습니다.
 * - type: 간식 종류, className: 크기·모서리 둥글기 등
 */
export function TreatArt({ type, className = "" }: { type: TreatType; className?: string }) {
  const uid = useId().replace(/:/g, ""); // 그림마다 고유한 이름표
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const [bgIn, bgOut] = BG[type];

  return (
    <svg viewBox="0 0 240 200" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="간식 예시 그림">
      <defs>
        {/* 배경: 가운데가 밝은 원형 그라데이션 */}
        <radialGradient id={id("bg")} cx="50%" cy="42%" r="75%">
          <stop offset="0" stopColor={bgIn} />
          <stop offset="1" stopColor={bgOut} />
        </radialGradient>
        {/* 반죽: 위는 밝고 아래로 갈수록 노릇하게 */}
        <linearGradient id={id("dough")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.doughHi} />
          <stop offset="0.55" stopColor={C.dough} />
          <stop offset="1" stopColor={C.doughLo} />
        </linearGradient>
        {/* 쿠키 윗면: 가운데 밝고 가장자리 구운 색 */}
        <radialGradient id={id("bake")} cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#f7d7a2" />
          <stop offset="0.7" stopColor="#e2a95e" />
          <stop offset="1" stopColor="#c4813b" />
        </radialGradient>
        {/* 접시: 흰 도자기 느낌 */}
        <linearGradient id={id("plate")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ece2d3" />
        </linearGradient>
        {/* 반짝임(광택) */}
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* 부드러운 그림자 번짐 효과 */}
        <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* ① 배경 + 은은한 장식 점 */}
      <rect width="240" height="200" fill={url("bg")} />
      {[[30, 52, 3], [208, 46, 2.5], [196, 150, 3.5], [40, 156, 2], [214, 96, 2]].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.7" />
      ))}
      <Paw x={196} y={58} s={0.55} fill="#fff" opacity={0.45} />

      {/* ②③ 접시 + 간식: 작은 카드에서도 잘 보이도록 15% 크게 */}
      <g transform="translate(120 125) scale(1.15) translate(-120 -125)">
      {/* ② 접시 (모든 간식 공통) */}
      <ellipse cx="120" cy="160" rx="88" ry="15" fill={C.shadow} filter={url("soft")} />
      <ellipse cx="120" cy="152" rx="88" ry="20" fill={url("plate")} />
      <ellipse cx="120" cy="150" rx="68" ry="13" fill="#f8f2e8" stroke="#e6d9c6" strokeWidth="1" />

      {/* ③ 간식 본체 */}
      {type === "cookie" && <Cookie url={url} />}
      {type === "bread" && <Bread url={url} />}
      {type === "muffin" && <Muffin url={url} />}
      {type === "cake" && <Cake url={url} />}
      {type === "pudding" && <Pudding url={url} />}
      {type === "donut" && <Donut url={url} />}
      {type === "bite" && <Bite url={url} id={id} />}
      {type === "soft" && <Soft url={url} />}
      </g>
    </svg>
  );
}

type ArtProps = { url: (name: string) => string };

/** 강아지 발바닥 모양 (쿠키 도장·장식에 사용) */
function Paw({ x, y, s = 1, fill, opacity = 1 }: { x: number; y: number; s?: number; fill: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={opacity}>
      <ellipse cx="0" cy="8" rx="13" ry="10" />
      <ellipse cx="-15" cy="-6" rx="5.5" ry="7" transform="rotate(-20 -15 -6)" />
      <ellipse cx="-5" cy="-13" rx="5.5" ry="7" />
      <ellipse cx="6" cy="-13" rx="5.5" ry="7" />
      <ellipse cx="16" cy="-6" rx="5.5" ry="7" transform="rotate(20 16 -6)" />
    </g>
  );
}

/** 쿠키: 발바닥 도장이 찍힌 쿠키 2개 + 부스러기 */
function Cookie({ url }: ArtProps) {
  return (
    <g>
      {/* 뒤쪽 쿠키 (두께 → 윗면 순서로 그려 입체감) */}
      <ellipse cx="150" cy="122" rx="38" ry="30" fill={C.crust} />
      <ellipse cx="150" cy="116" rx="38" ry="30" fill={url("bake")} />
      {scatter(9, 150, 116, 28, 20, 3).map((p) => (
        <circle key={p.i} cx={p.x} cy={p.y} r="1.6" fill={C.crust} opacity="0.45" />
      ))}
      {/* 앞쪽 쿠키 */}
      <ellipse cx="104" cy="132" rx="46" ry="36" fill={C.crust} />
      <ellipse cx="104" cy="125" rx="46" ry="36" fill={url("bake")} />
      <ellipse cx="104" cy="125" rx="46" ry="36" fill="none" stroke="#b06f2e" strokeOpacity="0.35" strokeWidth="2" />
      {/* 발바닥 도장: 밝은 테두리(아래) + 진한 홈(위)으로 '눌린' 느낌 */}
      <Paw x={104} y={127} s={1.05} fill="#fbe2b6" opacity={0.8} />
      <Paw x={104} y={125.5} s={1} fill="#b8783a" opacity={0.75} />
      {/* 반죽 표면 점 */}
      {scatter(14, 104, 125, 38, 28, 7).map((p) => (
        <circle key={p.i} cx={p.x} cy={p.y} r="1.4" fill={C.crust} opacity="0.3" />
      ))}
      {/* 접시 위 부스러기 */}
      <path d="M58 150l4-3 3 3-4 2z M168 148l3-2 3 2-3 3z M178 154l2-2 2 2-2 1z M64 158l2-2 3 2-3 1z" fill="#d39a52" />
    </g>
  );
}

/** 강아지 빵(찐빵): 폭신한 돔 + 뼈다귀 도장 + 고구마 조각 + 김 */
function Bread({ url }: ArtProps) {
  return (
    <g>
      {/* 김 (모락모락) */}
      {[96, 120, 144].map((x, i) => (
        <path key={x} d={`M${x} ${62 - i * 2}c-6-8 6-12 0-20s6-12 0-18`} stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />
      ))}
      {/* 종이 받침 */}
      <path d="M58 138h124l-8 16H66z" fill="#fff" stroke="#eadfcd" />
      {/* 찐빵 돔 */}
      <path d="M56 142C54 98 84 72 120 72s66 26 64 70c-20 7-108 7-128 0z" fill="#f6dcaa" />
      <path d="M56 142C54 98 84 72 120 72s66 26 64 70c-20 7-108 7-128 0z" fill={url("dough")} opacity="0.35" />
      {/* 위쪽 광택 */}
      <ellipse cx="108" cy="90" rx="34" ry="11" fill={url("gloss")} opacity="0.8" />
      {/* 뼈다귀 모양 도장 */}
      <g fill="#c98d4a" opacity="0.55" transform="translate(120 112)">
        <rect x="-16" y="-3.5" width="32" height="7" rx="3.5" />
        <circle cx="-17" cy="-4" r="5" /><circle cx="-17" cy="4" r="5" />
        <circle cx="17" cy="-4" r="5" /><circle cx="17" cy="4" r="5" />
      </g>
      {/* 고구마 조각 */}
      {[[82, 120, -12], [158, 124, 15], [100, 134, 8], [142, 100, -6]].map(([x, y, r]) => (
        <rect key={`${x}`} x={x - 5} y={y - 4} width="10" height="8" rx="2.5" transform={`rotate(${r} ${x} ${y})`} fill="#f2b23f" stroke="#d48a1e" strokeWidth="1" />
      ))}
    </g>
  );
}

/** 머핀: 주름 종이컵 + 봉긋한 윗면 + 블루베리 */
function Muffin({ url }: ArtProps) {
  return (
    <g>
      {/* 종이컵 */}
      <path d="M68 108h104l-12 46H80z" fill="#e7a99f" />
      {Array.from({ length: 9 }, (_, i) => {
        const x1 = 74 + i * 11.5;
        const x2 = 84 + i * 9;
        return <path key={i} d={`M${x1} 110L${x2} 152`} stroke="#c97f74" strokeWidth="2" opacity="0.55" />;
      })}
      <path d="M68 108h104l-12 46H80z" fill="none" stroke="#c97f74" strokeOpacity="0.4" />
      {/* 봉긋한 윗부분 */}
      <path d="M60 114C54 78 86 56 120 56s66 22 60 58c-8 8-112 8-120 0z" fill={url("dough")} />
      <ellipse cx="104" cy="74" rx="26" ry="8" fill={url("gloss")} opacity="0.7" />
      {/* 갈라진 결 */}
      <path d="M88 92q10-6 18 2M128 84q10-4 16 4" stroke={C.crust} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* 블루베리 */}
      {[[96, 80], [126, 70], [148, 92], [112, 100]].map(([x, y]) => <Berry key={`${x}`} x={x} y={y} />)}
    </g>
  );
}

/** 블루베리 한 알 (반짝임 + 꼭지) */
function Berry({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.berry} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill={C.berryHi} />
      <path d={`M${x - 2} ${y + r * 0.45}l2-2 2 2`} stroke="#2c2d5c" strokeWidth="1.2" fill="none" />
    </g>
  );
}

/** 케이크: 2단 시트 + 요거트 크림 + 블루베리 + 뼈다귀 쿠키 장식 */
function Cake({ url }: ArtProps) {
  return (
    <g>
      {/* 시트 옆면 (원통) */}
      <path d="M62 92v46a58 14 0 0 0 116 0V92z" fill={url("dough")} />
      {/* 가운데 크림층 */}
      <path d="M62 112a58 14 0 0 0 116 0v8a58 14 0 0 1-116 0z" fill={C.cream} />
      {/* 윗면 크림 + 흘러내림 */}
      <ellipse cx="120" cy="92" rx="58" ry="14" fill={C.cream} />
      <path d="M62 92a58 14 0 0 0 116 0v4c-4 0-4 10-9 10s-4-7-9-7-5 12-11 12-5-9-10-9-6 8-11 8-5-6-10-6-6 10-11 10-5-8-10-8-5 6-9 6-5-8-8-8-4 5-8 5z" fill={C.cream} />
      <ellipse cx="104" cy="88" rx="26" ry="5" fill="#fff" opacity="0.9" />
      {/* 뼈다귀 쿠키 장식 */}
      <g transform="translate(120 70) rotate(-12)" fill={C.dough} stroke={C.doughLo} strokeWidth="1.2">
        <rect x="-18" y="-4.5" width="36" height="9" rx="4.5" />
        <circle cx="-19" cy="-5" r="6" /><circle cx="-19" cy="5" r="6" />
        <circle cx="19" cy="-5" r="6" /><circle cx="19" cy="5" r="6" />
      </g>
      {/* 블루베리 + 민트잎 */}
      <Berry x={86} y={90} r={6} />
      <Berry x={152} y={92} r={6} />
      <Berry x={140} y={84} r={5} />
      <path d="M96 84c6-8 14-6 14-6s-2 8-14 6z" fill={C.leaf} />
    </g>
  );
}

/** 푸딩: 하얀 라메킨 그릇 + 단호박 커스터드 + 멍스푼 숟가락 */
function Pudding({ url }: ArtProps) {
  return (
    <g>
      {/* 그릇 몸통 (세로 홈 무늬) */}
      <path d="M74 98l8 50q38 10 76 0l8-50z" fill={url("plate")} stroke="#e2d5c2" />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${86 + i * 11.5} 104l${(i - 3) * 0.6} 42`} stroke="#e5d9c7" strokeWidth="2" />
      ))}
      {/* 그릇 입구 + 푸딩 표면 */}
      <ellipse cx="120" cy="98" rx="46" ry="11" fill="#f3ebde" />
      <ellipse cx="120" cy="100" rx="40" ry="8.5" fill="#f0c04f" />
      <ellipse cx="112" cy="98" rx="20" ry="3.5" fill="#fff" opacity="0.6" />
      {/* 토핑: 블루베리 + 민트잎 */}
      <Berry x={132} y={98} r={5} />
      <path d="M116 98c4-7 12-6 12-6s-2 7-12 6z" fill={C.leaf} />
      {/* 접시 위 숟가락 (멍스푼 로고처럼 발바닥 무늬) */}
      <g transform="translate(184 140) rotate(-30)">
        <rect x="-3" y="0" width="6" height="34" rx="3" fill="#8a6244" />
        <ellipse cx="0" cy="-6" rx="9" ry="12" fill="#a77a55" />
        <ellipse cx="0" cy="-5" rx="3" ry="2.5" fill="#f0e4cd" />
      </g>
    </g>
  );
}

/** 도넛(오븐에 구운): 링 + 흘러내린 요거트 + 채소 스프링클 */
function Donut({ url }: ArtProps) {
  // 도넛 링 모양: 바깥 타원 - 안쪽 구멍 (evenodd = 겹친 부분을 비워 줌)
  const ring = (dy: number) =>
    `M70 ${112 + dy}a50 38 0 1 0 100 0a50 38 0 1 0-100 0z M104 ${110 + dy}a16 10 0 1 1 32 0a16 10 0 1 1-32 0z`;
  const glaze = wavyEllipse(120, 106, 44, 30, 9, 5) + ` M106 108a14 8.5 0 1 1 28 0a14 8.5 0 1 1-28 0z`;
  const sprinkles = [
    [96, 92, 20, C.carrot], [140, 90, -30, C.leaf], [150, 110, 60, "#e58fa0"], [92, 118, -50, C.leaf],
    [120, 84, 80, "#e58fa0"], [134, 124, 10, C.carrot], [108, 128, 40, "#e58fa0"], [82, 104, 70, C.carrot],
  ] as const;
  return (
    <g>
      <path d={ring(8)} fill={C.crust} fillRule="evenodd" />
      <path d={ring(0)} fill={url("dough")} fillRule="evenodd" />
      <path d={glaze} fill={C.cream} fillRule="evenodd" />
      <ellipse cx="104" cy="92" rx="18" ry="5" fill="#fff" />
      {sprinkles.map(([x, y, r, c]) => (
        <rect key={`${x}-${y}`} x={x - 4} y={y - 1.5} width="8" height="3" rx="1.5" transform={`rotate(${r} ${x} ${y})`} fill={c} />
      ))}
    </g>
  );
}

/** 한입 간식: 동글동글 경단 5개 + 파슬리·당근 콕콕 */
function Bite({ url, id }: ArtProps & { id: (n: string) => string }) {
  const balls = [
    { x: 86, y: 132, c: "#e8b878" }, { x: 120, y: 136, c: "#dc9a5a" }, { x: 154, y: 132, c: "#e8b878" },
    { x: 103, y: 106, c: "#dc9a5a" }, { x: 137, y: 106, c: "#e8b878" },
  ];
  return (
    <g>
      <defs>
        {/* 공 모양 입체감: 왼쪽 위 밝게 */}
        <radialGradient id={id("ball")} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#7a4a1c" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {balls.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r="20" fill={b.c} />
          <circle cx={b.x} cy={b.y} r="20" fill={url("ball")} />
          {/* 파슬리(초록)·당근(주황) 알갱이 */}
          <circle cx={b.x - 6} cy={b.y + 3} r="1.8" fill={C.leaf} />
          <circle cx={b.x + 7} cy={b.y - 2} r="1.6" fill={C.carrot} />
          <circle cx={b.x + 2} cy={b.y + 9} r="1.5" fill={C.leaf} />
        </g>
      ))}
    </g>
  );
}

/** 말랑한 간식: 반투명 젤리 큐브 3개 + 사과 조각 */
function Soft({ url }: ArtProps) {
  const cubes = [
    { x: 76, y: 112, c: "#f8e6a6", e: "#e7c968" }, // 사과 젤리
    { x: 126, y: 116, c: "#fbf3e2", e: "#e5d6b8" }, // 두부 말랑이
    { x: 102, y: 78, c: "#f6cfc4", e: "#e3a99a" }, // 단호박·비트 핑크
  ];
  return (
    <g>
      {cubes.map((q, i) => (
        <g key={i}>
          {/* 옆면(두께) → 앞면 → 광택 순서 */}
          <rect x={q.x} y={q.y + 6} width="44" height="38" rx="12" fill={q.e} />
          <rect x={q.x} y={q.y} width="44" height="38" rx="12" fill={q.c} opacity="0.95" />
          <rect x={q.x + 6} y={q.y + 4} width="22" height="8" rx="4" fill={url("gloss")} />
          {/* 속에 보이는 재료 조각 */}
          <circle cx={q.x + 30} cy={q.y + 24} r="3" fill={q.e} />
          <circle cx={q.x + 16} cy={q.y + 28} r="2.2" fill={q.e} />
        </g>
      ))}
      {/* 사과 조각 */}
      <path d="M170 140c4-14 22-14 22 0z" fill="#f6efd8" stroke="#d9534f" strokeWidth="3" />
      <circle cx="181" cy="135" r="1.5" fill="#5b3a1e" />
    </g>
  );
}

/**
 * 홈 화면 대표 캐릭터: 쿠키를 든 강아지
 * (하쿠 사진이 생기면 이 자리를 사진으로 바꿀 수 있어요)
 */
export function DogHero({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const fur = `${uid}-fur`;
  return (
    <svg viewBox="0 0 200 190" className={className} role="img" aria-label="쿠키를 들고 있는 강아지 그림">
      <defs>
        <radialGradient id={fur} cx="45%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#efd9b8" />
        </radialGradient>
      </defs>
      {/* 바닥 그림자 */}
      <ellipse cx="100" cy="182" rx="62" ry="7" fill="rgba(90,55,20,0.18)" />
      {/* 몸통 */}
      <path d="M46 182c-4-40 18-62 54-62s58 22 54 62z" fill={`url(#${fur})`} />
      {/* 스카프 (멍스푼 브라운 + 흰 점) */}
      <path d="M58 126q42 22 84 0l-6 14q-36 16-72 0z" fill="#6f4e37" />
      <path d="M92 136l8 22 8-22z" fill="#6f4e37" />
      {[[74, 132], [100, 140], [126, 132], [100, 150]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#f0e4cd" />)}
      {/* 귀 (뒤) */}
      <path d="M50 52C26 56 22 104 40 116c14 8 22-20 24-44z" fill="#c99a6b" />
      <path d="M150 52c24 4 28 52 10 64-14 8-22-20-24-44z" fill="#c99a6b" />
      {/* 머리 */}
      <ellipse cx="100" cy="76" rx="54" ry="48" fill={`url(#${fur})`} />
      {/* 정수리 곱슬 털 */}
      <path d="M90 30q6-10 12-2q6-8 10 2" stroke="#e6cba4" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* 볼 터치 */}
      <ellipse cx="66" cy="96" rx="10" ry="6" fill="#f4b6a6" opacity="0.6" />
      <ellipse cx="134" cy="96" rx="10" ry="6" fill="#f4b6a6" opacity="0.6" />
      {/* 주둥이 */}
      <ellipse cx="100" cy="98" rx="24" ry="17" fill="#fffdf6" />
      {/* 눈 (반짝임 2개) */}
      {[78, 122].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="78" rx="7.5" ry="8.5" fill="#2b1d14" />
          <circle cx={x + 2.5} cy="74.5" r="2.6" fill="#fff" />
          <circle cx={x - 2.5} cy="82" r="1.2" fill="#fff" />
        </g>
      ))}
      {/* 코 */}
      <path d="M92 89q8-4 16 0q-2 8-8 9q-6-1-8-9z" fill="#3a2a1e" />
      <ellipse cx="97" cy="90" rx="3" ry="1.5" fill="#fff" opacity="0.6" />
      {/* 입 + 혀 */}
      <path d="M90 101q5 6 10 1q5 5 10-1" stroke="#3a2a1e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M96 104q4 10 8 0z" fill="#ef8f8a" />
      {/* 앞발 + 쿠키 */}
      <ellipse cx="100" cy="164" rx="24" ry="18" fill="#c4813b" />
      <ellipse cx="100" cy="161" rx="24" ry="18" fill="#e6ad63" />
      <Paw x={100} y={161} s={0.55} fill="#b8783a" opacity={0.7} />
      <ellipse cx="72" cy="170" rx="15" ry="11" fill="#fffaf0" stroke="#e6cba4" />
      <ellipse cx="128" cy="170" rx="15" ry="11" fill="#fffaf0" stroke="#e6cba4" />
      <path d="M68 166v6M74 166v6M124 166v6M130 166v6" stroke="#e0c49c" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
