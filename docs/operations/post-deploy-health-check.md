# Post-deploy Health Check

## 목적

배포 직후 운영 확인을 한 명령으로 표준화한다. 성공 확인 전에는 배포 완료 보고를 하지 않는다.

## 실행 명령

```bash
npm run ops:health
```

다른 URL을 확인해야 하면:

```bash
JLPT_OPS_BASE_URL=https://jlpt-quiz-agent.vercel.app npm run ops:health
```

Vercel CLI 인증이 없거나 로컬에서 HTTP만 확인할 때는 로그 확인만 건너뛴다.

```bash
npm run ops:health -- --skip-logs
```

## 배포 직후 운영 확인 범위

- 공개 페이지 200
  - `/`
  - `/guide`
  - `/mock-exams/n5`
  - `/mock-exams/n4`
  - `/mock-exams/n3`
  - `/mock-exams/n2`
  - `/mock-exams/n1`
  - `/wrong-note`
- SEO 파일
  - `sitemap.xml`
  - `robots.txt`
- API guard
  - `/api/quiz/next?item_type=vocab&jlpt_level=N5`
  - `/api/items/ranking`
  - `/api/mock-exams/attempts` 비로그인 POST 차단
- 최근 Vercel 로그
  - `vercel logs <url> --since 10m`
  - `TypeError`, `ReferenceError`, `Unhandled`, `error` 검사

## 통과 기준

- 공개 페이지와 SEO 파일이 정상 응답한다.
- 주요 문구가 HTML에 포함된다.
- API guard가 의도한 상태 코드로 응답한다.
- 최근 Vercel 로그 에러 0건이다.
- `OPS HEALTH SUMMARY` 마지막 줄이 `PASS ops health check complete`이다.

## 실패 기준

- 한 페이지라도 200이 아니다.
- sitemap/robots 주요 경로가 빠져 있다.
- API가 인증 없이 저장을 허용한다.
- 최근 Vercel 로그에 에러 패턴이 있다.
- 실패 시 배포 완료 보고 금지. 원인 확인 후 수정, 재배포, `npm run ops:health` 재실행까지 완료해야 한다.
