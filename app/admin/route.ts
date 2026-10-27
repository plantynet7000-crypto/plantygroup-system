import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from '../chatgpt-auth';
import { isAdminIdentity, PRIVATE_HEADERS } from '../../server/admin-policy';
import { dashboardResponse } from '../../server/dashboard';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.redirect(new URL(chatGPTSignInPath('/admin'), request.url), 302);
  if (!isAdminIdentity(user)) return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>관리자 권한 확인</title><body style="font-family:sans-serif;padding:40px;line-height:2"><h1>관리자 권한이 없습니다.</h1><p>사이트 소유자의 계정으로 로그인해야 합니다.</p><a href="/">조회 화면으로 이동</a><br><a target="_top" href="'+chatGPTSignOutPath('/admin')+'">다른 계정으로 로그인</a></body></html>', { status: 403, headers: {...PRIVATE_HEADERS,'Content-Type':'text/html; charset=utf-8'} });
  return dashboardResponse(true);
}
