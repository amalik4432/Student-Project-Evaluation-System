import axios from "axios";
import { BASE_URL } from "../config";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

export const api = async (route, { method = "get", data, params } = {}) => {
  try {
    const response = await client.request({
      url: route,
      method,
      data,
      params,
    });
    return { ok: true, status: response.status, data: response.data };
  } catch (error) {
    const payload = error.response?.data;
    return {
      ok: false,
      status: error.response?.status || 0,
      data: payload || { message: error.message || "Network error" },
      message:
        payload?.message || payload?.error || error.message || "Request failed",
    };
  }
};

export default client;
