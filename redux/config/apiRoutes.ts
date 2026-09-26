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
  admin: {
    verifyInvite: "/admin/invitations/verify",
    acceptInvite: "/admin/invitations/accept",
  },
  inventory: {
    create: "/admin/inventory",
    stats: "/admin/inventory/stats",
    products: "/admin/inventory",
    product: (id: string) => `/admin/inventory/products/${id}`,
    categories: "/admin/inventory/categories",
    category: (id: string) => `/admin/inventory/categories/${id}`,
  },
   cart: {
    validatePromo: "/promo-codes/validate",
    deliveryMethods: "/delivery-methods",
    get: "/cart",
    sync: "/cart",
    merge: "/cart/merge",
    validate: "/cart/validate",
  },
  promotions: {
    stats: "/admin/promotions/stats",
    list: "/admin/promotions",
    detail: (id: string) => `/admin/promotions/${id}`,
    pause: (id: string) => `/admin/promotions/${id}/pause`,
    resume: (id: string) => `/admin/promotions/${id}/resume`,
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
