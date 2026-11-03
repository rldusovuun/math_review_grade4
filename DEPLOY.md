# GitHub + Cloudflare 무료 플랜 배포 안내

대상: https://github.com/rldusovuun/math_review_grade4

## 1. GitHub에 파일 올리기

1. 제공된 ZIP 파일을 PC에서 압축 해제합니다.
2. 저장소에서 **Add file → Upload files**를 엽니다. 빈 저장소라면 **uploading an existing file**을 누릅니다.
3. 압축을 푼 폴더 **안의 파일과 하위 폴더 전체**를 끌어다 놓습니다. ZIP 자체나 바깥 폴더를 올리지 않습니다.
4. `.github`, `.gitignore`, `.npmrc`, `.dev.vars.example`도 포함합니다. 업로드 파일은 총 40개입니다.
5. **Commit changes**로 저장합니다. 루트에 `package.json`이 보여야 합니다.
6. **Actions → Check learning app**이 성공하는지 확인합니다. 실패하면 해당 로그를 확인해야 합니다.

소스에 정답이 포함되므로 저장소는 Private을 권장합니다. Private 저장소라도 배포된 학습 사이트는 학생들이 접속할 수 있습니다.

## 2. Cloudflare D1 만들기

Cloudflare 무료 계정에서 **Storage & databases → D1 SQL Database → Create database**로 DB를 생성합니다.

- 이름: `math-review-grade4-db`
- 생성된 **Database ID**를 복사합니다.
- Cloudflare의 **Account ID**도 확인합니다.

기존 DB를 사용하지 말고 이 학습 앱 전용 빈 DB를 만드세요.

## 3. Cloudflare 배포용 토큰 준비

Cloudflare의 **API Tokens → Create Token**에서 Workers 배포용 토큰을 만듭니다.

- **Edit Cloudflare Workers** 템플릿 사용
- 해당 계정에 **D1: Edit** 권한도 포함
- 사용할 계정 하나로 범위를 제한

토큰은 채팅이나 소스 코드에 붙여 넣지 않고 다음 단계의 GitHub Secrets에 직접 저장합니다.

## 4. GitHub 변수와 비밀값 등록

저장소의 **Settings → Secrets and variables → Actions**에서 아래 값을 등록합니다.

### Secrets 탭 → New repository secret

| 이름 | 값 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 위에서 만든 Cloudflare 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |
| `TEACHER_PASSWORD` | 교사만 아는 16~256자 비밀번호 |

교사 비밀번호는 학생 학급 코드와 별개입니다. 저장소에 예시 비밀번호를 실제 값으로 사용하지 마세요. 비밀번호는 로그인 검증용 SHA-256 값으로 변환되어 Cloudflare의 암호화된 Secret에 저장됩니다.

### Variables 탭 → New repository variable

| 이름 | 값 |
| --- | --- |
| `CLOUDFLARE_D1_DATABASE_ID` | 위에서 만든 D1 Database ID |
| `ENABLE_DEPLOY` | `true` |

`ENABLE_DEPLOY`를 설정하기 전에는 배포 작업을 건너뛰고 코드 검사만 실행합니다.

## 5. 첫 배포

1. **Actions → Deploy learning app → Run workflow**를 누릅니다.
2. 설치 → 검사 → 빌드 → DB 마이그레이션 → 배포 → 교사 로그인 설정까지 모두 성공해야 합니다.
3. **Deploy Worker** 단계 로그의 `https://math-review-grade4.…workers.dev` 주소를 확인합니다.
4. 교사용 주소는 해당 주소 뒤에 `/teacher`를 붙입니다.
5. 설정한 교사 비밀번호로 로그인해 학급을 만들고, 학생에게 **사이트 주소 + 학급 코드**를 안내합니다.

이후 `main`에 변경 사항을 올리면 자동으로 배포됩니다. 무료 플랜과 기본 `workers.dev` 주소를 사용하면 유료 도메인이 필요 없습니다. 계정의 실제 무료 사용량 한도는 Cloudflare 대시보드에서 확인하세요.

## 배포 직후 확인

- 교사 로그인 후 학급 만들기
- 학생 화면에서 새 학급 코드·번호로 접속
- 첫 제출 후 오답만 다시 나오는지 확인
- 오답 재도전 후 첫 점수 유지·최근 점수 갱신 확인
- 교사 문항 분석표와 학생 취약 단원 확인
- A4 인쇄 미리보기에서 도형·문제 잘림 확인

테스트에 쓰는 번호도 기록됩니다. 실제 학급과 구분되는 별도 테스트 학급을 만들어 시험하세요.

## 비밀번호 변경

GitHub의 `TEACHER_PASSWORD` Secret을 새 값으로 변경한 뒤 Deploy workflow를 다시 실행합니다. 기존 교사 세션은 새 비밀번호 해시가 적용되면 무효화됩니다. 학생 기록은 유지됩니다.

## 실패 시

- Check 실패: 설치/빌드 오류 로그를 확인합니다. 빌드 검증 전에는 실제 학생에게 배포 주소를 안내하지 마세요.
- D1 권한 오류: 토큰의 D1 Edit 및 계정 범위를 확인합니다.
- DB 미지정: Variables의 Database ID가 실제 D1 UUID인지 확인합니다.
- 교사 비밀번호 미설정: Configure teacher sign-in 단계와 TEACHER_PASSWORD Secret을 확인합니다.
- 로그인 시도 제한: 동일 접속 주소에서 15분 구간당 10회까지 허용합니다.

공식 문서:
- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/platform/pricing/
