import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const CONTENT_DIR = "content/experimental";
const VIEWPORT = { width: 1920, height: 1080 };

// Mirrors layouts/partials/main/img.html, which resolves the card image
// via `.Page.Resources.GetMatch (printf "*%s*" src)` — a substring match,
// not an exact filename. images: ["nature.com"] resolves to nature.com.png.
const SCREENSHOT_TYPES: Partial<Record<string, "png" | "jpeg">> = {
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
};

interface Bundle {
  name: string;
  link: string;
  imagePath: string;
  screenshotType: "png" | "jpeg";
}

function parseFrontmatter(text: string): { link?: string; image?: string } {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return {};

  const link = frontmatter[1].match(/^link:\s*"([^"]*)"\s*$/m)?.[1];
  const image = frontmatter[1].match(/^images:\s*\[\s*"?([^",\]]+)"?/m)?.[1];

  return { link, image };
}

async function resolveImageFile(
  bundleDir: string,
  imageToken: string,
): Promise<string | undefined> {
  const entries = await readdir(bundleDir);
  return entries.find((entry) => entry !== "index.md" && entry.includes(imageToken));
}

async function loadBundles(filterNames?: string[]): Promise<Bundle[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const bundles: Bundle[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (filterNames && !filterNames.includes(entry.name)) continue;

    const bundleDir = join(CONTENT_DIR, entry.name);
    const indexPath = join(bundleDir, "index.md");
    if (!existsSync(indexPath)) continue;

    const { link, image } = parseFrontmatter(await readFile(indexPath, "utf8"));
    if (!link || !image) continue;

    const resolvedFile = await resolveImageFile(bundleDir, image);
    if (!resolvedFile) {
      console.error(`Skipping ${entry.name}: no file in the bundle matches images[0]="${image}"`);
      continue;
    }

    const screenshotType = SCREENSHOT_TYPES[extname(resolvedFile).toLowerCase()];
    if (!screenshotType) {
      console.error(`Skipping ${entry.name}: unsupported image format "${resolvedFile}"`);
      continue;
    }

    bundles.push({
      name: entry.name,
      link,
      imagePath: join(bundleDir, resolvedFile),
      screenshotType,
    });
  }

  return bundles;
}

async function main() {
  const requestedBundles = process.argv.slice(2);
  const bundles = await loadBundles(requestedBundles.length > 0 ? requestedBundles : undefined);

  if (bundles.length === 0) {
    console.error("No bundles with both a link and an image were found.");
    process.exit(1);
  }

  const browser = await chromium.launch();
  let successCount = 0;
  const deadLinks: string[] = [];

  try {
    for (const bundle of bundles) {
      const page = await browser.newPage({ viewport: VIEWPORT });
      try {
        const response = await page.goto(bundle.link, {
          waitUntil: "networkidle",
          timeout: 30_000,
        });
        if (!response) {
          throw new Error("no response");
        }
        if (!response.ok()) {
          // Do not overwrite the existing image when the URL returns an HTTP error.
          // The response may be an error page.
          const message =
            `${bundle.name}: ${bundle.link} answers HTTP ${response.status()}; ` +
            "kept the existing image";
          deadLinks.push(message);
          console.warn(
            process.env.GITHUB_ACTIONS ? `::warning title=Link not captured::${message}` : message,
          );
          continue;
        }
        await page.screenshot({ path: bundle.imagePath, type: bundle.screenshotType });
        successCount++;
        console.log(`Saved screenshot of ${bundle.link} to ${bundle.imagePath}`);
      } catch (error) {
        console.error(
          `Failed to screenshot ${bundle.name} (${bundle.link}): ${(error as Error).message}`,
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(
    `${successCount}/${bundles.length} screenshots succeeded, ` +
      `${deadLinks.length} links answered with an error status.`,
  );
  if (successCount === 0) {
    process.exit(1);
  }
}

await main();
