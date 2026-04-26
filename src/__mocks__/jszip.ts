export default class JSZip {
  files: Record<string, any> = {};

  file(name: string, data: any): void {
    this.files[name] = data;
  }

  async generateAsync(_opts: { type: string }): Promise<Blob> {
    return new Blob(["zip"]);
  }
}
