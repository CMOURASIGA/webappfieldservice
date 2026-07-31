import { authOptions } from "@/lib/nextAuth/config";
import axios from "axios";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";

export async function httpAuthServer(path: string, init?: RequestInit) {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  const session = await getServerSession(authOptions);

  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) || {}),
  };

  if (session?.id_token) {
    headers.Authorization = `Bearer ${session.id_token}`;
  }

  const isFormData =
    typeof init?.body === "object" &&
    init?.body !== null &&
    typeof (init.body as any).append === "function";

  if (isFormData) {
    if (headers["Content-Type"]) {
      delete headers["Content-Type"];
    }
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(API_URL, {
    ...init,
    headers,
  });
}

export async function httpAuthClient(path: string, init?: RequestInit) {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  const session = await getSession();

  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) || {}),
  };

  if (session?.id_token) {
    headers.Authorization = `Bearer ${session.id_token}`;
  }

  const isFormData =
    typeof init?.body === "object" &&
    init?.body !== null &&
    typeof (init.body as any).append === "function";

  if (isFormData) {
    if (headers["Content-Type"]) {
      delete headers["Content-Type"];
    }
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(API_URL, {
    ...init,
    headers,
  });
}
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.id_token) {
    config.headers.Authorization = `Bearer ${session.id_token}`;
  }
  return config;
});
