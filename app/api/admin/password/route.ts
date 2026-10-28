import { isAdminRequest,getAccessConfig,saveAccessConfig,sameOrigin } from '../../../../server/access-service';
import { PRIVATE_HEADERS } from '../../../../server/admin-policy';
import { createGateConfig } from '../../../../server/access-crypto';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return Response.json({error:'관리자 로그인이 필요합니다.'},{status:403,headers:PRIVATE_HEADERS});
  const config = await getAccessConfig('viewer');
  return Response.json({configured:!!config,updatedAt:config?.updated_at||null},{headers:PRIVATE_HEADERS});
}
export async function POST(request: Request) {
  const json = (value:unknown,status=200) => Response.json(value,{status,headers:PRIVATE_HEADERS});
  if (!sameOrigin(request)||!await isAdminRequest(request)) return json({error:'관리자 로그인이 필요합니다.'},403);
  const text = await request.text();
  if (text.length>2048) return json({error:'입력 내용이 너무 깁니다.'},413);
  let password:unknown;
  try { password=JSON.parse(text).password; } catch { return json({error:'입력을 확인해 주세요.'},400); }
  if (typeof password!=='string'||!/^[0-9]{4}$/.test(password)) return json({error:'사용자 비밀번호는 숫자 4자리로 입력해 주세요.'},400);
  const config = await createGateConfig(password);
  await saveAccessConfig('viewer',config);
  return json({configured:true,updatedAt:config.updated_at});
}
