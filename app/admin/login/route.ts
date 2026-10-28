import { PRIVATE_HEADERS } from '../../../server/admin-policy';
import { maySetupAdmin,getAccessConfig,database,sameOrigin,loginAttempts } from '../../../server/access-service';
import { adminLoginPage } from '../../../server/login-pages';
import { createGateConfig,verifyPassword,makeViewerToken,sessionCookie } from '../../../server/access-crypto';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response('Forbidden',{status:403,headers:PRIVATE_HEADERS});
  const text = await request.text();
  if (text.length>2048) return new Response('Payload too large',{status:413,headers:PRIVATE_HEADERS});
  let config = await getAccessConfig('admin');
  const canSetup = !config && await maySetupAdmin(request);
  const page = (message:string,status=400) => adminLoginPage(!!config,canSetup,message,status);
  const attempts = await loginAttempts(request,'admin');
  if (attempts.blocked) return page('로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.',429);
  const form = new URLSearchParams(text),password = form.get('password')||'';
  if (!config) {
    if (!canSetup) return page('사이트 소유자만 최초 관리자 비밀번호를 등록할 수 있습니다.',403);
    if (password.trim().length<8 || password.length>128) return page('관리자 비밀번호는 8~128자로 입력해 주세요.');
    if (password!==form.get('confirmPassword')) return page('비밀번호 확인이 일치하지 않습니다.');
    const c = await createGateConfig(password);
    const result = await database().prepare("INSERT INTO access_settings(id,salt,password_hash,session_key,revision,updated_at) VALUES('admin',?,?,?,?,?) ON CONFLICT(id) DO NOTHING")
      .bind(c.salt,c.password_hash,c.session_key,c.revision,c.updated_at).run();
    if (result.meta.changes!==1) return adminLoginPage(true,false,'이미 관리자 비밀번호가 등록됐습니다. 로그인해 주세요.',409);
    config = c;
  } else if (password.length>128 || !await verifyPassword(password,config)) {
    await attempts.fail();
    return page('관리자 비밀번호가 맞지 않습니다.',401);
  }
  await attempts.clear();
  return new Response(null,{status:303,headers:{...PRIVATE_HEADERS,Location:'/admin','Set-Cookie':sessionCookie(await makeViewerToken(config),request,'admin')}});
}
