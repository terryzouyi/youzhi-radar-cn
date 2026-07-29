import { spawn } from "node:child_process";
import { rename } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const apiDirectory = path.join(projectRoot, "app", "api");
const parkedApiDirectory = path.join(projectRoot, ".pages-api-backup");

async function runNextExport() {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["exec", "next", "build"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        GITHUB_PAGES: "true",
        NEXT_PUBLIC_GITHUB_PAGES: "true",
      },
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          signal
            ? `GitHub Pages build stopped by ${signal}`
            : `GitHub Pages build exited with code ${code}`,
        ),
      );
    });
  });
}

await rename(apiDirectory, parkedApiDirectory);

try {
  await runNextExport();
} finally {
  await rename(parkedApiDirectory, apiDirectory);
}
