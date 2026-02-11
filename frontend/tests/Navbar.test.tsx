import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/ui/Navbar/Navbar";
import { MemoryRouter } from "react-router-dom";

describe("Navbar", () => {
  it("renders navigation", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("toggles theme on button click", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const themeButton = screen.getByRole("button", {
      name: /toggle theme/i,
    });
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
