async function openPasswordSettings() {
  if (!await assertAdmin()) return;
  exportShell('관리자 · 비밀번호 설정');
  $('#exportContent').innerHTML = '<div class="password-sections"><section><h3>사용자 로그인 비밀번호</h3><p class="method">보고서를 확인하는 사용자에게 전달할 숫자 4자리를 설정합니다.</p><p id="passwordConfigStatus" class="mini" role="status" aria-live="polite">설정 상태를 확인하는 중입니다…</p><form id="passwordConfigForm" class="password-config"><label>새 사용자 비밀번호<input id="newViewerPassword" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="new-password" required placeholder="숫자 4자리"></label><label>사용자 비밀번호 확인<input id="confirmViewerPassword" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="new-password" required></label><button id="saveViewerPassword" type="submit" class="button primary">사용자 비밀번호 저장</button></form><p class="mini">변경하면 기존 사용자는 새 비밀번호로 다시 로그인해야 합니다.</p></section><section><h3>관리자 로그인 비밀번호</h3><p class="method">현재 비밀번호를 확인한 뒤 새 관리자 비밀번호로 변경합니다.</p><p id="adminPasswordStatus" class="mini" role="status" aria-live="polite"></p><form id="adminPasswordForm" class="password-config"><label>현재 관리자 비밀번호<input id="currentAdminPassword" type="password" maxlength="128" autocomplete="current-password" required></label><label>새 관리자 비밀번호<input id="newAdminPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required placeholder="8자 이상 입력"></label><label>관리자 비밀번호 확인<input id="confirmAdminPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><button id="saveAdminPassword" type="submit" class="button primary">관리자 비밀번호 변경</button></form><p class="mini">비밀번호를 변경한 다른 관리자 세션은 자동으로 만료됩니다.</p></section></div>';
  try {
    const response = await fetch('/api/admin/password',{credentials:'same-origin',cache:'no-store'});
    if (!response.ok) throw Error('관리자 로그인을 확인해 주세요.');
    const data = await response.json();
    $('#passwordConfigStatus').textContent = data.configured?'사용자 비밀번호가 설정돼 있습니다. 새 비밀번호를 저장하면 변경됩니다.':'아직 사용자 비밀번호가 없습니다. 숫자 4자리를 설정해 주세요.';
  } catch(e) { $('#passwordConfigStatus').textContent = e.message; }
  $('#passwordConfigForm').onsubmit = async e => {
    e.preventDefault();
    const password = $('#newViewerPassword').value;
    if (!/^[0-9]{4}$/.test(password)) { $('#passwordConfigStatus').textContent='숫자 4자리를 입력해 주세요.'; return; }
    if (password!==$('#confirmViewerPassword').value) { $('#passwordConfigStatus').textContent='비밀번호 확인이 일치하지 않습니다.'; return; }
    const button=$('#saveViewerPassword'); button.disabled=true;
    try {
      const response=await fetch('/api/admin/password',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
      const data=await response.json();
      if (!response.ok) throw Error(data.error||'비밀번호를 저장하지 못했습니다.');
      $('#passwordConfigForm').reset();
      $('#passwordConfigStatus').textContent='사용자 비밀번호를 저장했습니다. 사용자에게 숫자 4자리를 알려 주세요.';
    } catch(e) { $('#passwordConfigStatus').textContent=e.message; } finally { button.disabled=false; }
  };
  $('#adminPasswordForm').onsubmit = async e => {
    e.preventDefault();
    const password=$('#newAdminPassword').value,currentPassword=$('#currentAdminPassword').value;
    if (password.trim().length<8) { $('#adminPasswordStatus').textContent='관리자 비밀번호는 8자 이상으로 입력해 주세요.'; return; }
    if (password!==$('#confirmAdminPassword').value) { $('#adminPasswordStatus').textContent='비밀번호 확인이 일치하지 않습니다.'; return; }
    const button=$('#saveAdminPassword'); button.disabled=true;
    try {
      const response=await fetch('/api/admin/credentials',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({password,currentPassword})});
      const data=await response.json();
      if (!response.ok) throw Error(data.error||'관리자 비밀번호를 변경하지 못했습니다.');
      $('#adminPasswordForm').reset();
      $('#adminPasswordStatus').textContent='관리자 비밀번호를 변경했습니다.';
    } catch(e) { $('#adminPasswordStatus').textContent=e.message; } finally { button.disabled=false; }
  };
}
