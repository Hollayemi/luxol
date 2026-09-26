import axios, { type AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { isApiFailure, isApiSuccess, toApiError } from "./errors";
import type { ApiError, ApiSuccess } from "../types";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  // No default Content-Type here: axios sets "application/json" on its own
  // for plain-object bodies, and — importantly — lets the browser set
  // "multipart/form-data; boundary=..." on its own for FormData bodies
  // (usersApi's uploadAvatar). Hardcoding "application/json" at this level
  // would break that boundary and the upload would fail server-side.
});

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: Record<string, string>;
};

const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> =>
  async ({ url, method = "GET", data, params, headers }, { getState, signal }) => {
    const token = (
      getState() as { session?: { accessToken?: string | null } }
    ).session?.accessToken;

    try {
      const response = await axiosInstance.request({
        url,
        method,
        data,
        params,
        signal,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      });

      const body: unknown = response.data;

      if (isApiFailure(body)) return { error: toApiError(body) };

      if (isApiSuccess(body)) return { data: body };

      const fallback: ApiSuccess<unknown> = {
        success: true,
        message: "",
        data: body ?? null,
      };
      return { data: fallback };
    } catch (error) {
      return { error: toApiError(error) };
    }
  };

export default axiosBaseQuery;
