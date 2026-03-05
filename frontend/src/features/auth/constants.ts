export const LOGIN_SUCCESS_REDIRECT = '/app/positions' as const;
export const REGISTER_SUCCESS_REDIRECT = '/app/positions' as const;
export const PROFILE_QUERY_KEY = ['me', 'profile'] as const;

export const PROFILE_ENDPOINTS = {
  me: '/auth/me',
  updateEmail: '/auth/me/email',
  changePassword: '/auth/me/password',
  deleteAccount: '/auth/me',
} as const;
