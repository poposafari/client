import { defineConfig } from 'vite';

export default defineConfig({
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://poposafari.xyz',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
