'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';

export default function ProfileModifyForm() {
  const setMember = useAuthStore((s) => s.setMember);
  const storeMemberId = useAuthStore((s) => s.member?.member_id ?? '');

  const confirmedPasswordRef = useRef<string | null>(null);
  const [editUnlocked, setEditUnlocked] = useState(false);

  const [gatePassword, setGatePassword] = useState('');
  const [checkingGate, setCheckingGate] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    phone: '',
    email: '',
    email_receive: false,
    sms_receive: false,
    new_password: '',
    new_password_confirm: '',
  });
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadedSnapshotRef = useRef({ phone: '', email: '' });
  const [idVerifiedPhone, setIdVerifiedPhone] = useState(false);
  const [idVerifiedEmail, setIdVerifiedEmail] = useState(false);

  const [phoneProofToken, setPhoneProofToken] = useState<string | null>(null);
  const [emailProofToken, setEmailProofToken] = useState<string | null>(null);
  const [phoneAuthCode, setPhoneAuthCode] = useState('');
  const [emailAuthCode, setEmailAuthCode] = useState('');
  const [phoneSendLoading, setPhoneSendLoading] = useState(false);
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [phoneConfirmLoading, setPhoneConfirmLoading] = useState(false);
  const [emailConfirmLoading, setEmailConfirmLoading] = useState(false);
  const [phoneVerifyMsg, setPhoneVerifyMsg] = useState<string | null>(null);
  const [phoneVerifyErr, setPhoneVerifyErr] = useState(false);
  const [emailVerifyMsg, setEmailVerifyMsg] = useState<string | null>(null);
  const [emailVerifyErr, setEmailVerifyErr] = useState(false);

  useEffect(() => {
    if (!editUnlocked) return;
    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const { data } = await authApi.me();
        if (cancelled) return;
        setMemberId(data.member_id);
        loadedSnapshotRef.current = {
          phone: (data.phone || '').trim(),
          email: (data.email || '').trim().toLowerCase(),
        };
        setIdVerifiedPhone(Boolean(data.id_verified_phone));
        setIdVerifiedEmail(Boolean(data.id_verified_email));
        setPhoneProofToken(null);
        setEmailProofToken(null);
        setPhoneAuthCode('');
        setEmailAuthCode('');
        setPhoneVerifyMsg(null);
        setEmailVerifyMsg(null);
        setForm((f) => ({
          ...f,
          name: data.name || '',
          nickname: data.nickname || '',
          phone: data.phone || '',
          email: data.email || '',
          email_receive: Boolean(data.email_receive),
          sms_receive: Boolean(data.sms_receive),
        }));
      } catch (e) {
        if (!cancelled) setError(axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '정보를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editUnlocked]);

  const inputClass =
    'w-full rounded-lg border border-[var(--border-strong)] bg-surface-muted px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:border-[#2ca7e1] focus:bg-[#fff] focus:outline-none focus:ring-2 focus:ring-[#2ca7e1]/20 sm:text-base';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      setError(null);
      setSuccess(null);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setPhoneProofToken(null);
      setPhoneAuthCode('');
      setPhoneVerifyMsg(null);
      setPhoneVerifyErr(false);
    }
    if (name === 'email') {
      setEmailProofToken(null);
      setEmailAuthCode('');
      setEmailVerifyMsg(null);
      setEmailVerifyErr(false);
    }
    setError(null);
    setSuccess(null);
  };

  const errMsg = (err: unknown): string => {
    const raw = axios.isAxiosError(err) ? err.response?.data : (err as { response?: { data?: unknown } }).response?.data;
    if (raw == null) return '요청을 처리하지 못했습니다.';
    return formatApiErrorMessage(raw);
  };

  const phoneMatchesLoaded =
    loadedSnapshotRef.current.phone.length > 0 && form.phone.trim() === loadedSnapshotRef.current.phone;
  const emailMatchesLoaded =
    loadedSnapshotRef.current.email.length > 0 &&
    form.email.trim().toLowerCase() === loadedSnapshotRef.current.email;

  const handleSendPhoneVerify = async () => {
    setPhoneVerifyMsg(null);
    setPhoneVerifyErr(false);
    const t = form.phone.trim();
    if (!t) {
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg('휴대폰 번호를 입력해 주세요.');
      return;
    }
    setPhoneSendLoading(true);
    try {
      if (phoneMatchesLoaded) {
        await authApi.meIdentityVerifySend({ channel: 'phone', target: t });
      } else {
        await authApi.sendRegisterVerification({ channel: 'phone', target: t });
      }
      setPhoneVerifyErr(false);
      setPhoneVerifyMsg('인증번호가 발송되었습니다.');
    } catch (err) {
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg(errMsg(err));
    } finally {
      setPhoneSendLoading(false);
    }
  };

  const handleConfirmPhoneVerify = async () => {
    setPhoneVerifyMsg(null);
    setPhoneVerifyErr(false);
    const t = form.phone.trim();
    if (!t) {
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg('휴대폰 번호를 입력해 주세요.');
      return;
    }
    setPhoneConfirmLoading(true);
    try {
      if (phoneMatchesLoaded) {
        const { data } = await authApi.meIdentityVerifyConfirm({
          channel: 'phone',
          target: t,
          code: phoneAuthCode.trim(),
        });
        setPhoneProofToken(data.proof_token);
      } else {
        const { data } = await authApi.confirmRegisterVerification({
          channel: 'phone',
          target: t,
          code: phoneAuthCode.trim(),
        });
        setPhoneProofToken(data.proof_token);
      }
      setPhoneVerifyErr(false);
      setPhoneVerifyMsg('휴대폰 인증이 완료되었습니다. 저장 시 반영됩니다.');
    } catch (err) {
      setPhoneProofToken(null);
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg(errMsg(err));
    } finally {
      setPhoneConfirmLoading(false);
    }
  };

  const handleSendEmailVerify = async () => {
    setEmailVerifyMsg(null);
    setEmailVerifyErr(false);
    const t = form.email.trim();
    if (!t) {
      setEmailVerifyErr(true);
      setEmailVerifyMsg('이메일을 입력해 주세요.');
      return;
    }
    setEmailSendLoading(true);
    try {
      if (emailMatchesLoaded) {
        await authApi.meIdentityVerifySend({ channel: 'email', target: t });
      } else {
        await authApi.sendRegisterVerification({ channel: 'email', target: t });
      }
      setEmailVerifyErr(false);
      setEmailVerifyMsg('인증번호가 발송되었습니다.');
    } catch (err) {
      setEmailVerifyErr(true);
      setEmailVerifyMsg(errMsg(err));
    } finally {
      setEmailSendLoading(false);
    }
  };

  const handleConfirmEmailVerify = async () => {
    setEmailVerifyMsg(null);
    setEmailVerifyErr(false);
    const t = form.email.trim();
    if (!t) {
      setEmailVerifyErr(true);
      setEmailVerifyMsg('이메일을 입력해 주세요.');
      return;
    }
    setEmailConfirmLoading(true);
    try {
      if (emailMatchesLoaded) {
        const { data } = await authApi.meIdentityVerifyConfirm({
          channel: 'email',
          target: t,
          code: emailAuthCode.trim(),
        });
        setEmailProofToken(data.proof_token);
      } else {
        const { data } = await authApi.confirmRegisterVerification({
          channel: 'email',
          target: t,
          code: emailAuthCode.trim(),
        });
        setEmailProofToken(data.proof_token);
      }
      setEmailVerifyErr(false);
      setEmailVerifyMsg('이메일 인증이 완료되었습니다. 저장 시 반영됩니다.');
    } catch (err) {
      setEmailProofToken(null);
      setEmailVerifyErr(true);
      setEmailVerifyMsg(errMsg(err));
    } finally {
      setEmailConfirmLoading(false);
    }
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const pwd = gatePassword.trim();
    if (!pwd) {
      setGateError('비밀번호를 입력해 주세요.');
      return;
    }
    setCheckingGate(true);
    try {
      await authApi.verifyMePassword({ password: pwd });
      confirmedPasswordRef.current = pwd;
      setGatePassword('');
      setEditUnlocked(true);
    } catch (err) {
      const raw = axios.isAxiosError(err) ? err.response?.data : undefined;
      setGateError(raw ? formatApiErrorMessage(raw) : '비밀번호 확인에 실패했습니다.');
    } finally {
      setCheckingGate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = confirmedPasswordRef.current;
    if (!current) {
      setError('본인 확인이 필요합니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
      return;
    }
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const { data } = await authApi.patchMe({
        current_password: current,
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        email_receive: form.email_receive,
        sms_receive: form.sms_receive,
        phone_verify_token: phoneProofToken || undefined,
        email_verify_token: emailProofToken || undefined,
        new_password: form.new_password.trim() || undefined,
        new_password_confirm: form.new_password_confirm.trim() || undefined,
      });
      setMember(data);
      loadedSnapshotRef.current = {
        phone: (data.phone || '').trim(),
        email: (data.email || '').trim().toLowerCase(),
      };
      setIdVerifiedPhone(Boolean(data.id_verified_phone));
      setIdVerifiedEmail(Boolean(data.id_verified_email));
      setPhoneProofToken(null);
      setEmailProofToken(null);
      setPhoneAuthCode('');
      setEmailAuthCode('');
      setPhoneVerifyMsg(null);
      setEmailVerifyMsg(null);
      const np = form.new_password.trim();
      if (np) {
        confirmedPasswordRef.current = np;
      }
      setForm((f) => ({
        ...f,
        new_password: '',
        new_password_confirm: '',
      }));
      setSuccess('회원정보가 저장되었습니다.');
    } catch (err) {
      const raw = axios.isAxiosError(err) ? err.response?.data : undefined;
      setError(raw ? formatApiErrorMessage(raw) : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!editUnlocked) {
    return (
      <form onSubmit={handleGateSubmit} className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-text-primary">회원정보 수정</h2>
          <p className="mt-1 text-base text-text-secondary">
            본인 확인을 위해 로그인 비밀번호를 입력해 주세요. 확인 후 수정 화면으로 이동합니다.
          </p>
        </div>

        {gateError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-800" role="alert">
            {gateError}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-text-muted">아이디</label>
          <input
            type="text"
            readOnly
            value={storeMemberId || '…'}
            className={`${inputClass} bg-surface-muted text-text-muted`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="gate_password" className="text-xs font-medium uppercase tracking-wide text-text-muted">
            비밀번호 <span className="text-red-600">*</span>
          </label>
          <input
            id="gate_password"
            type="password"
            autoComplete="current-password"
            value={gatePassword}
            onChange={(e) => {
              setGatePassword(e.target.value);
              setGateError(null);
            }}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={checkingGate}
          className="rounded-full bg-[#2ca7e1] py-3 text-base font-semibold text-white hover:bg-[#2496cc] disabled:opacity-50"
        >
          {checkingGate ? '확인 중…' : '확인 후 수정하기'}
        </button>
      </form>
    );
  }

  if (loadingProfile) {
    return <p className="text-base text-text-muted">회원 정보를 불러오는 중…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">회원정보 수정</h2>
        <p className="mt-1 text-base text-text-secondary">
          이름·닉네임·연락처·수신 동의를 수정할 수 있습니다. 비밀번호를 변경하려면 아래에서 입력하세요.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-800" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-base text-emerald-900">{success}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-text-muted">아이디</label>
        <input type="text" readOnly value={memberId} className={`${inputClass} text-text-muted`} />
      </div>

      <div className="rounded-xl border border-[var(--border-strong)] bg-surface-muted p-4">
        <p className="mb-3 text-base font-medium text-text-primary">비밀번호 변경 (선택)</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new_password" className="text-xs font-medium text-text-muted">
              새 비밀번호
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              value={form.new_password}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new_password_confirm" className="text-xs font-medium text-text-muted">
              새 비밀번호 확인
            </label>
            <input
              id="new_password_confirm"
              name="new_password_confirm"
              type="password"
              autoComplete="new-password"
              value={form.new_password_confirm}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <p className="text-xs text-text-muted">8자 이상, 영문·숫자를 각각 포함해야 합니다. 변경하지 않으면 비워 두세요.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          이름 <span className="text-red-600">*</span>
        </label>
        <input id="name" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nickname" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          닉네임 <span className="text-red-600">*</span>
        </label>
        <input id="nickname" name="nickname" required value={form.nickname} onChange={handleChange} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          휴대폰
        </label>
        <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} />
        <p className="text-xs text-text-muted">
          비워 두면 휴대폰 번호를 삭제합니다. 번호를 바꾸거나 새로 넣을 때는 아래 인증 후 저장해야 합니다. DB에 저장된 번호와
          동일하면 &quot;마이페이지 본인인증&quot;으로 발송됩니다.
        </p>
        {idVerifiedPhone ? (
          <p className="text-xs font-medium text-emerald-700">휴대폰 본인 인증 완료</p>
        ) : (
          <p className="text-xs text-amber-800">휴대폰 본인 인증 미완료 — 아래에서 인증할 수 있습니다.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          이메일 <span className="text-red-600">*</span>
        </label>
        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
        {idVerifiedEmail ? (
          <p className="text-xs font-medium text-emerald-700">이메일 본인 인증 완료</p>
        ) : (
          <p className="text-xs text-amber-800">이메일 본인 인증 미완료 — 아래에서 인증할 수 있습니다.</p>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border-strong)] bg-surface-muted p-4">
        <p className="mb-2 text-sm font-medium text-text-primary">연락처 본인 인증</p>
        <p className="mb-4 text-xs text-text-muted">
          비밀번호 찾기 등은 본인 인증이 완료된 연락처로만 진행됩니다. 번호·이메일을 바꿀 때도 인증이 필요합니다. 저장하기 전에
          인증을 완료해 주세요.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <p className="text-xs font-medium text-text-muted">휴대폰 인증</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSendPhoneVerify()}
                disabled={phoneSendLoading}
                className="rounded-lg border border-[var(--border-strong)] bg-surface px-3 py-2 text-sm text-text-primary hover:bg-surface-muted disabled:opacity-50"
              >
                {phoneSendLoading ? '발송 중…' : '인증번호 받기'}
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <input
                value={phoneAuthCode}
                onChange={(e) => setPhoneAuthCode(e.target.value)}
                className={`${inputClass} max-w-[10rem]`}
                placeholder="인증번호 6자리"
                maxLength={6}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => void handleConfirmPhoneVerify()}
                disabled={phoneConfirmLoading}
                className="rounded-lg bg-[#2ca7e1] px-4 py-2 text-sm font-medium text-white hover:bg-[#2496cc] disabled:opacity-50"
              >
                {phoneConfirmLoading ? '확인 중…' : '인증 확인'}
              </button>
            </div>
            {phoneProofToken && <p className="text-xs font-medium text-emerald-700">휴대폰 인증 토큰 준비됨 (저장 시 적용)</p>}
            {phoneVerifyMsg && (
              <p className={`text-xs ${phoneVerifyErr ? 'text-red-600' : 'text-text-muted'}`} role={phoneVerifyErr ? 'alert' : undefined}>
                {phoneVerifyMsg}
              </p>
            )}
          </div>
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <p className="text-xs font-medium text-text-muted">이메일 인증</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSendEmailVerify()}
                disabled={emailSendLoading}
                className="rounded-lg border border-[var(--border-strong)] bg-surface px-3 py-2 text-sm text-text-primary hover:bg-surface-muted disabled:opacity-50"
              >
                {emailSendLoading ? '발송 중…' : '인증번호 받기'}
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <input
                value={emailAuthCode}
                onChange={(e) => setEmailAuthCode(e.target.value)}
                className={`${inputClass} max-w-[10rem]`}
                placeholder="인증번호 6자리"
                maxLength={6}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => void handleConfirmEmailVerify()}
                disabled={emailConfirmLoading}
                className="rounded-lg bg-[#2ca7e1] px-4 py-2 text-sm font-medium text-white hover:bg-[#2496cc] disabled:opacity-50"
              >
                {emailConfirmLoading ? '확인 중…' : '인증 확인'}
              </button>
            </div>
            {emailProofToken && <p className="text-xs font-medium text-emerald-700">이메일 인증 토큰 준비됨 (저장 시 적용)</p>}
            {emailVerifyMsg && (
              <p className={`text-xs ${emailVerifyErr ? 'text-red-600' : 'text-text-muted'}`} role={emailVerifyErr ? 'alert' : undefined}>
                {emailVerifyMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">수신동의</span>
        <div className={`${inputClass} flex flex-wrap items-center gap-6`} role="group" aria-label="수신동의">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              name="email_receive"
              checked={form.email_receive}
              onChange={handleChange}
              className="size-4 shrink-0 rounded border-[var(--border-strong)] bg-surface text-[#2ca7e1] accent-[#2ca7e1]"
            />
            E-mail
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              name="sms_receive"
              checked={form.sms_receive}
              onChange={handleChange}
              className="size-4 shrink-0 rounded border-[var(--border-strong)] bg-surface text-[#2ca7e1] accent-[#2ca7e1]"
            />
            SMS
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-[#2ca7e1] py-3 text-base font-semibold text-white hover:bg-[#2496cc] disabled:opacity-50"
      >
        {saving ? '저장 중…' : '수정하기'}
      </button>

      <div className="border-t border-[var(--border-strong)] pt-6">
        <p className="mb-3 text-xs text-text-muted">더 이상 서비스를 이용하지 않으시면 회원 탈퇴를 진행할 수 있습니다.</p>
        <Link
          href="/membership/member/withdrawal"
          className="block w-full rounded-full border border-red-200 bg-transparent py-3 text-center text-base font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          회원탈퇴
        </Link>
      </div>
    </form>
  );
}
