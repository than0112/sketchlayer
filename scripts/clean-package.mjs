import { rm } from "node:fs/promises";

await rm(new URL("../dist-lib/", import.meta.url), { recursive: true, force: true });
