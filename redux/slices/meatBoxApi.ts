import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  CancelMeatBoxOrderRequest,
  CreateMeatBoxOrderRequest,
  MeatBoxOptions,
  MeatBoxOrder,
  MeatBoxOrdersList,
  PlaceMeatBoxOrderResponse,
} from "../types";
import baseApi from "./baseApi";

/**
 * Meat Box, customer side.
 *
 *  Catalogue (public)
 *  ── GET  /meat-box/options              getMeatBoxOptions
 *       categories with their options, plus delivery frequencies / days / windows
 *
 *  My orders (signed in)
 *  ── POST /meat-box/orders               createMeatBoxOrder     -> status "pending_weighing"
 *  ── GET  /meat-box/orders               listMyMeatBoxOrders    newest first
 *  ── GET  /meat-box/orders/:id           getMeatBoxOrder
 *  ── POST /meat-box/orders/:id/place     placeMeatBoxOrder      -> payment url
 *       only allowed once staff have confirmed the price ("price_confirmed")
 *  ── POST /meat-box/orders/:id/cancel    cancelMeatBoxOrder
 *
 * Price confirmation happens on the admin side: staff weigh the meat and set
 * `confirmedTotal` + each line's `lineTotal`, which flips the order to
 * "price_confirmed". The customer's Manage page picks that up (it polls while
 * an order is waiting) and shows a "Place Order" button.
 */
export const meatBoxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeatBoxOptions: builder.query<ApiSuccess<MeatBoxOptions>, void>({
      query: () => ({ url: API_ROUTES.meatBox.options }),
      providesTags: ["MeatBoxOptions"],
    }),

    createMeatBoxOrder: builder.mutation<ApiSuccess<MeatBoxOrder>, CreateMeatBoxOrderRequest>({
      query: (body) => ({
        url: API_ROUTES.meatBox.orders,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "MeatBoxOrder", id: "LIST" }],
    }),

    listMyMeatBoxOrders: builder.query<ApiSuccess<MeatBoxOrdersList>, void>({
      query: () => ({ url: API_ROUTES.meatBox.orders }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((o) => ({ type: "MeatBoxOrder" as const, id: o.id })),
              { type: "MeatBoxOrder" as const, id: "LIST" },
            ]
          : [{ type: "MeatBoxOrder" as const, id: "LIST" }],
    }),

    getMeatBoxOrder: builder.query<ApiSuccess<MeatBoxOrder>, string>({
      query: (id) => ({ url: API_ROUTES.meatBox.order(id) }),
      providesTags: (_result, _error, id) => [{ type: "MeatBoxOrder", id }],
    }),

    /** Customer accepts the confirmed price. Send them to `payment.authorizationUrl`. */
    placeMeatBoxOrder: builder.mutation<ApiSuccess<PlaceMeatBoxOrderResponse>, string>({
      query: (id) => ({ url: API_ROUTES.meatBox.place(id), method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "MeatBoxOrder", id },
        { type: "MeatBoxOrder", id: "LIST" },
      ],
    }),

    cancelMeatBoxOrder: builder.mutation<ApiSuccess<MeatBoxOrder>, CancelMeatBoxOrderRequest>({
      query: ({ id, reason }) => ({
        url: API_ROUTES.meatBox.cancel(id),
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "MeatBoxOrder", id },
        { type: "MeatBoxOrder", id: "LIST" },
      ],
    }),
  }),
});

/**
 * Pass as the 2nd argument to getMeatBoxOptions so a page re-checks the
 * backend when its cached copy is older than a minute (staff change prices
 * and what's on offer).
 */
export const MEAT_BOX_CATALOGUE_REFETCH = { refetchOnMountOrArgChange: 60 } as const;

/** How often the Manage page re-checks while an order is waiting on staff or on payment. */
export const MEAT_BOX_ORDER_POLL_MS = 15_000;

export const {
  useGetMeatBoxOptionsQuery,
  useCreateMeatBoxOrderMutation,
  useListMyMeatBoxOrdersQuery,
  useGetMeatBoxOrderQuery,
  usePlaceMeatBoxOrderMutation,
  useCancelMeatBoxOrderMutation,
} = meatBoxApi;
