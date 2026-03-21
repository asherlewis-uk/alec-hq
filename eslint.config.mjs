import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const prohibitedTokenPattern =
  /(^|.*:)(bg-primary(?:\/\d+)?|text-primary-foreground(?:\/\d+)?|bg-secondary(?:\/\d+)?|text-secondary-foreground(?:\/\d+)?|bg-destructive(?:\/\d+)?|text-destructive-foreground(?:\/\d+)?|border-input|bg-background|ring-ring|ring-offset-background|text-muted-foreground(?:\/\d+)?|text-foreground(?:\/\d+)?|text-white(?:\/\d+)?|text-black(?:\/\d+)?|bg-gray-\d+(?:\/\d+)?)(?=\s|$)/;

const inlineStylePropMessage =
  "Inline style props are forbidden by the UI Constraint Gate.";

function hasStyleProperty(argument) {
  if (!argument || argument.type !== "ObjectExpression") {
    return false;
  }

  return argument.properties.some((property) => {
    if (property.type === "Property") {
      if (!property.computed && property.key.type === "Identifier") {
        return property.key.name === "style";
      }

      if (property.key.type === "Literal") {
        return property.key.value === "style";
      }

      return false;
    }

    if (property.type === "SpreadElement") {
      return hasStyleProperty(property.argument);
    }

    return false;
  });
}

const designSystemPlugin = {
  meta: {
    name: "design-system-plugin",
  },
  rules: {
    "no-inline-style-prop": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow inline style props in JSX",
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name?.name === "style") {
              context.report({
                node,
                message: inlineStylePropMessage,
              });
            }
          },
          JSXSpreadAttribute(node) {
            if (hasStyleProperty(node.argument)) {
              context.report({
                node,
                message: inlineStylePropMessage,
              });
            }
          },
        };
      },
    },
    "no-prohibited-design-tokens": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow prohibited design token families in string literals",
        },
      },
      create(context) {
        function reportIfInvalid(node, rawValue) {
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

            context.report({
              node,
              message: `Prohibited design token detected: ${match[2]}`,
            });
            return;
          }
        }

        return {
          Literal(node) {
            reportIfInvalid(node, node.value);
          },
          TemplateElement(node) {
            reportIfInvalid(node, node.value?.raw);
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "design-system": designSystemPlugin,
    },
    rules: {
      "design-system/no-inline-style-prop": "error",
      "design-system/no-prohibited-design-tokens": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    "public/workbox-*.js",
    "output/**",
  ]),
]);

export default eslintConfig;
