import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SignInSsoCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      // 로그인 성공 시 이동
      signInFallbackRedirectUrl="/go/profile"
      // 신규 계정(미등록) 시 온보딩/가입 연속 플로우로 이동
      continueSignUpUrl="/sign-up/continue"
    />
  );
}
