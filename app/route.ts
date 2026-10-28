import { isAdminRequest } from '../server/access-service';
import { dashboardResponse } from '../server/dashboard';
import { mayReadReport } from '../server/viewer-access';
import { loginChoicePage } from '../server/login-pages';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (await isAdminRequest(request)) return dashboardResponse(true);
  if (await mayReadReport(request)) return dashboardResponse(false);
  return loginChoicePage();
}
