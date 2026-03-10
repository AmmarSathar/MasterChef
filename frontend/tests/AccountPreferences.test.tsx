import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockSetUser, mockAxiosPut, mockUseUser } = vi.hoisted(() => ({
  mockSetUser: vi.fn(),
  mockAxiosPut: vi.fn(),
  mockUseUser: vi.fn(),
}));

vi.mock("@context/UserContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("axios", () => ({
  default: {
    put: mockAxiosPut,
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    loading: vi.fn(() => "toast-id"),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import axios from "axios";
import AccountPreferences from "@/components/ui/Dashboard/contents/settings/AccountPreferences";

describe("AccountPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: {
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        dietary_restric: [],
        allergies: [],
        skill_level: "beginner",
        cuisines_pref: [],
      },
      setUser: mockSetUser,
      loading: false,
    });
  });

  it("shows existing profile dietary preferences and allergies", () => {
    mockUseUser.mockReturnValueOnce({
      user: {
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        dietary_restric: ["Vegan"],
        allergies: ["Peanuts"],
        skill_level: "beginner",
        cuisines_pref: [],
      },
      setUser: mockSetUser,
      loading: false,
    });

    render(<AccountPreferences />);

    const veganButton = screen.getByRole("button", { name: "Vegan" });
    expect(veganButton.className).toMatch(/ring-3/);

    expect(screen.getByText("Peanuts")).toBeInTheDocument();
  });

  it("saves updated dietary restrictions and allergies", async () => {
    mockAxiosPut.mockResolvedValue({
      data: { user: { id: "u1", dietary_restric: ["Vegan"], allergies: ["Peanuts"] } },
    });

    render(<AccountPreferences />);

    fireEvent.click(screen.getByRole("button", { name: "Vegan" }));

    const allergyInput = screen.getByPlaceholderText(/Search allergies/i);
    fireEvent.click(allergyInput);
    fireEvent.change(allergyInput, { target: { value: "Pea" } });

    fireEvent.click(screen.getByRole("button", { name: "Peanuts" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/user/profile"),
        expect.objectContaining({
          userId: "u1",
          dietary_restric: ["Vegan"],
          allergies: ["Peanuts"],
        }),
        { withCredentials: true },
      );
    });

    expect(mockSetUser).toHaveBeenCalled();
  });
});
