'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';

export default function WithdrawalForm() {
  const router = useRouter();
  const member = useAuthStore((s) => s.member);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    'w-full rounded-lg border border-[var(--border-strong)] bg-surface-muted px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-[#2ca7e1] focus:outline-none focus:ring-2 focus:ring-[#2ca7e1]/20';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.withdraw({ password, reason: reason.trim() });
      clearAuth();
      router.replace('/?withdrawn=1');
    } catch (err) {
      const raw = axios.isAxiosError(err) ? err.response?.data : undefined;
      setError(raw ? formatApiErrorMessage(raw) : '탈퇴 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">회원 탈퇴</h2>
        <div className="mt-3 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <p>
            회원 탈퇴가 완료되면, 회원님의 개인정보(이름, 연락처, 이메일 등)와 악보 구매 내역을 포함한 모든 이용 정보는{' '}
            <strong className="font-semibold text-amber-950">즉시 삭제 처리</strong>되며,{' '}
            <strong className="font-semibold text-amber-950">삭제된 데이터는 어떠한 경우에도 복구가 불가능</strong>합니다.
          </p>
          <p>
            또한 서비스 이용 과정에서 생성된{' '}
            <strong className="font-semibold text-amber-950">주문/결제 정보, 이용 기록, 관심/저장 데이터</strong> 등 회원 계정에
            귀속된 모든 정보 역시 <strong className="font-semibold text-amber-950">함께 삭제</strong>됩니다.
          </p>
          <p>
            단, 관련 법령(전자상거래법, 소비자 보호법 등)에 따라 일정 기간 보관이 필요한 일부 거래 기록은{' '}
            <strong className="font-semibold text-amber-950">법적 의무에 따라 별도로 안전하게 보관</strong>되며, 해당 기간이
            종료되면 <strong className="font-semibold text-amber-950">지체 없이 파기</strong>됩니다.
          </p>
          <p>
            탈퇴 후에는 <strong className="font-semibold text-amber-950">동일한 계정으로 재사용이 불가능</strong>하므로, 서비스
            이용을 원하실 경우 <strong className="font-semibold text-amber-950">신규 가입</strong>을 통해 다시 이용해 주셔야
            합니다.
          </p>
          <p>
            그동안 서비스를 이용해 주셔서 <strong className="font-semibold text-amber-950">진심으로 감사</strong>드리며, 보다 나은
            서비스로 다시 만나 뵙기를 바랍니다.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-text-muted">이름</label>
        <input type="text" readOnly value={member?.name || ''} className={`${inputClass} text-text-muted`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-text-muted">아이디</label>
        <input type="text" readOnly value={member?.member_id || ''} className={`${inputClass} text-text-muted`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wd_password" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          비밀번호 확인 <span className="text-red-600">*</span>
        </label>
        <input
          id="wd_password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wd_reason" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          탈퇴 사유 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="wd_reason"
          required
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={inputClass}
          placeholder="탈퇴 사유를 입력해 주세요."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-red-700 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? '처리 중…' : '탈퇴 신청'}
      </button>
    </form>
  );
}
