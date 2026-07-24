import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminPolicy = () => readFileSync(new URL("../src/lib/auth/admin.ts", import.meta.url), "utf8");
const envExample = () => readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const headerButton = () => readFileSync(new URL("../src/components/auth/AuthHeaderButton.tsx", import.meta.url), "utf8");
const adminPage = () => readFileSync(new URL("../src/app/admin/page.tsx", import.meta.url), "utf8");

test("admin emails are read from a server-only allowlist and normalized", () => {
  const source = adminPolicy();
  assert.match(source, /ADMIN_EMAILS/);
  assert.match(source, /split\(","\)/);
  assert.match(source, /toLowerCase\(\)/);
  assert.match(source, /trim\(\)/);
  assert.match(source, /isAdminEmail/);
  assert.doesNotMatch(source, /dltkdgur1123@naver\.com/);
});

test("env example documents admin allowlist without storing personal email", () => {
  const source = envExample();
  assert.match(source, /ADMIN_EMAILS=/);
  assert.match(source, /comma-separated/);
  assert.doesNotMatch(source, /dltkdgur1123@naver\.com/);
});

test("signed-in header can show admin-only navigation when email is allowlisted", () => {
  const source = headerButton();
  assert.match(source, /\/api\/auth\/admin-status/);
  assert.match(source, /isAdmin/);
  assert.match(source, /관리자/);
  assert.match(source, /href="\/admin"/);
  assert.doesNotMatch(source, /ADMIN_EMAILS/);
});

test("admin page is a real route with guarded entry copy", () => {
  const source = adminPage();
  assert.match(source, /관리자/);
  assert.match(source, /AdminClient/);
  assert.match(source, /SiteHeader/);
});
