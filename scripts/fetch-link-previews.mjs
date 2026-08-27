// Build-time link-preview scraper.
//
// The hover preview wants what a chat app shows when you paste a URL: the
// destination's own image, title and blurb. A static site on GitHub Pages
// cannot fetch that at hover time — cross-origin HTML is blocked by CORS and
// there is no server to proxy through — so the metadata is pulled here, once,
// and committed: images land in public/assets/link-previews/ and the text in
// src/link-previews.json, which main.ts imports.
//
//   npm run link-previews            # fill in links that have no entry yet
//   npm run link-previews -- --refresh   # re-fetch everything
//
// Sites behind a bot wall (Cloudflare, Akamai) are recorded as failures and
// simply fall back to the hand-written data-preview-title in the markup.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = join(root, "src", "link-previews.json");
const IMG_DIR = join(root, "public", "assets", "link-previews");
const IMG_URL_BASE = "/assets/link-previews";
const MAX_IMAGE_BYTES = 3_000_000;
const TIMEOUT_MS = 25_000;

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-IN,en;q=0.9",
};

const SKIP_DIRS = new Set(["node_modules", "dist", "ref"]);
const refresh = process.argv.includes("--refresh");

// ---------------------------------------------------------------- collecting

function htmlFiles(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // ref/ is a downloaded reference site, dist/ is build output — neither ships.
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, found);
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

function outboundLinks() {
  const hrefs = new Set();
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/gi)) {
      const href = match[1];
      // Same-host links (the canonical, the site's own pages) get no card.
      if (/^https?:\/\/(www\.)?omkarlohar\.me/i.test(href)) continue;
      hrefs.add(href);
    }
  }
  return [...hrefs].sort();
}

// ------------------------------------------------------------------- parsing

const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();

function meta(html, name) {
  // property="og:x" and name="og:x" are both in the wild; so is either
  // attribute order around content=.
  const key = name.replace(/[:.]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const found = html.match(pattern);
    if (found?.[1]?.trim()) return decode(found[1]);
  }
  return "";
}

// Amazon serves no og:image on product pages — the gallery holds it instead.
function amazonImage(html) {
  const hiRes = html.match(/"hiRes":"(https:[^"]+)"/);
  if (hiRes) return hiRes[1].replace(/\\u002F/g, "/");
  const dynamic = html.match(/id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/);
  if (!dynamic) return "";
  const sizes = Object.entries(JSON.parse(decode(dynamic[1])));
  // Widest variant on offer, so the card is not upscaling a thumbnail.
  sizes.sort((a, b) => (b[1][0] ?? 0) - (a[1][0] ?? 0));
  return sizes[0]?.[0] ?? "";
}

function parse(html, finalUrl) {
  const host = new URL(finalUrl).hostname.replace(/^www\./, "");
  const rawTitle =
    meta(html, "og:title") ||
    meta(html, "twitter:title") ||
    decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");

  // Amazon titles are a paragraph with the store name bolted on; the first
  // clause is the product.
  const title = /amazon\./.test(host)
    ? rawTitle
        .replace(/^Amazon\.[a-z.]+\s*:\s*/i, "")
        .replace(/^Buy\s+/i, "")
        .split(/\s+[:|]\s+/)[0]
        .split(/\s+\|\s+/)[0]
        .trim()
    : rawTitle;

  const image =
    meta(html, "og:image:secure_url") ||
    meta(html, "og:image") ||
    meta(html, "twitter:image") ||
    meta(html, "twitter:image:src") ||
    (/amazon\./.test(host) ? amazonImage(html) : "") ||
    "";

  // A description that just restates the title (every Amazon listing) is
  // noise in a card that already shows the title.
  let description = meta(html, "og:description") || meta(html, "description");
  if (title && description.slice(0, 40).toLowerCase().includes(title.slice(0, 40).toLowerCase()))
    description = "";

  return {
    title: title.slice(0, 160),
    description: description.slice(0, 220),
    siteName: meta(html, "og:site_name") || host,
    domain: host,
    image: image ? new URL(image, finalUrl).href : "",
  };
}

// ------------------------------------------------------------------ fetching

async function get(url, accept) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: accept ? { ...HEADERS, accept } : HEADERS,
    });
  } finally {
    clearTimeout(timer);
  }
}

const EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

async function saveImage(imageUrl, key) {
  const response = await get(imageUrl, "image/avif,image/webp,image/jpeg,image/*,*/*;q=0.8");
  if (!response.ok) throw new Error(`image ${response.status}`);
  const type = (response.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT[type];
  if (!ext) throw new Error(`image type ${type || "unknown"}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error(`image ${bytes.byteLength} bytes`);
  mkdirSync(IMG_DIR, { recursive: true });
  const name = `${key}${ext}`;
  writeFileSync(join(IMG_DIR, name), bytes);
  return `${IMG_URL_BASE}/${name}`;
}

// ---------------------------------------------------------------------- main

const cache = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : {};
const links = outboundLinks();
const next = {};
let fetched = 0;
let reused = 0;
const failures = [];

for (const href of links) {
  if (!refresh && cache[href]?.ok) {
    next[href] = cache[href];
    reused += 1;
    continue;
  }

  const key = createHash("sha1").update(href).digest("hex").slice(0, 12);
  try {
    const response = await get(href);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = parse(await response.text(), response.url);

    let image = "";
    if (parsed.image) {
      try {
        image = await saveImage(parsed.image, key);
      } catch (error) {
        console.warn(`  image skipped for ${href}: ${error.message}`);
      }
    }

    next[href] = { ok: true, ...parsed, image };
    fetched += 1;
    console.log(`✓ ${parsed.domain} — ${parsed.title.slice(0, 60)}${image ? " + image" : ""}`);
  } catch (error) {
    next[href] = { ok: false, domain: new URL(href).hostname.replace(/^www\./, "") };
    failures.push(`${href} (${error.message})`);
    console.warn(`✗ ${href} — ${error.message}`);
  }
}

writeFileSync(OUT_JSON, `${JSON.stringify(next, null, 2)}\n`);

// Images for links that have since been edited out of the markup would
// otherwise sit in the repo forever.
const kept = new Set(
  Object.values(next)
    .map((entry) => entry.image?.split("/").pop())
    .filter(Boolean)
);
if (existsSync(IMG_DIR))
  for (const file of readdirSync(IMG_DIR))
    if (!kept.has(file)) {
      rmSync(join(IMG_DIR, file));
      console.log(`- pruned ${file}`);
    }

console.log(`\n${fetched} fetched, ${reused} reused, ${failures.length} failed.`);
if (failures.length) console.log(`Falling back to markup labels for:\n  ${failures.join("\n  ")}`);
