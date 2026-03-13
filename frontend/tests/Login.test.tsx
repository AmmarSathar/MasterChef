import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "@context/UserContext";

vi.stubEnv("VITE_BASE_API_URL", "http://localhost:4000/api");

const mockNavigate = vi.fn();

const { mockSignInEmail, mockSignUpEmail, mockSignInSocial, mockUseSession } =
  vi.hoisted(() => ({
    mockSignInEmail: vi.fn(),
    mockSignUpEmail: vi.fn(),
    mockSignInSocial: vi.fn(),
    mockUseSession: vi.fn(),
  }));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../src/components/ui/Login/Customize", () => ({
  default: ({ ready }: { ready: boolean }) => (
    <div data-testid="customize" data-ready={String(ready)} />
  ),
}));

vi.mock("@/components/Grainient", () => ({
  default: () => <div data-testid="grainient" />,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
      social: mockSignInSocial,
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

function renderLogin() {
  return render(
    <UserProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </UserProvider>,
  );
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
    mockNavigate.mockReset();
    // Default: no active session, not loading
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      refetch: vi.fn(),
    });
    setUrl("/login");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders login mode by default", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Full Name")).not.toBeInTheDocument();
  });

  it("toggles between login and register modes and updates URL", async () => {
    vi.useFakeTimers();
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: "Sign-Up" }));
    expect(
      screen.getByRole("button", { name: "Create Account" }),
    ).toBeInTheDocument();
    expect(window.location.search).toContain("register=true");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByRole("button", { name: "Log-In" }));
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(window.location.search).toContain("register=false");
  });

  it("blocks registration when password requirements are not met", async () => {
    setUrl("/login?register=true");
    renderLogin();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("The password is too short");
    });
    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it("submits registration and shows success toast", async () => {
    setUrl("/login?register=true");
    mockSignUpEmail.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com", name: "Alice" } },
      error: null,
    });

    renderLogin();

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

  it("shows a specific error when email is already taken", async () => {
    setUrl("/login?register=true");
    mockSignUpEmail.mockResolvedValue({
      data: null,
      error: { status: 409, code: "USER_ALREADY_EXISTS" },
    });

    renderLogin();

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
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("already linked to a social account"),
        expect.any(Object),
      );
    });
  });

  it("shows a validation error for invalid registration data", async () => {
    setUrl("/login?register=true");
    mockSignUpEmail.mockResolvedValue({
      data: null,
      error: { status: 400 },
    });

    renderLogin();

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
      expect(toast.error).toHaveBeenCalledWith("Invalid registration data.");
    });
  });

  it("simulates login flow and shows success", async () => {
    setUrl("/login?register=false");
    mockSignInEmail.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com", name: "Alice" } },
      error: null,
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });

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

  it("redirects to dashboard when login user is already customized", async () => {
    setUrl("/login?register=false");
    mockSignInEmail.mockResolvedValue({
      data: {
        user: { id: "u1", email: "a@b.com", name: "Alice", isCustomized: true },
      },
      error: null,
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("starts customization when login user is not customized", async () => {
    vi.useFakeTimers();
    setUrl("/login?register=false");
    mockSignInEmail.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "a@b.com",
          name: "Alice",
          isCustomized: false,
        },
      },
      error: null,
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(window.location.search).toContain("customizing=true");
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Welcome back!"),
      expect.any(Object),
    );

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(screen.getByTestId("customize")).toBeInTheDocument();
  });

  it("shows invalid credentials error on login failure", async () => {
    setUrl("/login?register=false");
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { status: 401, code: "INVALID_EMAIL_OR_PASSWORD" },
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Wrong1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password.");
    });
  });

  it("shows generic error on unexpected login failures", async () => {
    setUrl("/login?register=false");
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { status: 500 },
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "An unexpected error occurred. Please try again.",
      );
    });
  });

  it("handles social sign-in buttons", () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /Google/ }));
    fireEvent.click(screen.getByRole("button", { name: /GitHub/ }));

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: `${window.location.origin}/login`,
    });
    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: `${window.location.origin}/login`,
    });
  });
});
