'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MODAL_CONTENT_BG, MODAL_TITLE_BAR, modalTitleHeadingClass } from '@/components/modals/modalTitleBar';

const PROFILE_MODIFY_PATH = '/membership/member/modify';

function safeRedirectPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ member_id: '', password: '' });
  const [identityModalOpen, setIdentityModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(form);
    if (!result.success) return;
    if ('identityVerificationWarning' in result && result.identityVerificationWarning) {
      setIdentityModalOpen(true);
      return;
    }
    const next = safeRedirectPath(searchParams.get('redirect'));
    router.push(next || '/');
  };

  const goProfileModify = () => {
    setIdentityModalOpen(false);
    router.push(PROFILE_MODIFY_PATH);
  };

  const goHomeFromModal = () => {
    setIdentityModalOpen(false);
    router.push('/');
  };

  const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500/35';

  return (
    <>
      {identityModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={goHomeFromModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="identity-modal-title"
            className={`max-w-md overflow-hidden rounded-2xl border border-neutral-200 shadow-xl ${MODAL_CONTENT_BG}`}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className={`px-6 py-4 ${MODAL_TITLE_BAR}`}>
              <h3 id="identity-modal-title" className={`text-lg ${modalTitleHeadingClass}`}>
                본인 인증이 필요합니다
              </h3>
            </div>
            <div className={`p-6 ${MODAL_CONTENT_BG}`}>
            <p className="text-sm leading-relaxed text-neutral-600">
              등록된 이메일·휴대폰 본인 인증이 아직 없습니다. 비밀번호 찾기 등 일부 서비스를 이용하려면 회원정보 수정에서
              인증을 완료해 주세요.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                onClick={goProfileModify}
                className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
              >
                회원정보 수정으로 이동
              </button>
              <button
                type="button"
                onClick={goHomeFromModal}
                className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                나중에 (홈으로)
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <h2 className="text-center text-2xl font-bold text-neutral-900">로그인</h2>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="member_id" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          아이디
        </label>
        <input
          id="member_id"
          name="member_id"
          type="text"
          autoComplete="username"
          required
          value={form.member_id}
          onChange={handleChange}
          className={inputClass}
          placeholder="아이디를 입력하세요"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={handleChange}
          className={inputClass}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-teal-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/membership/member/idpw" className="font-medium text-teal-600 hover:text-teal-500 hover:underline">
          아이디 / 비밀번호 찾기
        </Link>
      </p>

      <p className="text-center text-sm text-neutral-600">
        계정이 없으신가요?{' '}
        <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-500 hover:underline">
          회원가입
        </Link>
      </p>
    </form>
    </>
  );
}
