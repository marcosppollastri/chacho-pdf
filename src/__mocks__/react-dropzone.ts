let mockOnDrop: ((files: File[]) => void) | null = null;

export function __setMockOnDrop(fn: (files: File[]) => void) {
  mockOnDrop = fn;
}

export function __clearMockOnDrop() {
  mockOnDrop = null;
}

export function useDropzone({ onDrop }: { onDrop?: (files: File[]) => void }) {
  if (onDrop) mockOnDrop = onDrop;
  return {
    getRootProps: () => ({
      role: "button",
      tabIndex: 0,
    }),
    getInputProps: () => ({
      type: "file",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && mockOnDrop) {
          mockOnDrop(Array.from(e.target.files));
        }
      },
    }),
    isDragActive: false,
    open: jest.fn(),
    __triggerDrop: (files: File[]) => {
      if (mockOnDrop) mockOnDrop(files);
    },
  };
}
