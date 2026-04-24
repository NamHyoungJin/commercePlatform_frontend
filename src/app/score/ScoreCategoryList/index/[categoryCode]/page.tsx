import { redirect } from 'next/navigation';
import { SCORE_CATEGORY_CODES } from '@/lib/scoreCategories';

type PageProps = { params: Promise<{ categoryCode: string }> };

/** 정적 export: 구 `/index/{code}` URL은 쿼리 형태로 통일 */
export function generateStaticParams() {
  return SCORE_CATEGORY_CODES.map((categoryCode) => ({ categoryCode }));
}

export default async function LegacyScoreCategoryIndexRedirect({ params }: PageProps) {
  const { categoryCode } = await params;
  redirect(`/score/ScoreCategoryList?code=${encodeURIComponent(categoryCode)}`);
}
