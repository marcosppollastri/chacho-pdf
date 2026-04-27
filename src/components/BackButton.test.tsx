import { render, screen } from "@testing-library/react";
import BackButton from "./BackButton";

describe("BackButton", () => {
  it("renders link with correct text", () => {
    render(<BackButton />);
    expect(screen.getByText("Volver al inicio")).toBeInTheDocument();
  });

  it("has correct href", () => {
    render(<BackButton />);
    expect(screen.getByText("Volver al inicio").closest("a")).toHaveAttribute("href", "/");
  });
});
