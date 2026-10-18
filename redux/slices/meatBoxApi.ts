import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  CancelMeatBoxOrderRequest,
  CreateMeatBoxOrderRequest,
  CreateMeatBoxOrderResponse,
  MeatBoxOptions,
  MeatBoxOrder,
  MeatBoxOrdersList,
  PayMeatBoxOrderResponse,
} from "../types";
import baseApi from "./baseApi";

/**
 * Meat Box, customer side.
 *
 *  Catalogue (public)
 *  ── GET  /meat-box/options              getMeatBoxOptions
 *       categories (each with its price per kg) and their boxes (each with a
 *       weight and the price worked out from it), plus delivery frequencies /
 *       days / windows
 *
 *  My orders (signed in)
 *  ── POST /meat-box/orders               createMeatBoxOrder     -> order ("pending_payment") + payment url
 *       the price is fixed, so the customer pays straight away
 *  ── GET  /meat-box/orders               listMyMeatBoxOrders    newest first
 *  ── GET  /meat-box/orders/:id           getMeatBoxOrder
 *  ── POST /meat-box/orders/:id/pay       payMeatBoxOrder        -> a new payment url
 *       for an order that was created but not paid ("pending_payment")
 *  ── POST /meat-box/orders/:id/cancel    cancelMeatBoxOrder
 *       only while the order is unpaid
 *
 * There is no weighing or price confirmation step: a box costs its category's
 * price per kg x its weight, and that is what the customer sees and pays. The
 * Manage page polls while an order is unpaid so it flips to "processing" on its
 * own once the payment webhook lands.
 */
export const meatBoxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeatBoxOptions: builder.query<ApiSuccess<MeatBoxOptions>, void>({
      query: () => ({ url: API_ROUTES.meatBox.options }),
      providesTags: ["MeatBoxOptions"],
    }),

    /** Creates an unpaid order. Send the customer to `payment.authorizationUrl`. */
    createMeatBoxOrder: builder.mutation<
      ApiSuccess<CreateMeatBoxOrderResponse>,
      CreateMeatBoxOrderRequest
    >({
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

    /** Pay for an order that is still "pending_payment". Send them to `payment.authorizationUrl`. */
    payMeatBoxOrder: builder.mutation<ApiSuccess<PayMeatBoxOrderResponse>, string>({
      query: (id) => ({ url: API_ROUTES.meatBox.pay(id), method: "POST" }),
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

/** How often the Manage page re-checks while an order is waiting on its payment to land. */
export const MEAT_BOX_ORDER_POLL_MS = 15_000;

export const {
  useGetMeatBoxOptionsQuery,
  useCreateMeatBoxOrderMutation,
  useListMyMeatBoxOrdersQuery,
  useGetMeatBoxOrderQuery,
  usePayMeatBoxOrderMutation,
  useCancelMeatBoxOrderMutation,
} = meatBoxApi;
