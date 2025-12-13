import type { AppUser, AppUserBackend } from "@/lib/types";
import { transformAppUser } from "@/lib/types";

import { api } from "../api";

export const userService = {
  async getProfile() {
    const response = await api.get<Auth0UserInfo>("/users/profile");
    return response.data;
  },

  async getCurrentUser(): Promise<AppUser> {
    const response = await api.get<AppUserBackend>("/users/me");
    console.log("Fetched current user:", response.data);
    return transformAppUser(response.data);
  },

  async updateProfile(data: Partial<Auth0UserInfo>) {
    const response = await api.put<Auth0UserInfo>("/users/profile", data);
    return response.data;
  },

  async updateUserPreferences(data: Record<string, unknown>) {
    const response = await api.put("/users/preferences", data);
    return response.data;
  },

  async completeOnboarding(): Promise<AppUser> {
    const response = await api.put<AppUserBackend>(
      "/users/complete-onboarding",
    );
    return transformAppUser(response.data);
  },

  async deleteUser() {
    const response = await api.delete<{ success: boolean }>("/users");
    return response.data;
  },
};
