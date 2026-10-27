import { dashboardHTML } from './dashboard-html';
import { PRIVATE_HEADERS } from './admin-policy';
export function dashboardResponse(admin: boolean) {
  const scripts = admin ? '<script>window.IS_ADMIN=true;</script><script defer src="/vendor/xlsx.full.min.js"></script><script defer src="/vendor/html2canvas.min.js"></script><script defer src="/vendor/jspdf.umd.min.js"></script><script defer src="/admin-assets/admin-export.js"></script><script defer src="/admin-assets/admin-tools.js"></script><script defer src="/admin-assets/admin-password.js"></script>' : '<script>window.IS_ADMIN=false;</script>';
  const controls = admin ? '<div class="headeractions"><span class="admin-badge">관리자</span><button id="print" class="button">요약 PDF 출력</button><button id="uploadNav" class="button primary">＋ 자료 업로드</button><button id="passwordSettings" class="button">접속 암호</button></div>' : '';
  const html = dashboardHTML.replace('<!--ADMIN_SCRIPTS-->', scripts).replace('<!--ADMIN_CONTROLS-->', controls);
  return new Response(html, { headers: { ...PRIVATE_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } });
}
