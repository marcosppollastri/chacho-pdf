import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  const tmpDir = await mkdtemp(join(tmpdir(), "chacho-"));
  const inputPath = join(tmpDir, "input.pdf");
  const txtPath = join(tmpDir, "output.txt");
  const docxPath = join(tmpDir, "output.docx");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    await execAsync(`pdftotext "${inputPath}" "${txtPath}"`);
    await execAsync(`pandoc "${txtPath}" -o "${docxPath}"`);

    const docxBytes = await readFile(docxPath);
    return new Response(docxBytes, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="converted.docx"`,
      },
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Conversion failed";
    return new Response(message, { status: 500 });
  } finally {
    try { await unlink(inputPath); } catch {}
    try { await unlink(txtPath); } catch {}
    try { await unlink(docxPath); } catch {}
  }
}
