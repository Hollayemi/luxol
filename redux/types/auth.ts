export type User = {
  id: number | string;
  name: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

/** What the backend's login endpoints return inside `data` */
export type AuthPayload = {
  user: User;
  accessToken: string;
};
