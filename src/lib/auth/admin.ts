export function parseAdminEmails(value = process.env.ADMIN_EMAILS ?? ""): Set<string> {
  return new Set(
    value
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined, allowlist = parseAdminEmails()): boolean {
  if (!email) return false;
  return allowlist.has(email.trim().toLowerCase());
}
