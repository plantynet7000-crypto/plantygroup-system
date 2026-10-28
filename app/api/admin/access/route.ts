import { isAdminRequest } from '../../../../server/access-service';
import { PRIVATE_HEADERS } from '../../../../server/admin-policy';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const allowed = await isAdminRequest(request);
  return Response.json({allowed},{status:allowed?200:401,headers:PRIVATE_HEADERS});
}
