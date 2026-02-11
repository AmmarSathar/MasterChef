import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/ui/Navbar/Navbar";

describe("Navbar", () => {
  it("renders navigation", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("toggles theme on button click", () => {
    render(<Navbar />);
    const themeButton = screen.getByRole("button", {
      name: /toggle theme/i,
    });
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
