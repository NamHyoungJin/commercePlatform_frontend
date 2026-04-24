import { loadLegalHtml } from '@/lib/loadLegalHtml';

export type LegalDocFile = 'privacyDoc.htm' | 'termsDoc.htm';

/** 본문 타이포·여백은 `globals.css`의 `.legal-doc`에서 통일 */
const ARTICLE_CLASS = 'legal-doc mx-auto w-full max-w-4xl text-left text-base';

/** 히어로 없이 본문만 (고객센터 셸 안 등) */
export default function LegalDocumentBody({ doc }: { doc: LegalDocFile }) {
  const html = loadLegalHtml(doc);
  return <article className={ARTICLE_CLASS} dangerouslySetInnerHTML={{ __html: html }} />;
}
