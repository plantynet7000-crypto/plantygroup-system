import { accessCookie, verifyViewerToken } from './access-crypto';
import { getAccessConfig, isAdminRequest } from './access-service';
import { accessPage, escapeHtml } from './login-pages';
export { database, getAccessConfig, saveAccessConfig, sameOrigin } from './access-service';
export function getGateConfig() { return getAccessConfig('viewer'); }
export async function mayReadReport(request: Request) {
  if (await isAdminRequest(request)) return true;
  const config = await getGateConfig();
  return !!config && await verifyViewerToken(accessCookie(request,'viewer'),config);
}
export function passwordPage(configured: boolean, message = '', status = 200) {
  const form = configured?'<form action="/access" method="post"><label for="viewerPassword">보고서 비밀번호</label><input id="viewerPassword" name="password" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="current-password" required autofocus><button class="button primary" type="submit">보고서 보기</button></form>':'';
  return accessPage('보고서 확인','<p>'+(configured?'관리자에게 전달받은 숫자 4자리 비밀번호를 입력해 주세요.':'관리자가 사용자 비밀번호를 설정한 뒤 로그인할 수 있습니다.')+'</p>'+form+(message?'<p class="access-error" role="alert">'+escapeHtml(message)+'</p>':'')+'<a class="access-admin" href="/">로그인 선택으로 돌아가기</a>',status);
}
