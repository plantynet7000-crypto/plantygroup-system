import { getChatGPTUser } from './chatgpt-auth';
import { isAdminIdentity } from '../server/admin-policy';
import { dashboardResponse } from '../server/dashboard';
export const dynamic = 'force-dynamic';
export async function GET() {
  return dashboardResponse(isAdminIdentity(await getChatGPTUser()));
}
