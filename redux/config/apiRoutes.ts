/**
 * Every backend path in one place.
 * These are best guesses: change them to match your NestJS controllers.
 */
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
  },
  cart: {
    validatePromo: "/promo-codes/validate",
  },
  orders: {
    create: "/orders",
  },
} as const;
