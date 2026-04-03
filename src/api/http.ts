import axios from "axios";

export const api = axios.create({
  baseURL: "https://codeboard-oc85.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});
