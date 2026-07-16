# Service Connection Smoke Test

## Supabase 연결 확인

- [ ] `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` 설정
- [ ] `.env.local`에 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] `npm run build` 성공
- [ ] `/api/quiz/next`가 환경변수 누락 없이 응답

## Auth 확인

- [ ] Google 로그인 버튼 표시
- [ ] Kakao 로그인 버튼 표시
- [ ] Naver 로그인 버튼 표시
- [ ] Email 로그인 입력 표시
- [ ] 로그인 후 user id 확보
- [ ] 비로그인 feedback 차단 유지

## 배포 확인

- [ ] Vercel 환경변수 등록
- [ ] 배포 build 성공
- [ ] 공개 URL 접속 가능
- [ ] 모바일 화면 확인
- [ ] 금지 표현 없음

## 완료 기준

실제 외부 연결 이후에도 핵심 루프가 유지되어야 한다.

```text
퀴즈 조회 → 답안 제출 → 정답 확인 → 로그인 feedback → score 표시
```
