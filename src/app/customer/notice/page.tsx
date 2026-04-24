import { Suspense } from 'react';
import CustomerCenterShell from '@/components/customer/CustomerCenterShell';
import { CustomerBoardPanel } from '@/components/customer/CustomerBoardPanel';

export const metadata = { title: '공지사항 | OnlyOneMusic' };

export default function CustomerNoticePage() {
  return (
    <CustomerCenterShell titleKo="공지사항" subtitleEn="Customer Center · Notice" activeKey="notice">
      <Suspense fallback={<div className="py-16 text-center text-neutral-500">로딩 중…</div>}>
        <CustomerBoardPanel boardKey="notice" boardPath="notice" />
      </Suspense>
    </CustomerCenterShell>
  );
}
