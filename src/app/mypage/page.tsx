'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import MypageShell from '@/components/mypage/MypageShell';
import MypageHomeClient from '@/components/mypage/MypageHomeClient';

export default function MypageHomePage() {
  return (
    <RequireAuth>
      <MypageShell
        title="마이페이지"
        subtitle="My page — 예배와 연습을 위한 악보를 한곳에서 정리하고, 구매까지 자연스럽게 이어 가세요."
      >
        <MypageHomeClient />
      </MypageShell>
    </RequireAuth>
  );
}
