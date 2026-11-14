import type { NextConfig } from "next";

// Next.js 설정 파일
// - turbopack.rules: Tailwind CSS(디자인 도구)를 불러오기 위한 기본 설정입니다.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
