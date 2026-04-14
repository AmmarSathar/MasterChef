import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/features/navbar/Navbar";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "@context/UserContext";

describe("Navbar", () => {
  it("renders navigation", () => {
    render(
      <UserProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </UserProvider>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("toggles theme on button click", () => {
    render(
      <UserProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </UserProvider>
    );
    const themeButton = screen.getByRole("button", {
      name: /toggle theme/i,
    });
    fireEvent.click(themeButton);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
