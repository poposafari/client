import type { TranslationError } from '../ko/error';

export const error: TranslationError = {
  unknown: 'An unexpected error occurred.',
  network: 'Network connection is unstable.',
  intervalServer: 'Sorry, server issue.',
  notFound: 'Resource not found.',
  invalidDTO: 'Values do not match.',
  sessionExpired: 'Session has expired.',
  userAlreadyExist: 'This user is already registered.',
  emptyUsername: 'Please enter your username.',
  emptyPassword: 'Please enter your password.',
  invalidUsernameOrPassword: 'Username or password does not match.',
  exceedTryLogin: 'Too many login attempts. You cannot log in at this time.',
  invalidInputUsername: 'Username must be 5 to 20 characters.',
  invalidInputPassword: 'Password must be 5 to 20 characters.',
  notMatchPasswordAndRePassword: 'Passwords do not match.',
  emptyNickname: 'Please enter your nickname.',
  invalidCostume: 'Invalid costume.',
  invalidNickname: 'Nickname must be 2 to 12 characters.',
};
