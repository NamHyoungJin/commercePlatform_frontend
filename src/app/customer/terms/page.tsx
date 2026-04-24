import CustomerCenterShell from '@/components/customer/CustomerCenterShell';
import LegalDocumentBody from '@/components/legal/LegalDocumentBody';

export const metadata = { title: '이용약관 | OnlyOneMusic' };

/** 본문: privacyDoc.htm (레거시 자산, 파일명·제목 불일치 유지) */
export default function CustomerTermsPage() {
  return (
    <CustomerCenterShell titleKo="이용약관" subtitleEn="Customer Center · Terms of Service" activeKey="terms">
      <div className="flex justify-center">
        <LegalDocumentBody doc="privacyDoc.htm" />
      </div>
    </CustomerCenterShell>
  );
}
