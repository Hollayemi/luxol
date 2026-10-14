import { API_ROUTES } from "../config/apiRoutes";
import type {
  AdminMeatBoxOrderDetail,
  AdminMeatBoxOrderSummary,
  AdminMeatBoxStats,
  ApiSuccess,
  CancelAdminMeatBoxOrderRequest,
  GetAdminMeatBoxStatsParams,
  ListAdminMeatBoxOrdersParams,
  Paginated,
  UpdateAdminMeatBoxPriceRequest,
  UpdateAdminMeatBoxStatusRequest,
} from "../types";
import baseApi from "./baseApi";

/**
 * Admin Meat Box (the staff Meat Box orders page).
 *
 *  Query
 *  ── GET   /admin/meat-box/stats             getAdminMeatBoxStats   (stat strip)
 *  ── GET   /admin/meat-box/orders            listAdminMeatBoxOrders (search, status, period, pagination)
 *  ── GET   /admin/meat-box/orders/:id        getAdminMeatBoxOrder   (Order Details drawer)
 *
 *  Actions
 *  ── PATCH  /admin/meat-box/orders/:id/price   updateAdminMeatBoxPrice        ("Update Meat Box Price")
 *  ── PATCH  /admin/meat-box/orders/:id/status  updateAdminMeatBoxOrderStatus  ("Update Order Status")
 *  ── POST   /admin/meat-box/orders/:id/cancel  cancelAdminMeatBoxOrder        ("Cancel Order")
 *
 * Separate from adminOrdersApi.ts because a Meat Box order has its own
 * lifecycle: staff weigh the meat and confirm the price before the customer
 * can pay (see types/adminMeatBox.ts). Statuses after that work like any order.
 *
 * Every action invalidates the order, the list and the stats, so the table,
 * the drawer and the numbers on top refresh together. The customer's own
 * Manage page picks up a confirmed price by polling (see MEAT_BOX_ORDER_POLL_MS
 * in meatBoxApi.ts).
 */
export const adminMeatBoxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** The stat cards at the top of the page. */
    getAdminMeatBoxStats: builder.query<ApiSuccess<AdminMeatBoxStats>, GetAdminMeatBoxStatsParams | void>({
      query: (params) => ({
        url: API_ROUTES.adminMeatBox.stats,
        params: params ?? undefined,
      }),
      providesTags: ["AdminMeatBoxStats"],
    }),

    /** The Meat Box orders table. */
    listAdminMeatBoxOrders: builder.query<
      ApiSuccess<Paginated<AdminMeatBoxOrderSummary>>,
      ListAdminMeatBoxOrdersParams | void
    >({
      query: (params) => ({
        url: API_ROUTES.adminMeatBox.list,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((o) => ({ type: "AdminMeatBoxOrder" as const, id: o.id })),
              { type: "AdminMeatBoxOrder" as const, id: "LIST" },
            ]
          : [{ type: "AdminMeatBoxOrder" as const, id: "LIST" }],
    }),

    /** The Order Details drawer: customer, timeline, items, payment summary. */
    getAdminMeatBoxOrder: builder.query<ApiSuccess<AdminMeatBoxOrderDetail>, string>({
      query: (id) => ({ url: API_ROUTES.adminMeatBox.detail(id) }),
      providesTags: (_result, _error, id) => [{ type: "AdminMeatBoxOrder", id }],
    }),

    /**
     * "Update Meat Box Price": the final weight and price of every line.
     * Confirms the price (PENDING_WEIGHING -> PRICE_CONFIRMED), after which
     * the customer can place the order and pay.
     */
    updateAdminMeatBoxPrice: builder.mutation<ApiSuccess<AdminMeatBoxOrderDetail>, UpdateAdminMeatBoxPriceRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMeatBox.price(id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminMeatBoxOrder", id },
        { type: "AdminMeatBoxOrder", id: "LIST" },
        "AdminMeatBoxStats",
      ],
    }),

    /** "Update Order Status": move a paid order along the workflow. */
    updateAdminMeatBoxOrderStatus: builder.mutation<
      ApiSuccess<AdminMeatBoxOrderDetail>,
      UpdateAdminMeatBoxStatusRequest
    >({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMeatBox.status(id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminMeatBoxOrder", id },
        { type: "AdminMeatBoxOrder", id: "LIST" },
        "AdminMeatBoxStats",
      ],
    }),

    /** "Cancel Order": a reason is required so the timeline has an audit trail. */
    cancelAdminMeatBoxOrder: builder.mutation<ApiSuccess<AdminMeatBoxOrderDetail>, CancelAdminMeatBoxOrderRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMeatBox.cancel(id),
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminMeatBoxOrder", id },
        { type: "AdminMeatBoxOrder", id: "LIST" },
        "AdminMeatBoxStats",
      ],
    }),
  }),
});

export const {
  useGetAdminMeatBoxStatsQuery,
  useListAdminMeatBoxOrdersQuery,
  useGetAdminMeatBoxOrderQuery,
  useUpdateAdminMeatBoxPriceMutation,
  useUpdateAdminMeatBoxOrderStatusMutation,
  useCancelAdminMeatBoxOrderMutation,
} = adminMeatBoxApi;
