'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import MypageShell from '@/components/mypage/MypageShell';
import MypageWishClient from '@/components/mypage/MypageWishClient';

export default function MypageWishPage() {
  return (
    <RequireAuth>
      <MypageShell title="보관함" subtitle="My page · Wish — 관심 악보를 모아 두는 공간입니다. 장바구니로 옮겨 구매를 준비할 수 있습니다.">
        <MypageWishClient />
      </MypageShell>
    </RequireAuth>
  );
}
