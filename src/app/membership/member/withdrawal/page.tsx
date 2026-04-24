'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import MypageShell from '@/components/mypage/MypageShell';
import WithdrawalForm from '@/components/membership/WithdrawalForm';

export default function MembershipWithdrawalPage() {
  return (
    <RequireAuth>
      <MypageShell title="회원 탈퇴" subtitle="My page · Account — 계정 삭제 전 유의사항을 확인한 뒤 진행해 주세요.">
        <WithdrawalForm />
      </MypageShell>
    </RequireAuth>
  );
}
