import { sessionCookie } from '../../server/access-crypto';
import { PRIVATE_HEADERS } from '../../server/admin-policy';
import { sameOrigin } from '../../server/access-service';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response('Forbidden',{status:403,headers:PRIVATE_HEADERS});
  const headers = new Headers({...PRIVATE_HEADERS,Location:'/'});
  headers.append('Set-Cookie',sessionCookie('',request,'admin',0));
  headers.append('Set-Cookie',sessionCookie('',request,'viewer',0));
  return new Response(null,{status:303,headers});
}
