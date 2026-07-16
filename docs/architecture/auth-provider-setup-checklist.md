# Auth Provider Setup Checklist

## 공통 준비물

- Supabase project URL
- Supabase anon key
- Site URL
- OAuth callback URL

Supabase callback URL 형식:

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

## Google

- Google Cloud project
- OAuth consent screen
- OAuth client ID
- OAuth client secret
- Supabase Auth provider에 Google 활성화

## Kakao

- Kakao Developers app
- REST API key 또는 OAuth client 정보
- Redirect URI 등록
- Supabase Auth provider에 Kakao 활성화

## Naver

- Naver Developers application
- Client ID
- Client Secret
- Callback URL 등록
- Supabase Auth provider에 Naver 활성화

## Email

- Supabase Email Auth 활성화
- Confirm email 여부 결정
- Redirect URL 설정

## 보안 원칙

- secret 값은 코드/Notion/채팅에 기록하지 않는다.
- `.env.local`은 git에 올리지 않는다.
- Vercel 환경변수는 dashboard 또는 CLI secret 방식으로 등록한다.
- service role key는 browser/client 코드에서 절대 사용하지 않는다.
