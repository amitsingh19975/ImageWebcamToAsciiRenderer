import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
	return {
		mode,
		base: mode === "production" ? "/ImageWebcamToAsciiRenderer/" : "/",
	};
});