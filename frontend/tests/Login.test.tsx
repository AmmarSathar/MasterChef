import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.stubEnv("VITE_BASE_API_URL", "http://localhost:4000/api");

import Login from "@/components/ui/Login/login";
import axios from "axios";
import { toast } from "react-hot-toast";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(),
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

const axiosMock = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
};

function setUrl(url: string) {
  window.history.replaceState({}, "", url);
}

// Mock canvas getContext for ogl/Grainient
beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: vi.fn(() => ({
      // mock minimal context if needed
      getExtension: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      putImageData: vi.fn(),
    })),
  });
});

describe("Login/Register UI", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    setUrl("/login");
  });

  it("renders login mode by default", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("submits registration and stores user on success", async () => {
    setUrl("/login?register=true");
    axiosMock.post.mockResolvedValue({
      data: {
        success: true,
        user: { id: "u1", email: "a@b.com", name: "Alice" },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Abcdef1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(axiosMock.post).toHaveBeenCalledWith(
        "http://localhost:4000/api/auth/register",
        {
          email: "a@b.com",
          password: "Abcdef1!",
          name: "Alice",
          rememberMe: false,
        },
        { withCredentials: true },
      );
    });

    expect(localStorage.getItem("user")).toEqual(
      JSON.stringify({ id: "u1", email: "a@b.com", name: "Alice" }),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows error when email is already taken", async () => {
    setUrl("/login?register=true");
    const error = { response: { status: 409 } };
    axiosMock.isAxiosError.mockReturnValue(true);
    axiosMock.post.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Abcdef1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email is already taken.");
    });
  });

  it("simulates login flow and shows success", async () => {
    setUrl("/login?register=false");
    axiosMock.post.mockResolvedValue({
      data: {
        success: true,
        user: { id: "u1", email: "a@b.com", name: "Alice" },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });

    fireEvent.click(await screen.findByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(axiosMock.post).toHaveBeenCalledWith(
        "http://localhost:4000/api/auth/login",
        {
          email: "a@b.com",
          password: "Password1!",
          rememberMe: false,
        },
        { withCredentials: true },
      );
    });

    expect(localStorage.getItem("user")).toEqual(
      JSON.stringify({ id: "u1", email: "a@b.com", name: "Alice" }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Logged in successfully!\nWelcome back Alice!",
    );
  });
});
