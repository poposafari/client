import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import path from 'path';

export default defineConfig({
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
