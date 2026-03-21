import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const prohibitedTokenPattern =
  /(^|\s)(bg-primary(?:\/\d+)?|text-primary-foreground(?:\/\d+)?|bg-secondary(?:\/\d+)?|text-secondary-foreground(?:\/\d+)?|bg-destructive(?:\/\d+)?|text-destructive-foreground(?:\/\d+)?|border-input|bg-background|ring-ring|ring-offset-background|text-muted-foreground(?:\/\d+)?|text-foreground(?:\/\d+)?|text-white(?:\/\d+)?|text-black(?:\/\d+)?|bg-gray-\d+(?:\/\d+)?)(?=\s|$)/;

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
                message:
                  "Inline style props are forbidden by the UI Constraint Gate.",
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

          const match = rawValue.match(prohibitedTokenPattern);
          if (!match) {
            return;
          }

          context.report({
            node,
            message: `Prohibited design token detected: ${match[2]}`,
          });
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
