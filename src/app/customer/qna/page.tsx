import { Suspense } from 'react';
import CustomerCenterShell from '@/components/customer/CustomerCenterShell';
import { CustomerBoardPanel } from '@/components/customer/CustomerBoardPanel';

export const metadata = { title: '묻고 답하기 | OnlyOneMusic' };

export default function CustomerQnaPage() {
  return (
    <CustomerCenterShell
      titleKo="묻고 답하기 (Q&A)"
      subtitleEn="Customer Center · Q&A"
      activeKey="qna"
    >
      <Suspense fallback={<div className="py-16 text-center text-neutral-500">로딩 중…</div>}>
        <CustomerBoardPanel boardKey="qna" boardPath="qna" />
      </Suspense>
    </CustomerCenterShell>
  );
}
