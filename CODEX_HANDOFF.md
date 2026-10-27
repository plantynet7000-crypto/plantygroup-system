# Codex 인수인계

## 기준

이 프로젝트는 플랜티그룹의 C-level 인원현황 보고 웹앱입니다. 현재 운영 중인 전체 소스 스냅샷이며 단일 HTML 파일이 아닙니다. Next.js 방식의 route handler와 Vinext/Cloudflare Worker, D1을 사용합니다.

Sites project_id는 `.openai/hosting.json`의 값을 유지합니다. 기존 URL은 https://plantynet.plantynet-9691.chatgpt.site/ 입니다. 사용자가 새 사이트 생성을 요청하지 않았다면 기존 프로젝트를 재사용합니다. 다운로드 자료 준비만을 위해 운영 사이트를 재배포하지 않았습니다.

## 수정 위치

| 위치 | 역할 |
|---|---|
| `report-client/app.js` | 기본 예시자료, 화면 상태, 요약·상세 화면 구성 |
| `report-client/core.js` | 업로드 행 정규화, 재직·근속·연령·임금 집계 |
| `report-client/changes.js` | 비교일자 대비 변동 상세 |
| `report-client/benchmark.js` | 외부 IT 중소기업 참고자료 |
| `report-client/table-scroll.js` | 표 하단 단일 스크롤바 |
| `public/style.css` | PC·모바일 공통 스타일 |
| `private/admin-tools.js` | 관리자 업로드 및 엑셀 양식 생성 |
| `private/admin-export.js` | 브라우저 내 요약 PDF 생성 |
| `private/admin-password.js` | 관리자 접속 암호 설정 UI |
| `server/dashboard-html.ts` | HTML 셸을 문자열로 보관 |
| `server/dashboard.ts` | 권한별 HTML 및 관리자 스크립트 주입 |
| `server/admin-policy.ts` | 검증된 관리자 이메일 검사 |
| `server/viewer-access.ts` / `server/access-crypto.ts` | 방문자 암호 화면·쿠키·해시 검증 |
| `app/` | 인증·비밀번호 API·권한별 스크립트 전송 route handler |
| `db/` / `drizzle/` | 접속 암호 설정과 로그인 시도 제한 스키마·마이그레이션 |

`server/admin-sources.ts`, `server/report-sources.ts`는 생성물입니다. 원본은 `private/`와 `report-client/`입니다. 생성 문자열을 직접 편집하지 말고 `node scripts/sync-dashboard-sources.mjs`를 실행합니다. 빌드 명령에도 자동 포함되어 있습니다.

## 유지할 동작

- 그룹명 플랜티그룹, 회사명 플랜티넷·플랜티엠, 영문 주소 plantynet.
- 방문자는 인원현황 요약과 인력구성 상세만 조회. 관리자만 업로드·PDF·암호 설정 가능.
- 방문자 암호 최소 4자. PBKDF2 해시, 서명 쿠키, 암호 변경 시 이전 세션 무효화, 로그인 시도 제한을 유지.
- 실제 인사자료는 브라우저 메모리만 사용. 네트워크로 전송하거나 localStorage·서버에 저장하는 경로를 추가하지 않음.
- 파일 읽기 전 `/api/admin/access` GET은 권한 검사이며 인사자료가 포함되지 않음.
- 기본 입력 10열: 회사명, 이름, 근무부서, 직급, 성별, 생년월일, 입사일, 퇴사일, 고용형태, 연봉. 직군은 선택 추가열.
- 회사 선택이 회사별 표에도 적용. 근속·연령 구간은 큰 구간부터 내림차순.
- 막대그래프는 전체 100% 기준. 비대화형 안내 표시는 버튼 모양이 아닌 보조 텍스트.
- 모바일에서 화면 전체가 가로로 넘치지 않게 하고 표 안에서만 가로 스크롤. 하단 스크롤바는 하나.
- 외부 참고 수치가 불명확하면 확인불가. 기존 출처는 최신·정확성을 재검증하고 수정할 것.
- PDF 생성은 클라이언트에서 수행. 기존 공유·다운로드 호환 동작을 보존할 것.

## 로컬 인증과 타 호스팅

`server/admin-policy.ts`는 신뢰된 플랫폼 사용자의 이메일을 검사합니다. 현재 관리자는 코드에 지정된 계정입니다. 원본 README의 portable 모의 로그인은 `seedy@sites.test`이므로 기본 상태에서 관리자 권한을 받지 못합니다. 필요하면 로컬 개발 서버 내부에서만 동작하는 개발 전용 인증을 추가하되, 운영 빌드에는 포함되지 않게 해야 합니다. `isAdminIdentity`를 항상 true로 바꾸거나 브라우저 변수·URL 파라미터만으로 권한을 부여하면 안 됩니다.

타 호스팅으로 이전할 때는 해당 플랫폼의 서버 인증을 구현하고, 클라이언트가 임의로 설정한 `oai-authenticated-*` 헤더를 신뢰하지 않습니다. D1 테이블은 인사자료용이 아니라 암호 설정·로그인 제한용입니다. 운영 암호·세션은 이 소스 ZIP에 포함되지 않습니다.

## 배포 시

잠금 파일에 맞춰 의존성을 설치하고 빌드합니다. 기존 Sites는 현행 Sites skill로 소스를 연 뒤 최신 변경과 충돌을 확인해 배포합니다. 일반 HTML 정적 호스팅만으로 인증 기능을 보존할 수 없습니다. 다른 플랫폼으로 이전하는 경우 플랫폼별 실행 환경 및 보안 구성을 먼저 검토합니다.
