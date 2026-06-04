import fs from "fs-extra";
import path from "node:path";
import archiver from "archiver";

export async function zipDirectory(sourceDir: string, zipPath: string) {
  await fs.ensureDir(path.dirname(zipPath));

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (error) => reject(error));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
