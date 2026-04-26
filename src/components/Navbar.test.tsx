import { render, screen } from "@testing-library/react";
import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders chacho-pdf branding", () => {
    render(<Navbar />);
    expect(screen.getByText("chacho-pdf")).toBeInTheDocument();
  });

  it("renders privacy badge", () => {
    render(<Navbar />);
    expect(screen.getByText(/Privado y libre/i)).toBeInTheDocument();
  });

  it("links to home", () => {
    render(<Navbar />);
    expect(screen.getByText("chacho-pdf").closest("a")).toHaveAttribute("href", "/");
  });
});
