export type GateConfig={salt:string;password_hash:string;session_key:string;revision:string;updated_at:number};
const encoder=new TextEncoder();
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>{if(!/^[0-9a-f]+$/i.test(value)||value.length%2)throw Error('invalid hex');return Uint8Array.from(value.match(/.{2}/g)!,v=>parseInt(v,16));};
function b64url(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value:string){return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
async function hash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(salt),iterations:100000},key,256)));}
export async function createGateConfig(password:string):Promise<GateConfig>{const salt=hex(crypto.getRandomValues(new Uint8Array(16)));return {salt,password_hash:await hash(password,salt),session_key:hex(crypto.getRandomValues(new Uint8Array(32))),revision:crypto.randomUUID(),updated_at:Date.now()};}
export async function verifyPassword(password:string,config:GateConfig){const actual=await hash(password,config.salt);let difference=actual.length^config.password_hash.length;for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^config.password_hash.charCodeAt(i);return difference===0;}
async function sessionKey(config:GateConfig){return crypto.subtle.importKey('raw',unhex(config.session_key),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function makeViewerToken(config:GateConfig,now=Date.now()){const payload=b64url(encoder.encode(JSON.stringify({revision:config.revision,expires:now+8*3600000})));const signature=new Uint8Array(await crypto.subtle.sign('HMAC',await sessionKey(config),encoder.encode(payload)));return payload+'.'+hex(signature);}
export async function verifyViewerToken(token:string,config:GateConfig,now=Date.now()){try{if(token.length>2048)return false;const [payload,signature,extra]=token.split('.');if(!payload||!signature||extra||signature.length!==64)return false;if(!await crypto.subtle.verify('HMAC',await sessionKey(config),unhex(signature),encoder.encode(payload)))return false;const data=JSON.parse(new TextDecoder().decode(decode(payload)));return data.revision===config.revision&&typeof data.expires==='number'&&Number.isFinite(data.expires)&&data.expires>now;}catch{return false;}}
export type AccessRole = 'admin' | 'viewer';
export function isLocalDevelopment(request: Request) {
  return process.env.NODE_ENV === 'development' && ['127.0.0.1','localhost','[::1]'].includes(new URL(request.url).hostname);
}
function cookieName(role: AccessRole, request: Request) {
  const suffix = role==='admin'?'admin':'access';
  return isLocalDevelopment(request) && new URL(request.url).protocol==='http:' ? 'planty_dev_'+suffix : '__Host-planty_'+suffix;
}
export function accessCookie(request: Request, role: AccessRole) {
  const name=cookieName(role,request)+'=';
  return (request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name))?.slice(name.length)||'';
}
export function sessionCookie(token: string, request: Request, role: AccessRole = 'viewer', maxAge = 28800) {
  const secure=isLocalDevelopment(request) && new URL(request.url).protocol==='http:'?'':'; Secure';
  return cookieName(role,request)+'='+token+'; Path=/; Max-Age='+maxAge+secure+'; HttpOnly; SameSite=Lax';
}
