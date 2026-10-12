type Identity = { userId: string; email: string } | null;
// Verified Site owner. Only authenticated platform identity is accepted.
const ADMIN_EMAIL = 'man_hr@plantynet.com';
export function isAdminIdentity(user: Identity): boolean {
  return !!user?.userId && user.email.trim().toLowerCase() === ADMIN_EMAIL;
}
export const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Vary': 'Cookie, oai-authenticated-user-id, oai-authenticated-user-email',
  'X-Content-Type-Options': 'nosniff',
};
