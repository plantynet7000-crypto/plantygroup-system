import { isAdminRequest,getAccessConfig,saveAccessConfig,sameOrigin,loginAttempts } from '../../../../server/access-service';
import { PRIVATE_HEADERS } from '../../../../server/admin-policy';
import { createGateConfig,verifyPassword,makeViewerToken,sessionCookie } from '../../../../server/access-crypto';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const json = (value:unknown,status=200) => Response.json(value,{status,headers:PRIVATE_HEADERS});
  if (!sameOrigin(request)||!await isAdminRequest(request)) return json({error:'관리자 로그인이 필요합니다.'},403);
  const text = await request.text();
  if (text.length>2048) return json({error:'입력 내용이 너무 깁니다.'},413);
  let data;
  try { data=JSON.parse(text); } catch { return json({error:'입력을 확인해 주세요.'},400); }
  if (typeof data?.password!=='string'||data.password.trim().length<8||data.password.length>128) return json({error:'관리자 비밀번호는 8~128자로 입력해 주세요.'},400);
  if (typeof data.currentPassword!=='string'||data.currentPassword.length>128) return json({error:'현재 관리자 비밀번호를 확인해 주세요.'},400);
  const attempts = await loginAttempts(request,'admin');
  if (attempts.blocked) return json({error:'비밀번호 확인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429);
  const current = await getAccessConfig('admin');
  if (!current||!await verifyPassword(data.currentPassword,current)) {
    await attempts.fail();
    return json({error:'현재 관리자 비밀번호가 맞지 않습니다.'},400);
  }
  const config = await createGateConfig(data.password);
  await saveAccessConfig('admin',config);
  await attempts.clear();
  return Response.json({configured:true},{headers:{...PRIVATE_HEADERS,'Set-Cookie':sessionCookie(await makeViewerToken(config),request,'admin')}});
}
