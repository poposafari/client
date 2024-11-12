export const parser = '@typescript-eslint/parser';
export const extends = [
  'airbnb-typescript/base',
  'plugin:@typescript-eslint/recommended',
  'prettier',
  'plugin:import/errors',
  'plugin:import/warnings',
  'plugin:import/typescript',
];
export const parserOptions = {
  project: './tsconfig.json', // TypeScript 프로젝트 설정 파일 경로
  sourceType: 'module',
  ecmaVersion: 2020,
};
export const settings = {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: './tsconfig.json',
    },
  },
};
export const rules = {
  'import/extensions': [
    'error',
    'ignorePackages',
    {
      js: 'never',
      ts: 'never',
    },
  ],
  'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  '@typescript-eslint/no-unused-vars': 'warn', // 불필요한 변수 사용 경고
  'prefer-const': 'error', // const 사용 권장
  'no-useless-constructor': 'off',
  '@typescript-eslint/no-useless-constructor': 'error',
};
