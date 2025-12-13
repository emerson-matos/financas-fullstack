import type { AppUser, AppUserBackend } from "@/lib/types";
import { transformAppUser } from "@/lib/types";

import { api } from "@/lib/api";

export const userService = {
  async getProfile() {
    const response = await api.get<AppUser>("/users/profile");
    return response.data;
  },

  async getCurrentUser(): Promise<AppUser> {
    const response = await api.get<AppUserBackend>("/users/me");

    return transformAppUser(response.data);
  },

  async updateProfile(data: Partial<AppUser>) {
    const response = await api.put<AppUser>("/users/profile", data);
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
