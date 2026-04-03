import * as SecureStore from "expo-secure-store";

export async function getToken() {
  return await SecureStore.getItemAsync("token");
}

export async function setToken(token: string) {
  return await SecureStore.setItemAsync("token", token);
}
