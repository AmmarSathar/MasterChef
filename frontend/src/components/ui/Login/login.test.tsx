import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Login from "./login";
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
    loading: vi.fn(),
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

describe("Login/Register UI", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubEnv("VITE_BASE_API_URL", "http://localhost:4000/api");
    setUrl("/login");
  });

  it("renders login mode by default", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("submits registration and stores user on success", async () => {
    setUrl("/login?register=true");
    axiosMock.post.mockResolvedValue({
      data: { id: "u1", email: "a@b.com", name: "Alice" },
    });

    render(<Login />);

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
        }
      );
    });

    expect(localStorage.getItem("user")).toEqual(
      JSON.stringify({ id: "u1", email: "a@b.com", name: "Alice" })
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows error when email is already taken", async () => {
    setUrl("/login?register=true");
    const error = { response: { status: 409 } };
    axiosMock.isAxiosError.mockReturnValue(true);
    axiosMock.post.mockRejectedValue(error);

    render(<Login />);

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
    vi.useFakeTimers();

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Log In" }));
      await vi.advanceTimersByTimeAsync(6000);
    });

    expect(toast.loading).toHaveBeenCalledWith("Logging in...");
    expect(toast.success).toHaveBeenCalledWith(
      "Logged in successfully!\nWelcome back {name}!"
    );

    vi.useRealTimers();
  });
});
