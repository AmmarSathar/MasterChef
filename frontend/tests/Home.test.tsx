import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/pages/Home/Home";
import { MemoryRouter } from "react-router-dom";

describe('Home', () => {
  it('renders home page with title', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText("CookWise")).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText("Welcome to CookWise")).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });
});
