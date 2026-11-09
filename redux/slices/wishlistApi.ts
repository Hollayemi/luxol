import type { ApiSuccess } from "../types/api";
import type {
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
  WishlistIds,
  WishlistList,
} from "../types/wishlist";
import baseApi from "./baseApi";

/** Backend paths for the wishlist. Change them here to match your controller. */
export const WISHLIST_ROUTES = {
  list: "/wishlist",
  ids: "/wishlist/ids",
  add: "/wishlist",
  remove: (productId: string) => `/wishlist/${productId}`,
} as const;

/**
 * Wishlist (customer side). Every call needs the signed-in customer's token.
 *
 *  ── GET    /wishlist              getWishlist          (the /wishlist page)
 *  ── GET    /wishlist/ids          getWishlistIds       (which products show as "Saved")
 *  ── POST   /wishlist              addToWishlist        body: { productId }
 *  ── DELETE /wishlist/:productId   removeFromWishlist
 *
 * Adding and removing are idempotent on the backend: saving a product that is
 * already saved, or removing one that isn't, should still answer 200, so a
 * double click never shows an error.
 *
 * The tags are added here with enhanceEndpoints, so this file needs no change
 * to baseApi.ts.
 */
const api = baseApi.enhanceEndpoints({ addTagTypes: ["Wishlist", "WishlistIds"] });

export const wishlistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<ApiSuccess<WishlistList>, void>({
      query: () => ({ url: WISHLIST_ROUTES.list }),
      providesTags: ["Wishlist"],
    }),

    getWishlistIds: builder.query<ApiSuccess<WishlistIds>, void>({
      query: () => ({ url: WISHLIST_ROUTES.ids }),
      providesTags: ["WishlistIds"],
    }),

    addToWishlist: builder.mutation<ApiSuccess<{ productId: string }>, AddToWishlistRequest>({
      query: (body) => ({ url: WISHLIST_ROUTES.add, method: "POST", data: body }),
      async onQueryStarted({ productId }, { dispatch, queryFulfilled }) {
        // The heart fills straight away and goes back if the save fails
        const patch = dispatch(
          wishlistApi.util.updateQueryData("getWishlistIds", undefined, (draft) => {
            if (!draft.data.productIds.includes(productId)) draft.data.productIds.push(productId);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      // The list needs the full product, so it is refetched rather than patched
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation<ApiSuccess<{ productId: string }>, RemoveFromWishlistRequest>({
      query: (productId) => ({ url: WISHLIST_ROUTES.remove(productId), method: "DELETE" }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        // The row disappears straight away and comes back if the removal fails
        const listPatch = dispatch(
          wishlistApi.util.updateQueryData("getWishlist", undefined, (draft) => {
            draft.data.items = draft.data.items.filter((item) => item.product.id !== productId);
            draft.data.total = draft.data.items.length;
          }),
        );
        const idsPatch = dispatch(
          wishlistApi.util.updateQueryData("getWishlistIds", undefined, (draft) => {
            draft.data.productIds = draft.data.productIds.filter((id) => id !== productId);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          idsPatch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useGetWishlistIdsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
