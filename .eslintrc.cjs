module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['airbnb-typescript/base', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    project: './tsconfig.json', // TypeScript 프로젝트 설정 파일 경로
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  rules: {
    // 프로젝트에 필요한 규칙 추가
  },
};
