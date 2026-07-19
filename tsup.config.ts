import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	clean: true,
	splitting: false,
	sourcemap: true,
	outExtension({ format }) {
		return { js: format === "cjs" ? ".cjs" : ".mjs" };
	},
	define: {
		__SDK_VERSION__: JSON.stringify(version),
	},
});
