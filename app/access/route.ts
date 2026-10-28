import { getGateConfig,passwordPage,sameOrigin } from '../../server/viewer-access';
import { loginAttempts } from '../../server/access-service';
import { makeViewerToken,sessionCookie,verifyPassword } from '../../server/access-crypto';
import { PRIVATE_HEADERS } from '../../server/admin-policy';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response('Forbidden',{status:403,headers:PRIVATE_HEADERS});
  const text = await request.text();
  if (text.length>2048) return new Response('Payload too large',{status:413,headers:PRIVATE_HEADERS});
  const config = await getGateConfig();
  if (!config) return passwordPage(false);
  const attempts = await loginAttempts(request,'viewer');
  if (attempts.blocked) return passwordPage(true,'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.',429);
  const password = new URLSearchParams(text).get('password')||'';
  if (/^[0-9]{4}$/.test(password) && await verifyPassword(password,config)) {
    await attempts.clear();
    return new Response(null,{status:303,headers:{...PRIVATE_HEADERS,Location:'/','Set-Cookie':sessionCookie(await makeViewerToken(config),request)}});
  }
  await attempts.fail();
  return passwordPage(true,'사용자 비밀번호가 맞지 않습니다. 숫자 4자리를 확인해 주세요.',401);
}
