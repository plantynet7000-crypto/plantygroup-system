import { getChatGPTUser } from './chatgpt-auth';
import { isAdminIdentity } from '../server/admin-policy';
import { dashboardResponse } from '../server/dashboard';
import { mayReadReport,getGateConfig,passwordPage } from '../server/viewer-access';
export const dynamic='force-dynamic';
export async function GET(request:Request){const admin=isAdminIdentity(await getChatGPTUser());if(admin||await mayReadReport(request))return dashboardResponse(admin);return passwordPage(!!await getGateConfig());}
