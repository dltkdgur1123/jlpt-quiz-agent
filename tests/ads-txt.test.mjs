import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adsTxt = () => readFileSync(new URL("../public/ads.txt", import.meta.url), "utf8");
const opsHealth = () => readFileSync(new URL("../scripts/ops-health-check.mjs", import.meta.url), "utf8");

test("Google AdSense ads.txt declares the approved publisher account", () => {
  assert.equal(adsTxt().trim(), "google.com, pub-4905997338755428, DIRECT, f08c47fec0942fa0");
});

test("post deploy health check verifies ads.txt in production", () => {
  const source = opsHealth();
  assert.match(source, /\/ads\.txt/);
  assert.match(source, /pub-4905997338755428/);
});
