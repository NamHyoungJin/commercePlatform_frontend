'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import {
  createCustomerQnaPost,
  getCustomerBoardDetail,
  updateCustomerQnaPost,
} from '@/lib/customerBoardApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import { memberOwnsQnaPost } from '@/components/customer/qnaOwnership';

export default function QnaWriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = (searchParams.get('id') || '').trim();

  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const member = useAuthStore((s) => s.member);

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [secret, setSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadPhase, setLoadPhase] = useState<'loading' | 'ready' | 'error'>(() =>
    editId ? 'loading' : 'ready',
  );

  useEffect(() => {
    if (!editId) {
      setLoadPhase('ready');
      setError(null);
      return;
    }
    if (!authReady || !isAuthenticated || !member) return;

    let cancelled = false;
    (async () => {
      setLoadPhase('loading');
      setError(null);
      try {
        const post = await getCustomerBoardDetail('qna', editId);
        if (cancelled) return;
        if (!post) {
          setLoadPhase('error');
          setError('글을 찾을 수 없습니다.');
          return;
        }
        if (!memberOwnsQnaPost(post, member)) {
          setLoadPhase('error');
          setError('수정할 수 있는 권한이 없습니다.');
          return;
        }
        setSubject(post.subject || '');
        setContent(post.content_text ?? '');
        setSecret(post.secret_flag === 'Y');
        setLoadPhase('ready');
      } catch {
        if (!cancelled) {
          setLoadPhase('error');
          setError('불러오지 못했습니다.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId, authReady, isAuthenticated, member]);

  if (!authReady) {
    return <div className="py-12 text-center text-base text-text-muted">세션 확인 중…</div>;
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(
      editId ? `/customer/qna/write?id=${encodeURIComponent(editId)}` : '/customer/qna/write',
    );
    return (
      <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-surface p-8 text-center shadow-sm">
        <p className="text-base text-text-secondary">Q&amp;A 글쓰기·수정은 로그인 후 이용할 수 있습니다.</p>
        <Link
          href={`/login?redirect=${redirect}`}
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc]"
        >
          로그인
        </Link>
      </div>
    );
  }

  if (editId && loadPhase === 'loading') {
    return <div className="py-12 text-center text-base text-text-muted">불러오는 중…</div>;
  }

  if (editId && loadPhase === 'error') {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm text-amber-950">{error || '오류가 발생했습니다.'}</p>
        <Link
          href="/customer/qna"
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc]"
        >
          목록으로
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editId) {
        await updateCustomerQnaPost(editId, { subject, content, secret });
        router.push(`/customer/qna?${new URLSearchParams({ id: editId }).toString()}`);
      } else {
        const { hj_board_sid } = await createCustomerQnaPost({ subject, content, secret });
        router.push(`/customer/qna?${new URLSearchParams({ id: String(hj_board_sid) }).toString()}`);
      }
    } catch (err: unknown) {
      const raw = isAxiosError(err) ? err.response?.data : undefined;
      const msg = raw ? formatApiErrorMessage(raw) : '처리에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelHref = editId ? `/customer/qna?${new URLSearchParams({ id: editId }).toString()}` : '/customer/qna';

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      {editId ? (
        <h2 className="text-lg font-bold text-text-primary">글 수정</h2>
      ) : null}
      {error && loadPhase === 'ready' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{error}</div>
      ) : null}
      <div>
        <label htmlFor="qna-subject" className="mb-1.5 block text-sm font-semibold text-text-primary">
          제목
        </label>
        <input
          id="qna-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={225}
          required
          className="w-full rounded-lg border border-[var(--border-strong)] bg-surface px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:border-[#2ca7e1] focus:outline-none focus:ring-2 focus:ring-[#2ca7e1]/20"
          placeholder="제목을 입력해 주세요"
        />
      </div>
      <div>
        <label htmlFor="qna-content" className="mb-1.5 block text-sm font-semibold text-text-primary">
          내용
        </label>
        <textarea
          id="qna-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          className="w-full resize-y rounded-lg border border-[var(--border-strong)] bg-surface px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:border-[#2ca7e1] focus:outline-none focus:ring-2 focus:ring-[#2ca7e1]/20"
          placeholder="문의 내용을 입력해 주세요"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={secret}
          onChange={(e) => setSecret(e.target.checked)}
          className="rounded border-[var(--border-strong)] text-[#2ca7e1] focus:ring-[#2ca7e1]/30"
        />
        비밀글로 등록
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '처리 중…' : editId ? '수정하기' : '등록하기'}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-surface px-5 py-2.5 text-base font-semibold text-text-secondary transition-colors hover:bg-surface-muted"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
