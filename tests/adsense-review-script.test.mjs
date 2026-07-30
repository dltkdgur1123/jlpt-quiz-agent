import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layout = () => readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const opsHealth = () => readFileSync(new URL("../scripts/ops-health-check.mjs", import.meta.url), "utf8");

test("root layout includes Google AdSense review script in the document head", () => {
  const source = layout();

  for (const phrase of [
    "next/script",
    "google-adsense-account-script",
    "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    "client=ca-pub-4905997338755428",
    "crossOrigin=\"anonymous\"",
    "strategy=\"beforeInteractive\"",
  ]) {
    assert.match(source, new RegExp(phrase));
  }
});

test("post deploy health check verifies AdSense review script on the homepage", () => {
  const source = opsHealth();

  assert.match(source, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(source, /client=ca-pub-4905997338755428/);
});
