import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockListAccounts, mockChangePassword, mockSetUser, mockAxiosPost } = vi.hoisted(() => ({
  mockListAccounts: vi.fn(),
  mockChangePassword: vi.fn(),
  mockSetUser: vi.fn(),
  mockAxiosPost: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    listAccounts: mockListAccounts,
    changePassword: mockChangePassword,
  },
}));

vi.mock("@context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: "u1",
      name: "Alice",
      email: "a@b.com",
      age: 20,
      bio: "Chef",
    },
    refetchUser: mockSetUser,
  }),
}));

vi.mock("axios", () => ({
  default: {
    post: mockAxiosPost,
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import axios from "axios";
import { toast } from "react-hot-toast";
import AccountSettings from "@/components/features/dashboard/contents/settings/AccountSettings";

describe("AccountSettings password flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets a password for OAuth-only users via /user/set-password", async () => {
    mockListAccounts.mockResolvedValue({ data: [{ providerId: "google" }] });

    render(<AccountSettings />);

    await waitFor(() => {
      expect(mockListAccounts).toHaveBeenCalled();
    });

    const setupButton = await screen.findByRole("button", { name: "Set up" });
    fireEvent.click(setupButton);

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "Password1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Set Password" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/user/set-password"),
        { newPassword: "Password1!" },
        { withCredentials: true },
      );
    });

    expect(toast.success).toHaveBeenCalledWith("Password updated successfully!");
  });

  it("updates password for credential users via authClient.changePassword", async () => {
    mockListAccounts.mockResolvedValue({ data: [{ providerId: "credential" }] });
    mockChangePassword.mockResolvedValue({ error: null });

    render(<AccountSettings />);

    await waitFor(() => {
      expect(mockListAccounts).toHaveBeenCalled();
    });

    const updateButton = await screen.findByRole("button", { name: "Update" });
    fireEvent.click(updateButton);

    fireEvent.change(screen.getByPlaceholderText("Current password"), {
      target: { value: "OldPass1!" },
    });
    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "Password1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: "OldPass1!",
        newPassword: "Password1!",
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Password updated successfully!");
  });
});
