export class PDFDocument {
  pages: any[] = [];

  static async create(): Promise<PDFDocument> {
    return new PDFDocument();
  }

  static async load(data: any): Promise<PDFDocument> {
    const doc = new PDFDocument();
    // Mock 3 pages by default for tests
    doc.pages = [{}, {}, {}];
    return doc;
  }

  addPage(size?: [number, number]): any {
    const page = { drawImage: jest.fn() };
    this.pages.push(page);
    return page;
  }

  getPageCount(): number {
    return this.pages.length;
  }

  getPageIndices(): number[] {
    return this.pages.map((_, i) => i);
  }

  copyPages(source: PDFDocument, indices: number[]): Promise<any[]> {
    return Promise.resolve(indices.map(() => ({})));
  }

  embedPng(bytes: any): Promise<any> {
    return Promise.resolve({ width: 100, height: 100 });
  }

  embedJpg(bytes: any): Promise<any> {
    return Promise.resolve({ width: 100, height: 100 });
  }

  drawImage(img: any, options: any): void {}

  async save(): Promise<Uint8Array> {
    return new Uint8Array([1, 2, 3, 4]);
  }
}
