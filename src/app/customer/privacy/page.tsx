import CustomerCenterShell from '@/components/customer/CustomerCenterShell';
import LegalDocumentBody from '@/components/legal/LegalDocumentBody';

export const metadata = { title: '개인정보취급방침 | OnlyOneMusic' };

/** 본문: termsDoc.htm (레거시 자산, 파일명·제목 불일치 유지) */
export default function CustomerPrivacyPage() {
  return (
    <CustomerCenterShell
      titleKo="개인정보취급방침"
      subtitleEn="Customer Center · Privacy Policy"
      activeKey="privacy"
    >
      <div className="flex justify-center">
        <LegalDocumentBody doc="termsDoc.htm" />
      </div>
    </CustomerCenterShell>
  );
}
