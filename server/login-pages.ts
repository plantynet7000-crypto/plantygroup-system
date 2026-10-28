import { PRIVATE_HEADERS } from './admin-policy';
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
export function accessPage(title: string, content: string, status = 200, headerAction = '') {
  const html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#142d35"><title>플랜티그룹 · '+escapeHtml(title)+'</title><link rel="stylesheet" href="/style.css"></head><body><div class="access-page"><section class="panel access-panel"><div class="access-topbar"><span class="eyebrow">PLANTY GROUP / PEOPLE REPORT</span>' + headerAction + '</div><h1>'+escapeHtml(title)+'</h1>'+content+'</section></div></body></html>';
  return new Response(html,{status,headers:{...PRIVATE_HEADERS,'Content-Type':'text/html; charset=utf-8'}});
}
export function loginChoicePage() {
  return accessPage('플랜티그룹 인원현황','<p>그룹의 인원현황과 인력구성 보고서를 확인하세요.</p><div class="login-choices"><a class="login-choice report-entry" href="/login"><strong>보고서 확인하기 <span aria-hidden="true">→</span></strong><small>전달받은 숫자 4자리 비밀번호로 확인할 수 있습니다.</small></a></div>',200,'<a class="admin-entry" href="/admin">관리자 로그인</a>');
}
export function adminLoginPage(configured: boolean, canSetup: boolean, message = '', status = 200) {
  const setup = !configured && canSetup;
  const form = configured || setup ? '<form action="/admin/login" method="post"><label for="adminPassword">'+(setup?'새 관리자 비밀번호':'관리자 비밀번호')+'</label><input id="adminPassword" name="password" type="password" minlength="8" maxlength="128" autocomplete="'+(setup?'new-password':'current-password')+'" required autofocus>'+(setup?'<label for="adminPasswordConfirm">관리자 비밀번호 확인</label><input id="adminPasswordConfirm" name="confirmPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required>':'')+'<button class="button primary" type="submit">'+(setup?'관리자 비밀번호 등록 후 시작':'관리자 로그인')+'</button></form>':'';
  const intro = setup?'처음 사용할 관리자 비밀번호를 등록해 주세요. 8자 이상으로 설정합니다.':configured?'관리자 비밀번호를 입력해 주세요.':'아직 관리자 비밀번호가 등록되지 않았습니다. 사이트 소유자가 먼저 초기 설정을 완료해야 합니다.';
  const owner = !configured && !canSetup?'<a class="button" href="/signin-with-chatgpt?return_to=/admin" target="_top">사이트 소유자로 초기 설정</a>':'';
  return accessPage(setup?'첫 관리자 설정':'관리자 로그인','<p>'+intro+'</p>'+form+owner+(message?'<p class="access-error" role="alert">'+escapeHtml(message)+'</p>':'')+'<a class="access-admin" href="/">로그인 선택으로 돌아가기</a>',status);
}
