import { getChatGPTUser } from '../../../chatgpt-auth';
import { isAdminIdentity, PRIVATE_HEADERS } from '../../../../server/admin-policy';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await getChatGPTUser(), allowed = isAdminIdentity(user);
  return Response.json({allowed}, {status:allowed?200:user?403:401,headers:PRIVATE_HEADERS});
}
