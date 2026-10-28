import { isAdminRequest } from '../../../server/access-service';
import { PRIVATE_HEADERS } from '../../../server/admin-policy';
import { adminSources } from '../../../server/admin-sources';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: {params:Promise<{file:string}>}) {
  if (!await isAdminRequest(request)) return new Response('Administrator access required',{status:401,headers:PRIVATE_HEADERS});
  const {file}=await context.params;
  if (!Object.hasOwn(adminSources,file)) return new Response('Not found',{status:404,headers:PRIVATE_HEADERS});
  return new Response(adminSources[file],{headers:{...PRIVATE_HEADERS,'Content-Type':'application/javascript; charset=utf-8'}});
}
