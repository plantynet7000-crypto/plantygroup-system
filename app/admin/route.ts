import { isAdminRequest, maySetupAdmin, getAccessConfig } from '../../server/access-service';
import { adminLoginPage } from '../../server/login-pages';
import { dashboardResponse } from '../../server/dashboard';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (await isAdminRequest(request)) return dashboardResponse(true);
  const configured = !!await getAccessConfig('admin');
  return adminLoginPage(configured,!configured && await maySetupAdmin(request));
}
