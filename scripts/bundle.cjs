// @ts-check
const path = require("path");
const esbuild = require("esbuild");

const { dependencies } = require("../package.json");

const bundleDependencies = process.argv.includes("--bundle-dependencies");
const watch = process.argv.includes("--watch");

esbuild
  .build({
    watch,
    entryPoints: ["src/cli.ts"],
    bundle: true,
    platform: "node",
    target: "node12.20.0",
    sourcemap: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,

    ...(bundleDependencies
      ? {
          outdir: "dist-bundle-deps",
          format: "cjs",
          // See https://github.com/evanw/esbuild/issues/1492#issuecomment-893144483
          inject: [path.resolve(__dirname, "importMetaUrl.js")],
          define: {
            "import.meta.url": "import_meta_url",
          },
        }
      : { outdir: "dist", format: "esm", external: Object.keys(dependencies) }),
  })
  .catch(() => process.exit(1));
