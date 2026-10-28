import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { isAdminIdentity } from './admin-policy';
import { accessCookie, verifyViewerToken, isLocalDevelopment, type AccessRole, type GateConfig } from './access-crypto';

export function database() {
  if (!env.DB) throw Error('Access settings database is unavailable');
  return env.DB;
}
export async function getAccessConfig(role: AccessRole) {
  return database().prepare('SELECT salt,password_hash,session_key,revision,updated_at FROM access_settings WHERE id = ?')
    .bind(role).first<GateConfig>();
}
export async function saveAccessConfig(role: AccessRole, c: GateConfig) {
  await database().prepare('INSERT INTO access_settings(id,salt,password_hash,session_key,revision,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET salt=excluded.salt,password_hash=excluded.password_hash,session_key=excluded.session_key,revision=excluded.revision,updated_at=excluded.updated_at')
    .bind(role,c.salt,c.password_hash,c.session_key,c.revision,c.updated_at).run();
}
export async function isAdminRequest(request: Request) {
  const config = await getAccessConfig('admin');
  return !!config && await verifyViewerToken(accessCookie(request, 'admin'), config);
}
// Initial setup is available only on the loopback development server or to the verified Site owner.
export async function maySetupAdmin(request: Request) {
  return isLocalDevelopment(request) || isAdminIdentity(await getChatGPTUser());
}
export function sameOrigin(request: Request) {
  return request.headers.get('Origin') === new URL(request.url).origin;
}
export async function loginAttempts(request: Request, role: AccessRole) {
  const ip = request.headers.get('cf-connecting-ip') || 'shared-visitor';
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip)));
  const key = role + ':' + Array.from(digest,x=>x.toString(16).padStart(2,'0')).join('');
  const db = database(), windowMs = 900000;
  const attempt = await db.prepare('SELECT failures,started_at FROM access_attempts WHERE client_key = ?').bind(key).first<{failures:number;started_at:number}>();
  return {
    blocked: !!attempt && Date.now()-attempt.started_at < windowMs && attempt.failures >= 5,
    async fail() {
      const now = Date.now();
      await db.prepare('INSERT INTO access_attempts(client_key,failures,started_at) VALUES(?,1,?) ON CONFLICT(client_key) DO UPDATE SET failures=CASE WHEN access_attempts.started_at > ? THEN access_attempts.failures+1 ELSE 1 END,started_at=CASE WHEN access_attempts.started_at > ? THEN access_attempts.started_at ELSE excluded.started_at END')
        .bind(key,now,now-windowMs,now-windowMs).run();
    },
    async clear() { await db.prepare('DELETE FROM access_attempts WHERE client_key = ?').bind(key).run(); }
  };
}
