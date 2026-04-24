import type { CustomerBoardDetail } from '@/lib/customerBoardApi';

export type MemberLike = { member_sid: string; member_id: string };

export function memberOwnsQnaPost(post: CustomerBoardDetail, member: MemberLike | null): boolean {
  if (!member) return false;
  const ws = (post.write_sid || '').trim();
  if (ws && ws === (member.member_sid || '').trim()) return true;
  const wi = (post.write_id || '').trim();
  if (wi && wi === (member.member_id || '').trim()) return true;
  return false;
}
