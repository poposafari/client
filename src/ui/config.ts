import i18next from '../i18n';

export let loginUsernameConfig: Input;
export let loginPasswordConfig: Input;
export let loginConfirmBtnConfig: Button;
export let loginRegisterBtnConfig: Button;
export let loginFindAccountBtnConfig: Button;

i18next.on('initialized', () => {
  loginUsernameConfig = {
    x: 0,
    y: -60,
    w: 240,
    h: 36,
    label: i18next.t('lobby:usernameLabel'),
    labelX: -101,
    labelY: -30,
    type: 'text',
    placeholder: i18next.t('lobby:usernamePlaceholder'),
    minLength: 6,
    maxLength: 16,
  };

  loginPasswordConfig = {
    x: 0,
    y: 10,
    w: 240,
    h: 36,
    label: i18next.t('lobby:passwordLabel'),
    labelX: -99,
    labelY: -30,
    type: 'password',
    placeholder: i18next.t('lobby:passwordPlaceholder'),
    minLength: 6,
    maxLength: 16,
  };

  loginConfirmBtnConfig = {
    x: 0,
    y: 65,
    w: 240,
    h: 36,
    content: i18next.t('lobby:login'),
    contentX: 0,
    contentY: 0,
  };

  loginRegisterBtnConfig = {
    x: -63,
    y: 115,
    w: 115,
    h: 36,
    content: i18next.t('lobby:register'),
    contentX: 0,
    contentY: 0,
  };

  loginFindAccountBtnConfig = {
    x: 63,
    y: 115,
    w: 115,
    h: 36,
    content: i18next.t('lobby:findAccount'),
    contentX: 0,
    contentY: 0,
  };
});
