import axios from "axios";
import * as SecureStore from "expo-secure-store";

const LS_TOKEN_KEY = "token";

export const api = axios.create({
  baseURL: "https://codeboard-oc85.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(LS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
    }

    return Promise.reject(error);
  },
);
