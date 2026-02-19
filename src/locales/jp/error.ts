import type { TranslationError } from '../ko/error';

export const error: TranslationError = {
  unknown: '予期しないエラーが発生しました。',
  network: 'ネットワークが不安定です。',
  intervalServer: 'サーバー側の問題です。',
  notFound: 'リソースが見つかりません。',
  invalidDTO: '値が一致しません。',
  sessionExpired: 'セッションの有効期限が切れました。',
  userAlreadyExist: 'このユーザーは既に登録されています。',
  emptyUsername: 'ユーザー名を入力してください。',
  emptyPassword: 'パスワードを入力してください。',
  invalidUsernameOrPassword: 'ユーザー名またはパスワードが\n一致しません。',
  exceedTryLogin: 'ログイン試行回数が多すぎます。\nしばらくログインできません。',
  invalidInputUsername: 'ユーザー名は5文字以上20文字以下で\n入力してください。',
  invalidInputPassword: 'パスワードは5文字以上20文字以下で\n入力してください。',
  notMatchPasswordAndRePassword: 'パスワードが一致しません。',
  emptyNickname: 'ニックネームを入力してください。',
  invalidCostume: '無効なコスチュームです。',
  invalidNickname: 'ニックネームは2文字以上12文字以下で\n入力してください。',
};
