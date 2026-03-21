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

function isDesignSystemOverlayElement(node) {
  return (
    (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
    ts.isIdentifier(node.tagName) &&
    node.tagName.text === "DesignSystemOverlay"
  );
}

function stripParens(node) {
  let current = node;
  while (ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }
  return current;
}

function isProductionLiteral(node) {
  return ts.isStringLiteralLike(node) && node.text === "production";
}

function isNodeEnvReference(node) {
  const current = stripParens(node);

  if (ts.isIdentifier(current)) {
    return current.text === "NODE_ENV";
  }

  if (
    ts.isPropertyAccessExpression(current) &&
    current.name.text === "NODE_ENV" &&
    ts.isPropertyAccessExpression(current.expression) &&
    current.expression.name.text === "env" &&
    ts.isIdentifier(current.expression.expression) &&
    current.expression.expression.text === "process"
  ) {
    return true;
  }

  if (
    ts.isElementAccessExpression(current) &&
    ts.isStringLiteralLike(current.argumentExpression) &&
    current.argumentExpression.text === "NODE_ENV"
  ) {
    const target = stripParens(current.expression);

    if (
      ts.isPropertyAccessExpression(target) &&
      target.name.text === "env" &&
      ts.isIdentifier(target.expression) &&
      target.expression.text === "process"
    ) {
      return true;
    }
  }

  return false;
}

function buildVariableDeclarationMap(sourceFile) {
  const declarations = new Map();

  visit(sourceFile, (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      declarations.set(node.name.text, node.initializer);
    }
  });

  return declarations;
}

function resolveExpression(node, variableDeclarations, seen = new Set()) {
  const current = stripParens(node);

  if (!ts.isIdentifier(current)) {
    return current;
  }

  if (seen.has(current.text)) {
    return current;
  }

  const initializer = variableDeclarations.get(current.text);
  if (!initializer) {
    return current;
  }

  seen.add(current.text);
  return resolveExpression(initializer, variableDeclarations, seen);
}

function invertGuardState(state) {
  if (state === "dev") return "prod";
  if (state === "prod") return "dev";
  return null;
}

function getGuardState(node, variableDeclarations) {
  const current = resolveExpression(node, variableDeclarations);

  if (ts.isPrefixUnaryExpression(current) && current.operator === ts.SyntaxKind.ExclamationToken) {
    return invertGuardState(getGuardState(current.operand, variableDeclarations));
  }

  if (ts.isBinaryExpression(current)) {
    const left = resolveExpression(current.left, variableDeclarations);
    const right = resolveExpression(current.right, variableDeclarations);
    const referencesNodeEnv =
      (isNodeEnvReference(left) && isProductionLiteral(right)) ||
      (isNodeEnvReference(right) && isProductionLiteral(left));

    if (referencesNodeEnv) {
      if (
        current.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
        current.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken
      ) {
        return "dev";
      }

      if (
        current.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        current.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken
      ) {
        return "prod";
      }
    }
  }

  return null;
}

function expressionImpliesDevWhenTrue(node, variableDeclarations) {
  const current = resolveExpression(node, variableDeclarations);
  const directGuardState = getGuardState(current, variableDeclarations);
  if (directGuardState === "dev") {
    return true;
  }
  if (directGuardState === "prod") {
    return false;
  }

  if (ts.isConditionalExpression(current)) {
    return expressionImpliesDevWhenTrue(current.whenTrue, variableDeclarations);
  }

  if (ts.isBinaryExpression(current)) {
    if (current.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      return (
        expressionImpliesDevWhenTrue(current.left, variableDeclarations) ||
        expressionImpliesDevWhenTrue(current.right, variableDeclarations)
      );
    }

    if (current.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      return (
        expressionImpliesDevWhenTrue(current.left, variableDeclarations) &&
        expressionImpliesDevWhenTrue(current.right, variableDeclarations)
      );
    }
  }

  return false;
}

function expressionImpliesDevWhenFalse(node, variableDeclarations) {
  const current = resolveExpression(node, variableDeclarations);
  const directGuardState = getGuardState(current, variableDeclarations);
  if (directGuardState === "prod") {
    return true;
  }
  if (directGuardState === "dev") {
    return false;
  }

  if (ts.isConditionalExpression(current)) {
    return expressionImpliesDevWhenTrue(current.whenFalse, variableDeclarations);
  }

  if (ts.isBinaryExpression(current)) {
    if (current.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      return (
        expressionImpliesDevWhenFalse(current.left, variableDeclarations) &&
        expressionImpliesDevWhenFalse(current.right, variableDeclarations)
      );
    }

    if (current.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      return (
        expressionImpliesDevWhenFalse(current.left, variableDeclarations) ||
        expressionImpliesDevWhenFalse(current.right, variableDeclarations)
      );
    }
  }

  return false;
}

function statementContainsNode(statement, target) {
  let containsTarget = false;

  visit(statement, (node) => {
    if (node === target) {
      containsTarget = true;
    }
  });

  return containsTarget;
}

function hasDevOnlyRuntimeGuard(node, variableDeclarations) {
  let current = node;

  while (current.parent) {
    const parent = current.parent;

    if (ts.isConditionalExpression(parent)) {
      if (
        parent.whenTrue === current &&
        expressionImpliesDevWhenTrue(parent.condition, variableDeclarations)
      ) {
        return true;
      }

      if (
        parent.whenFalse === current &&
        expressionImpliesDevWhenFalse(parent.condition, variableDeclarations)
      ) {
        return true;
      }
    }

    if (ts.isBinaryExpression(parent)) {
      if (
        parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
        parent.right === current &&
        expressionImpliesDevWhenTrue(parent.left, variableDeclarations)
      ) {
        return true;
      }

      if (
        parent.operatorToken.kind === ts.SyntaxKind.BarBarToken &&
        parent.right === current &&
        expressionImpliesDevWhenFalse(parent.left, variableDeclarations)
      ) {
        return true;
      }
    }

    if (ts.isIfStatement(parent)) {
      if (
        parent.thenStatement &&
        statementContainsNode(parent.thenStatement, current) &&
        expressionImpliesDevWhenTrue(parent.expression, variableDeclarations)
      ) {
        return true;
      }

      if (
        parent.elseStatement &&
        statementContainsNode(parent.elseStatement, current) &&
        expressionImpliesDevWhenFalse(parent.expression, variableDeclarations)
      ) {
        return true;
      }
    }

    current = parent;
  }

  return false;
}

function layoutHasOverlay(sourceFile) {
  const variableDeclarations = buildVariableDeclarationMap(sourceFile);
  let sawOverlay = false;
  let allOverlaysAreGated = true;

  visit(sourceFile, (node) => {
    if (!isDesignSystemOverlayElement(node)) {
      return;
    }

    sawOverlay = true;

    if (!hasDevOnlyRuntimeGuard(node, variableDeclarations)) {
      allOverlaysAreGated = false;
    }
  });

  return sawOverlay && allOverlaysAreGated;
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