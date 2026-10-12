import { mayReadReport } from '../../../server/viewer-access';
import { PRIVATE_HEADERS } from '../../../server/admin-policy';
import { reportSources } from '../../../server/report-sources';
export const dynamic='force-dynamic';
export async function GET(request:Request,context:{params:Promise<{file:string}>}){if(!await mayReadReport(request))return new Response('Access password required',{status:401,headers:PRIVATE_HEADERS});const {file}=await context.params;if(!Object.hasOwn(reportSources,file))return new Response('Not found',{status:404,headers:PRIVATE_HEADERS});return new Response(reportSources[file],{headers:{...PRIVATE_HEADERS,'Content-Type':'application/javascript; charset=utf-8'}});}
