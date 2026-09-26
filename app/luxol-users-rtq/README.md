# Users RTK Query + cart integration

## Users RTQ (new)
- redux/types/users.ts        — UserProfile, UpdateProfileRequest,
                                  ChangePasswordRequest, UploadAvatarResponse,
                                  Address, CreateAddressRequest, UpdateAddressRequest
- redux/slices/usersApi.ts    — the 8 endpoints below
- redux/config/apiRoutes.ts   — added the `users` section
- redux/slices/baseApi.ts     — added "User" and "Addresses" to tagTypes
- redux/config/axiosBaseQuery.ts — removed the hardcoded
  `Content-Type: application/json` default. It was harmless for JSON
  bodies (axios sets that itself) but would have broken uploadAvatar's
  multipart boundary, since a manually-set Content-Type header always
  wins over the one the browser would otherwise generate for FormData.
- redux/types/index.ts        — now also re-exports ./users

Endpoints:

  GET    /users/me                  getMe
  PATCH  /users/me                  updateProfile
  POST   /users/me/avatar           uploadAvatar   (multipart/form-data)
  PATCH  /users/me/password         changePassword
  GET    /users/me/addresses        listAddresses
  POST   /users/me/addresses        addAddress
  PATCH  /users/me/addresses/:id    updateAddress
  DELETE /users/me/addresses/:id    deleteAddress

## Account page — no more dummy data

Per your ask, this isn't just a parallel unused contract like the first
pass at orders/cart — the /account page itself was rewired:

- app/data/account-data.ts no longer has UserProfile/Address types or
  INITIAL_PROFILE/INITIAL_ADDRESSES mock arrays. All it holds now is
  genuinely static UI config (the Nigerian states list, the sidebar's tab
  labels) — nothing that pretends to be a real user.
- PersonalInformationPanel.tsx now calls useGetMeQuery / useUpdateProfileMutation
  / useUploadAvatarMutation / useChangePasswordMutation. Shows a loading
  skeleton, an error state with Retry, and per-form error/success messages
  driven by the mutations' actual results.
- ManageAddressPanel.tsx now calls useListAddressesQuery / useAddAddressMutation
  / useUpdateAddressMutation / useDeleteAddressMutation. Same loading/error
  treatment; per-row "Removing…" state on delete.
- Avatar.tsx uploads the real File via FormData (useUploadAvatarMutation)
  instead of stashing a data: URL in local state. It shows an instant local
  object-URL preview while the upload is in flight, then defers to the
  server's avatarUrl once it resolves.

Without a live backend (no NEXT_PUBLIC_API_URL), the panels will now
genuinely show their loading skeleton and then an error state with a
"Try again" button — that's the intended, honest behavior of removing the
dummy data, not a bug. Point NEXT_PUBLIC_API_URL at a real NestJS backend
implementing the routes above and it starts working as-is.

## Cart RTQ — integrated into CartDrawer.tsx

- Delivery methods: now fetched with useGetDeliveryMethodsQuery(). Falls
  back to the DELIVERY_METHODS array in redux/types/checkout.ts (same
  shape) while loading or if the request fails, so the select never
  renders empty.
- Checkout now calls useValidateCartMutation() right before placeOrder,
  to re-check stock/current prices. If the backend reports issues, the
  person sees them and checkout is blocked instead of silently placing a
  stale order.
- Removed two now-fully-dead files: app/lib/checkout.ts and
  app/lib/cart-store.ts (the pre-Redux mock cart/checkout implementation
  CartDrawer no longer imports from anything, now that it gets
  DELIVERY_METHODS from redux/types instead). Nothing else in the repo
  referenced either file.
- Fixed two pre-existing `any` types in CartDrawer.tsx to CartItem while
  in there.

Verified with `tsc --noEmit` and `eslint` against the whole repo (only the
same handful of pre-existing, unrelated warnings elsewhere), plus a
dev-server boot check of /, /shop and /account.
