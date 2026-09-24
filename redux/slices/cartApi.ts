import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  OrderResponse,
  PlaceOrderRequest,
  PromoInfo,
  ValidatePromoRequest,
} from "../types";
import baseApi from "./baseApi";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validatePromo: builder.mutation<ApiSuccess<PromoInfo>, ValidatePromoRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.validatePromo,
        method: "POST",
        data: body,
      }),
    }),

    placeOrder: builder.mutation<ApiSuccess<OrderResponse>, PlaceOrderRequest>({
      query: (body) => ({
        url: API_ROUTES.orders.create,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useValidatePromoMutation, usePlaceOrderMutation } = cartApi;
