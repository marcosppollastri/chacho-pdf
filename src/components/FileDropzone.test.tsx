import { render, screen, fireEvent } from "@testing-library/react";
import FileDropzone from "./FileDropzone";

describe("FileDropzone", () => {
  it("renders with default label", () => {
    render(<FileDropzone onFiles={jest.fn()} />);
    expect(screen.getByText(/Arrastra archivos o haz clic/i)).toBeInTheDocument();
  });

  it("renders custom label", () => {
    render(<FileDropzone onFiles={jest.fn()} label="Custom label" />);
    expect(screen.getByText("Custom label")).toBeInTheDocument();
  });

  it("triggers onFiles via input change", () => {
    const onFiles = jest.fn();
    render(<FileDropzone onFiles={onFiles} />);
    const input = document.querySelector("input[type='file']")!;
    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });
});
