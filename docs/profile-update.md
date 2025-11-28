# 프로필 업데이트 도메인

- 위치: `app/profile/_actions.ts`, `service/profile/update-profile.ts`
- 목적: Clerk 사용자 계정의 `username`과 프로필 이미지를 서버 액션으로 갱신한다.

## 흐름
1) 사용자는 `/profile` 페이지에서 사용자명과 아바타 파일을 제출한다.  
2) 서버 액션 `updateProfileAction`이 Clerk 세션을 확인한 뒤 `service/profile/update-profile.ts`를 호출한다.  
3) 서비스 레이어는 `clerkClient()`를 통해 Clerk API를 생성하고,  
   - `username`이 2자 이상이면 `users.updateUser`로 업데이트한다.  
   - 업로드된 `avatar` 파일이 있을 때 `users.updateUserProfileImage`로 교체한다.  
4) Clerk의 `user.updated` 이벤트가 발생하면 Supabase Edge Function(`docs/supabase-clerk-webhook.md`)이 `profile` 테이블을 동기화한다.

## 유효성 및 에러 처리
- username은 앞뒤 공백을 제거하고 2자 이상일 때만 업데이트된다.
- 파일이 비어 있으면 아바타 업데이트를 건너뛴다.
- 예외는 `@sentry/nextjs`로 포착(`captureException`, `startSpan`)하며, 액션 단에서 실패 시 메시지를 남긴다.

## 확장 포인트
- 이미지 리사이즈/검증을 추가하려면 서비스 레이어에서 `avatarFile`을 사전 처리한다.
- UI 피드백(성공/실패 토스트)은 클라이언트 컴포넌트로 감싸 `useFormState`를 활용해 구현할 수 있다.
