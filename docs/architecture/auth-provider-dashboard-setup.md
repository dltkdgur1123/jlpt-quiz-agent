# Auth Provider Dashboard Setup

## 선택된 로그인 방식

```text
Google
Kakao
Naver
Email
```

## 공통 원칙

- secret 값은 문서나 채팅에 기록하지 않는다.
- OAuth client secret은 Supabase dashboard에만 입력한다.
- browser에는 publishable/anon key만 사용한다.
- 자체 아이디/비밀번호 회원가입은 1차 MVP에서 제외한다.

## Supabase에서 설정할 것

1. Authentication 메뉴로 이동
2. Providers 메뉴에서 Google, Kakao, Email 활성화
3. Naver는 Supabase 기본 provider 목록에 없으므로 Custom OAuth/OIDC provider로 `custom:naver` 설정
4. 각 provider의 callback URL을 외부 개발자 콘솔에 등록
5. Site URL과 Redirect URL을 배포 URL에 맞게 설정

## Email 방식

MVP에서는 비밀번호 직접 관리 대신 이메일 링크 로그인을 우선 사용한다.

## 다음 확인

- 로컬 callback URL
- Vercel 배포 URL
- Google/Kakao/Naver 개발자 콘솔의 redirect URI
