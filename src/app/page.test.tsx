import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders title and subtitle", () => {
    render(<Home />);
    expect(screen.getByText("Herramientas PDF")).toBeInTheDocument();
    expect(screen.getByText(/Sin logins, sin terceros/i)).toBeInTheDocument();
  });

  it("renders all tool cards", () => {
    render(<Home />);
    const titles = [
      "Word a PDF",
      "Separar PDF",
      "Unir PDFs",
      "PDF a Word",
      "JPG a PDF",
      "PDF a JPG",
    ];
    titles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("has correct hrefs for tool cards", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    const hrefs = ["/word-to-pdf", "/split", "/merge", "/pdf-to-word", "/jpg-to-pdf", "/pdf-to-jpg"];
    hrefs.forEach((href) => {
      expect(links.some((link) => link.getAttribute("href") === href)).toBe(true);
    });
  });
});
