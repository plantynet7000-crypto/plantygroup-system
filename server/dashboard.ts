import { dashboardHTML } from './dashboard-html';
import { PRIVATE_HEADERS } from './admin-policy';
export function dashboardResponse(admin: boolean) {
  const scripts = admin ? '<script>window.IS_ADMIN=true;</script><script defer src="/vendor/xlsx.full.min.js"></script><script defer src="/vendor/html2canvas.min.js"></script><script defer src="/vendor/jspdf.umd.min.js"></script><script defer src="/admin-assets/admin-export.js"></script><script defer src="/admin-assets/admin-tools.js"></script><script defer src="/admin-assets/admin-password.js"></script>' : '<script>window.IS_ADMIN=false;</script>';
  const logout = '<form action="/logout" method="post"><button type="submit" class="button">로그아웃</button></form>';
  const controls = '<div class="headeractions">'+(admin?'<span class="admin-badge">관리자</span><button id="print" class="button">요약 PDF 출력</button><button id="uploadNav" class="button primary">＋ 자료 업로드</button><button id="passwordSettings" class="button">비밀번호 설정</button>':'<span class="admin-badge">사용자</span>')+logout+'</div>';
  const html = dashboardHTML.replace('<!--ADMIN_SCRIPTS-->',scripts).replace('<!--ADMIN_CONTROLS-->',controls);
  return new Response(html,{headers:{...PRIVATE_HEADERS,'Content-Type':'text/html; charset=utf-8'}});
}
