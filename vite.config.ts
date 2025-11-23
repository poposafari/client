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
  };
});
