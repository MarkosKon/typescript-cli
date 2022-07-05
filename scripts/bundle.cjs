const path = require("path");
const esbuild = require("esbuild");

const bundleForPkg = process.argv.includes("--pkg");

esbuild
  .build({
    entryPoints: ["src/cli.ts"],
    bundle: true,
    platform: "node",
    target: "node12.20.0",
    outdir: bundleForPkg ? "dist-esbuild" : "dist",
    format: bundleForPkg ? "cjs" : "esm",
    // See https://github.com/evanw/esbuild/issues/1492#issuecomment-893144483
    inject: bundleForPkg
      ? [path.resolve(__dirname, "importMetaUrl.js")]
      : undefined,
    define: bundleForPkg
      ? {
          "import.meta.url": "import_meta_url",
        }
      : undefined,
    sourcemap: true,
    external: bundleForPkg ? undefined : ["lodash", "lodash-es", "node-fetch"],
  })
  .catch(() => process.exit(1));
