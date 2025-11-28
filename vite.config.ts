import { defineConfig } from 'vite';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

export default defineConfig(({ mode }) => {
  const envPath = path.resolve(process.cwd(), '.env');
  let env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const parsed = dotenv.parse(envFile);
    env = parsed;
    console.log('Loaded .env file:', parsed);
  } else {
    console.warn('.env file not found at:', envPath);
  }

  return {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      host: true,
      port: 5173,
    },
    define: {
      'import.meta.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'prod'),
    },
    build: {
      // 최적화 옵션 조정 (디버깅용)
      minify: 'esbuild', // 기본값, 더 빠르고 설치 불필요
      // 소스맵 생성 (디버깅용)
      sourcemap: true,
      // 코드 분할 최적화 완화
      rollupOptions: {
        output: {
          manualChunks: undefined, // 수동 청크 분할 비활성화
        },
      },
    },
  };
});
