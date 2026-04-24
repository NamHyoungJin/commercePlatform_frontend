'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import MypageShell from '@/components/mypage/MypageShell';
import MypagePrintdownClient from '@/components/mypage/MypagePrintdownClient';

export default function MypagePrintdownPage() {
  return (
    <RequireAuth>
      <MypageShell title="인쇄 / 다운로드" subtitle="My page · Print / Download — 구매한 악보를 인쇄하거나 파일로 받을 수 있습니다.">
        <MypagePrintdownClient />
      </MypageShell>
    </RequireAuth>
  );
}
