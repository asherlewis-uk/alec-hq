import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as ts from "typescript";

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, "src");
const rootLayoutPath = path.join(srcRoot, "app", "layout.tsx");
const snapshotPath = path.join(repoRoot, "tests", "design-system.snapshot.json");

const prohibitedTokenPattern = /(^|.*:)(bg-primary(?:\/\d+)?|text-primary-foreground(?:\/\d+)?|bg-secondary(?:\/\d+)?|text-secondary-foreground(?:\/\d+)?|bg-destructive(?:\/\d+)?|text-destructive-foreground(?:\/\d+)?|border-input|bg-background|ring-ring|ring-offset-background|text-muted-foreground(?:\/\d+)?|text-foreground(?:\/\d+)?|text-white(?:\/\d+)?|text-black(?:\/\d+)?|bg-gray-\d+(?:\/\d+)?)(?=\s|$)/;

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

function getScriptKind(filePath) {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".ts")) return ts.ScriptKind.TS;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
}

function createSourceFile(filePath, content) {
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, (child) => visit(child, callback));
}

function collectProhibitedTokens(rawValue, relativePath, prohibitedMatches) {
  if (typeof rawValue !== "string") {
    return;
  }

  const tokens = rawValue
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    const match = token.match(prohibitedTokenPattern);
    if (!match) {
      continue;
    }

    prohibitedMatches.push({
      file: relativePath,
      token: match[2],
    });
  }
}

function collectFromSourceFile(sourceFile, relativePath, foundMarkers, prohibitedMatches) {
  visit(sourceFile, (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "designMarker" &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      foundMarkers.add(node.arguments[0].text);
    }

    if (
      ts.isJsxAttribute(node) &&
      node.name.text === "data-ui-component" &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      foundMarkers.add(node.initializer.text);
    }

    if (ts.isStringLiteralLike(node)) {
      collectProhibitedTokens(node.text, relativePath, prohibitedMatches);
    }

    if (ts.isTemplateExpression(node)) {
      collectProhibitedTokens(node.head.text, relativePath, prohibitedMatches);
      for (const span of node.templateSpans) {
        collectProhibitedTokens(span.literal.text, relativePath, prohibitedMatches);
      }
    }
  });
}

function layoutHasOverlay(sourceFile) {
  let hasOverlay = false;

  visit(sourceFile, (node) => {
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === "DesignSystemOverlay"
    ) {
      hasOverlay = true;
    }
  });

  return hasOverlay;
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const files = walk(srcRoot);
const prohibitedMatches = [];
const foundMarkers = new Set();
let overlayRendered = false;

for (const file of files) {
  const relativePath = path.relative(repoRoot, file);
  const content = fs.readFileSync(file, "utf8");
  const sourceFile = createSourceFile(file, content);

  collectFromSourceFile(sourceFile, relativePath, foundMarkers, prohibitedMatches);

  if (file === rootLayoutPath) {
    overlayRendered = layoutHasOverlay(sourceFile);
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
