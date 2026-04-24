import { apiClient } from './axios';

export interface LoginPayload {
  member_id: string;
  password: string;
}

export type VerifyVia = 'phone' | 'email' | 'both';

export interface RegisterPayload {
  member_id: string;
  password: string;
  password_confirm: string;
  name: string;
  nickname: string;
  /** 레거시 필드(백엔드 호환). 인증 완료 여부는 토큰으로만 판별됩니다. */
  verify_via?: VerifyVia;
  phone: string;
  email: string;
  phone_verify_token?: string;
  email_verify_token?: string;
  /** 이메일 수신 동의 (레거시 memberShipEmailFlag) */
  email_receive?: boolean;
  /** SMS 수신 동의 (레거시 memberShipHpFlag) */
  sms_receive?: boolean;
}

export interface Member {
  member_sid: string;
  member_id: string;
  name: string;
  nickname?: string;
  phone: string;
  email: string;
  email_receive?: boolean;
  sms_receive?: boolean;
  id_verified_email?: boolean;
  id_verified_phone?: boolean;
  reg_datetime: string;
}

export interface LoginResponse {
  access: string;
  member: Member;
  /** 둘 다 미인증일 때만 안내 문구 */
  identity_verification_warning?: string | null;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface CheckMemberIdResponse {
  available: boolean;
}

export interface MemberProfilePatchPayload {
  current_password: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  email_receive?: boolean;
  sms_receive?: boolean;
  phone_verify_token?: string;
  email_verify_token?: string;
  new_password?: string;
  new_password_confirm?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login/', payload),

  logout: () => apiClient.post('/auth/logout/', {}),

  register: (payload: RegisterPayload) =>
    apiClient.post<Member>('/auth/register/', payload),

  checkMemberId: (member_id: string) =>
    apiClient.post<CheckMemberIdResponse>('/auth/check-member-id/', { member_id }),

  sendRegisterVerification: (payload: { channel: 'phone' | 'email'; target: string }) =>
    apiClient.post<{ sent: boolean }>('/auth/register/verify/send/', payload),

  confirmRegisterVerification: (payload: {
    channel: 'phone' | 'email';
    target: string;
    code: string;
  }) =>
    apiClient.post<{ proof_token: string }>('/auth/register/verify/confirm/', payload),

  /** 등록된 연락처와 동일한 값으로만 발송 (로그인 필요) */
  meIdentityVerifySend: (payload: { channel: 'phone' | 'email'; target: string }) =>
    apiClient.post<{ sent: boolean }>('/auth/me/identity-verify/send/', payload),

  meIdentityVerifyConfirm: (payload: {
    channel: 'phone' | 'email';
    target: string;
    code: string;
  }) => apiClient.post<{ proof_token: string }>('/auth/me/identity-verify/confirm/', payload),

  me: () => apiClient.get<Member>('/auth/me/'),

  verifyMePassword: (payload: { password: string }) =>
    apiClient.post<{ verified: boolean }>('/auth/me/verify-password/', payload),

  patchMe: (payload: MemberProfilePatchPayload) => apiClient.patch<Member>('/auth/me/', payload),

  withdraw: (payload: { password: string; reason: string }) =>
    apiClient.post<{ detail: string }>('/auth/me/withdraw/', payload),

  findMemberId: (payload: { name: string; email: string }) =>
    apiClient.post<{ member_id: string }>('/auth/find-id/', payload),

  findMemberPassword: (payload: { member_id: string; name: string; email: string }) =>
    apiClient.post<{ detail: string }>('/auth/find-password/', payload),

  /** 비밀번호 변경: 아이디·이름 확인 → 연락처 마스킹·세션 */
  passwordResetLookup: (payload: { member_id: string; name: string }) =>
    apiClient.post<{
      reset_session_token: string;
      channels: ('phone' | 'email')[];
      require_channel_choice: boolean;
      phone_masked: string | null;
      email_masked: string | null;
    }>('/auth/password-reset/lookup/', payload),

  passwordResetSend: (payload: { reset_session_token: string; channel: 'phone' | 'email' }) =>
    apiClient.post<{ sent: boolean }>('/auth/password-reset/send/', payload),

  passwordResetConfirm: (payload: {
    reset_session_token: string;
    channel: 'phone' | 'email';
    code: string;
  }) => apiClient.post<{ password_change_token: string }>('/auth/password-reset/confirm/', payload),

  passwordResetComplete: (payload: {
    password_change_token: string;
    new_password: string;
    new_password_confirm: string;
  }) => apiClient.post<{ detail: string }>('/auth/password-reset/complete/', payload),
};
