import { Suspense } from 'react';
import CustomerCenterShell from '@/components/customer/CustomerCenterShell';
import { CustomerBoardPanel } from '@/components/customer/CustomerBoardPanel';

export const metadata = { title: '자주 묻는 질문 | OnlyOneMusic' };

export default function CustomerFaqPage() {
  return (
    <CustomerCenterShell
      titleKo="자주 묻는 질문 (FAQ)"
      subtitleEn="Customer Center · FAQ"
      activeKey="faq"
    >
      <Suspense fallback={<div className="py-16 text-center text-neutral-500">로딩 중…</div>}>
        <CustomerBoardPanel boardKey="faq" boardPath="faq" />
      </Suspense>
    </CustomerCenterShell>
  );
}
