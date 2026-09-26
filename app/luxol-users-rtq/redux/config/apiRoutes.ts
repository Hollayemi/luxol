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
    deliveryMethods: "/delivery-methods",
    get: "/cart",
    sync: "/cart",
    merge: "/cart/merge",
    validate: "/cart/validate",
  },
  orders: {
    create: "/orders",
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    tracking: (id: string) => `/orders/${id}/tracking`,
    rating: (id: string) => `/orders/${id}/rating`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    returnEligibility: (id: string) => `/orders/${id}/return/eligibility`,
    requestReturn: (id: string) => `/orders/${id}/return`,
    reorder: (id: string) => `/orders/${id}/reorder`,
  },
  users: {
    me: "/users/me",
    updateMe: "/users/me",
    avatar: "/users/me/avatar",
    password: "/users/me/password",
    addresses: "/users/me/addresses",
    address: (id: string) => `/users/me/addresses/${id}`,
  },
} as const;
