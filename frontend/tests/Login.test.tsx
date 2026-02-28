import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "@context/UserContext";

vi.stubEnv("VITE_BASE_API_URL", "http://localhost:4000/api");

const { mockSignInEmail, mockSignUpEmail, mockUseSession } = vi.hoisted(() => ({
  mockSignInEmail: vi.fn(),
  mockSignUpEmail: vi.fn(),
  mockUseSession: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
      social: vi.fn(),
    },
    signUp: {
      email: mockSignUpEmail,
    },
    useSession: mockUseSession,
    signOut: vi.fn(),
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

vi.mock("@/lib/icons/google.svg", () => ({ default: "google.svg" }));
vi.mock("@/lib/icons/github.svg", () => ({ default: "github.svg" }));

import Login from "@/components/ui/Login/login";
import { toast } from "react-hot-toast";

function setUrl(url: string) {
  window.history.replaceState({}, "", url);
}

// Mock canvas getContext for ogl/Grainient
beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: vi.fn(() => ({
      getExtension: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      putImageData: vi.fn(),
    })),
  });
});

describe("Login/Register UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no active session, not loading
    mockUseSession.mockReturnValue({ data: null, isPending: false, refetch: vi.fn() });
    setUrl("/login");
  });

  it("renders login mode by default", () => {
    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>,
    );
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("submits registration and shows success toast", async () => {
    setUrl("/login?register=true");
    mockSignUpEmail.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com", name: "Alice" } },
      error: null,
    });

    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>,
    );

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Abcdef1!" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "Abcdef1!",
        name: "Alice",
      });
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("Account created successfully"),
      );
    });
  });

  it("shows error when email is already taken", async () => {
    setUrl("/login?register=true");
    mockSignUpEmail.mockResolvedValue({
      data: null,
      error: { status: 409, code: "USER_ALREADY_EXISTS" },
    });

    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>,
    );

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Abcdef1!" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("already linked to a social account"),
        expect.any(Object),
      );
    });
  });

  it("simulates login flow and shows success", async () => {
    setUrl("/login?register=false");
    mockSignInEmail.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com", name: "Alice" } },
      error: null,
    });

    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>,
    );

    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });

    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "Password1!",
      });
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Logged in successfully!\nWelcome back Alice!",
      );
    });
  });
});
