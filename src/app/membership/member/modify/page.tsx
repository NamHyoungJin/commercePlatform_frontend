'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import MypageShell from '@/components/mypage/MypageShell';
import ProfileModifyForm from '@/components/membership/ProfileModifyForm';

export default function MembershipModifyPage() {
  return (
    <RequireAuth>
      <MypageShell title="회원정보 수정" subtitle="My page · Profile — 이름, 연락처 등 회원 정보를 확인하고 수정합니다.">
        <ProfileModifyForm />
      </MypageShell>
    </RequireAuth>
  );
}
