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
  const inputPath = join(tmpDir, `input.${file.name.endsWith(".docx") ? "docx" : "doc"}`);
  const outputPath = join(tmpDir, "input.pdf");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    await execAsync(
      `soffice --headless --convert-to pdf --outdir "${tmpDir}" "${inputPath}"`
    );

    const pdfBytes = await readFile(outputPath);
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="converted.pdf"`,
      },
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Conversion failed";
    return new Response(message, { status: 500 });
  } finally {
    try {
      await unlink(inputPath);
      await unlink(outputPath);
    } catch {}
  }
}
