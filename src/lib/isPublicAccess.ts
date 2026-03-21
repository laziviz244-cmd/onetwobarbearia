/**
 * Returns true when accessed from the published URL (not the Lovable preview).
 * Preview URLs contain "preview--" in the hostname.
 */
export function isPublicAccess(): boolean {
  const host = window.location.hostname;
  // Lovable preview URLs always contain "preview--"
  if (host.includes("preview--")) return false;
  // localhost is dev
  if (host === "localhost" || host === "127.0.0.1") return false;
  return true;
}
