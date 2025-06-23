import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { apiUrls } from "./apiUrls";
import { localStorageService } from "@/services/LocalStorage.service";
import { utils } from "@/lib/utils/utils";

type Body = object | string | number;

const getAccessToken = () => localStorageService.getAccessToken();

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function createHttpClient(params?: AxiosRequestConfig) {
  // Create an Axios instance
  const httpClient: AxiosInstance = axios.create({
    baseURL: apiUrls.baseUrl,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    ...params,
  });

  // Request interceptor
  httpClient.interceptors.request.use(
    (config) => {
      // Add authorization or other headers if needed
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;

      if (!error.isAxiosError) {
        return error;
      }

      // Ensure originalRequest exists before proceeding
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Check for 401 errors and handle token refreshing
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await utils.refreshAccessToken();
          return httpClient(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          return Promise.reject(refreshError);
        }
      }

      const { data } = error.response || ({} as any);

      return Promise.resolve({
        message: data?.message || error.message,
        hasError: true,
        error: true,
        title: data?.title || "Something went wrong",
        status: error.status || error.response?.status || 500,
        statusText: data?.message || error.message,
      });
    }
  );

  // Define HTTP methods
  const get = (url: string, options?: any): Promise<any> =>
    httpClient.get(url, options);
  const post = <T = any>(url: string, body: Body, options?: any): Promise<T> =>
    httpClient.post(url, body, options);
  const put = <T = any>(url: string, body: Body, options?: any): Promise<T> =>
    httpClient.put(url, body, options);
  const del = <T = any>(url: string, body?: Body): Promise<T> =>
    httpClient.delete(url, { data: body });

  // Return the public API of the client
  return { get, post, put, delete: del };
}
