import { Suspense } from 'react';
import CustomerCenterShell from '@/components/customer/CustomerCenterShell';
import QnaWriteClient from '@/components/customer/QnaWriteClient';

export const metadata = { title: 'Q&A 글쓰기 | OnlyOneMusic' };

export default function CustomerQnaWritePage() {
  return (
    <CustomerCenterShell
      titleKo="Q&A 글쓰기"
      subtitleEn="Customer Center · Q&A · Write"
      activeKey="qna"
    >
      <Suspense fallback={<div className="py-12 text-center text-text-muted">로딩 중…</div>}>
        <QnaWriteClient />
      </Suspense>
    </CustomerCenterShell>
  );
}
