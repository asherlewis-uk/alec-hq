import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, "src");
const snapshotPath = path.join(repoRoot, "tests", "design-system.snapshot.json");

const prohibitedTokenPattern = /(^|\s)(bg-primary(?:\/\d+)?|text-primary-foreground(?:\/\d+)?|bg-secondary(?:\/\d+)?|text-secondary-foreground(?:\/\d+)?|bg-destructive(?:\/\d+)?|text-destructive-foreground(?:\/\d+)?|border-input|bg-background|ring-ring|ring-offset-background|text-muted-foreground(?:\/\d+)?|text-foreground(?:\/\d+)?|text-white(?:\/\d+)?|text-black(?:\/\d+)?|bg-gray-\d+(?:\/\d+)?)(?=\s|$)/g;
const markerPattern = /designMarker\("([A-Za-z]+)"\)|data-ui-component\s*=\s*["']([A-Za-z]+)["']/g;
const overlayPattern = /<DesignSystemOverlay\s*\/>/;

function walk(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const files = walk(srcRoot);
const prohibitedMatches = [];
const foundMarkers = new Set();
let overlayRendered = false;

for (const file of files) {
  const relativePath = path.relative(repoRoot, file);
  const content = fs.readFileSync(file, "utf8");

  if (overlayPattern.test(content)) {
    overlayRendered = true;
  }

  for (const match of content.matchAll(markerPattern)) {
    const marker = match[1] || match[2];
    if (marker) {
      foundMarkers.add(marker);
    }
  }

  for (const match of content.matchAll(prohibitedTokenPattern)) {
    prohibitedMatches.push({
      file: relativePath,
      token: match[2],
    });
  }
}

const actual = {
  trackedMarkers: [...foundMarkers].sort(),
  prohibitedTokenCount: prohibitedMatches.length,
  overlayRendered,
};

const failures = [];

if (actual.prohibitedTokenCount !== snapshot.prohibitedTokenCount) {
  failures.push(
    `Expected prohibited token count ${snapshot.prohibitedTokenCount}, received ${actual.prohibitedTokenCount}.`
  );
}

if (actual.overlayRendered !== snapshot.overlayRendered) {
  failures.push(
    `Expected overlayRendered=${snapshot.overlayRendered}, received ${actual.overlayRendered}.`
  );
}

if (JSON.stringify(actual.trackedMarkers) !== JSON.stringify(snapshot.trackedMarkers)) {
  failures.push(
    `Tracked component markers changed. Expected ${snapshot.trackedMarkers.join(", ")}, received ${actual.trackedMarkers.join(", ")}.`
  );
}

if (failures.length > 0) {
  console.error("Design system snapshot regression detected.\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  if (prohibitedMatches.length > 0) {
    console.error("\nProhibited tokens found:");
    for (const violation of prohibitedMatches) {
      console.error(`- ${violation.file}: ${violation.token}`);
    }
  }

  process.exit(1);
}

console.log("Design system snapshot is clean.");
