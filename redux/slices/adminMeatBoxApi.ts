import { toFormData } from "@/app/utils/to-form-data";
import { API_ROUTES } from "../config/apiRoutes";
import type {
  AdminMeatBoxCatalogue,
  AdminMeatBoxCategory,
  AdminMeatBoxOption,
  AdminMeatBoxOrderDetail,
  AdminMeatBoxOrderSummary,
  AdminMeatBoxStats,
  ApiSuccess,
  CancelAdminMeatBoxOrderRequest,
  CreateAdminMeatBoxCategoryRequest,
  CreateAdminMeatBoxOptionRequest,
  GetAdminMeatBoxStatsParams,
  ListAdminMeatBoxOrdersParams,
  Paginated,
  UpdateAdminMeatBoxCategoryRequest,
  UpdateAdminMeatBoxOptionRequest,
  UpdateAdminMeatBoxPriceRequest,
  UpdateAdminMeatBoxStatusRequest,
} from "../types";
import baseApi from "./baseApi";

/**
 * Multipart body for a category / option. A key that was never set is left
 * out (so a status-only update changes nothing else), `image` is only sent
 * when there is a new file, and an explicit `null` goes as an empty string
 * so staff can clear a field (see CreateAdminMeatBoxOptionRequest).
 */
function catalogueFormData(body: Record<string, unknown>) {
  const defined = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== undefined && !(key === "image" && !value)),
  );
  return toFormData(defined as Parameters<typeof toFormData>[0], { includeNullish: true });
}

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
 *  Catalogue (the Options & Categories tab)
 *  ── GET    /admin/meat-box/categories        listAdminMeatBoxCatalogue   categories with their options, together
 *  ── POST   /admin/meat-box/categories        createAdminMeatBoxCategory  multipart (image)
 *  ── PATCH  /admin/meat-box/categories/:id    updateAdminMeatBoxCategory  multipart
 *  ── DELETE /admin/meat-box/categories/:id    deleteAdminMeatBoxCategory  rejected while it still has options
 *  ── POST   /admin/meat-box/options           createAdminMeatBoxOption    multipart (image)
 *  ── PATCH  /admin/meat-box/options/:id       updateAdminMeatBoxOption    multipart
 *  ── DELETE /admin/meat-box/options/:id       deleteAdminMeatBoxOption    rejected if it has been ordered
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

    /* -------------------------------------------------------------- */
    /* Catalogue                                                       */
    /* -------------------------------------------------------------- */

    /** Every category with its options (all statuses), read together. */
    listAdminMeatBoxCatalogue: builder.query<ApiSuccess<AdminMeatBoxCatalogue>, void>({
      query: () => ({ url: API_ROUTES.adminMeatBox.categories }),
      providesTags: ["AdminMeatBoxCatalogue"],
    }),

    createAdminMeatBoxCategory: builder.mutation<ApiSuccess<AdminMeatBoxCategory>, CreateAdminMeatBoxCategoryRequest>({
      query: (body) => ({
        url: API_ROUTES.adminMeatBox.categories,
        method: "POST",
        data: catalogueFormData(body),
        formData: true,
      }),
      // The customer's Meat Box page reads the same catalogue.
      invalidatesTags: ["AdminMeatBoxCatalogue", "MeatBoxOptions"],
    }),

    updateAdminMeatBoxCategory: builder.mutation<ApiSuccess<AdminMeatBoxCategory>, UpdateAdminMeatBoxCategoryRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMeatBox.category(id),
        method: "PATCH",
        data: catalogueFormData(body),
        formData: true,
      }),
      invalidatesTags: ["AdminMeatBoxCatalogue", "MeatBoxOptions"],
    }),

    deleteAdminMeatBoxCategory: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.adminMeatBox.category(id), method: "DELETE" }),
      invalidatesTags: ["AdminMeatBoxCatalogue", "MeatBoxOptions"],
    }),

    createAdminMeatBoxOption: builder.mutation<ApiSuccess<AdminMeatBoxOption>, CreateAdminMeatBoxOptionRequest>({
      query: (body) => ({
        url: API_ROUTES.adminMeatBox.options,
        method: "POST",
        data: catalogueFormData(body),
        formData: true,
      }),
      invalidatesTags: ["AdminMeatBoxCatalogue", "MeatBoxOptions"],
    }),

    updateAdminMeatBoxOption: builder.mutation<ApiSuccess<AdminMeatBoxOption>, UpdateAdminMeatBoxOptionRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMeatBox.option(id),
        method: "PATCH",
        data: catalogueFormData(body),
        formData: true,
      }),
      invalidatesTags: ["AdminMeatBoxCatalogue", "MeatBoxOptions"],
    }),

    deleteAdminMeatBoxOption: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.adminMeatBox.option(id), method: "DELETE" }),
      invalidatesTags: ["AdminMeatBoxCatalogue", "MeatBoxOptions"],
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
  useListAdminMeatBoxCatalogueQuery,
  useCreateAdminMeatBoxCategoryMutation,
  useUpdateAdminMeatBoxCategoryMutation,
  useDeleteAdminMeatBoxCategoryMutation,
  useCreateAdminMeatBoxOptionMutation,
  useUpdateAdminMeatBoxOptionMutation,
  useDeleteAdminMeatBoxOptionMutation,
} = adminMeatBoxApi;
