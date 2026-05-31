import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import path from 'path';
import { execSync } from 'node:child_process';

const buildSha = (() => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
})();

const buildVersion = (() => {
  if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }
  try {
    return execSync('git describe --tags --abbrev=0', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
})();

const buildAt = new Date().toISOString();

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
    __BUILD_AT__: JSON.stringify(buildAt),
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  plugins: [
    // 브라우저 화면에 오버레이로 타입 에러를 띄워줌 (개발 편의성 UP)
    checker({ typescript: true }),
  ],
  server: {
    port: 3000, // 클라이언트 포트 고정
    open: true, // 실행 시 브라우저 자동 열기
    watch: {
      ignored: ['**/legacy/**'],
    },
  },
  build: {
    target: 'esnext', // 최신 JS 문법 사용 (Phaser 성능 최적화)
    assetsInlineLimit: 0, // 모든 에셋을 파일로 처리 (Base64 변환 방지)
  },
  resolve: {
    alias: {
      '@poposafari': path.resolve(__dirname, './src'),
    },
  },
});
