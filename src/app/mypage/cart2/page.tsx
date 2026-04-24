'use client';

import { Suspense } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import MypageShell from '@/components/mypage/MypageShell';
import MypageCartClient from '@/components/mypage/MypageCartClient';
import MypageCartCheckoutBanner from '@/components/mypage/MypageCartCheckoutBanner';

export default function MypageCart2Page() {
  return (
    <RequireAuth>
      <MypageShell title="장바구니" subtitle="My page · Cart — 담아 둔 악보를 확인하고 결제를 진행할 수 있습니다.">
        <Suspense fallback={null}>
          <MypageCartCheckoutBanner />
        </Suspense>
        <MypageCartClient />
      </MypageShell>
    </RequireAuth>
  );
}
