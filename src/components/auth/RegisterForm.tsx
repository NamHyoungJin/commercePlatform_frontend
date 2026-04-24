'use client';

import { useState } from 'react';
import Link from '@/components/AppLink';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/authApi';
import axios from 'axios';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';

export default function RegisterForm() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({
    member_id: '',
    password: '',
    password_confirm: '',
    name: '',
    nickname: '',
    phone: '',
    email: '',
    email_receive: false,
    sms_receive: false,
  });
  const [phoneAuthCode, setPhoneAuthCode] = useState('');
  const [emailAuthCode, setEmailAuthCode] = useState('');
  const [phoneProofToken, setPhoneProofToken] = useState<string | null>(null);
  const [emailProofToken, setEmailProofToken] = useState<string | null>(null);
  const [phoneSendLoading, setPhoneSendLoading] = useState(false);
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [phoneConfirmLoading, setPhoneConfirmLoading] = useState(false);
  const [emailConfirmLoading, setEmailConfirmLoading] = useState(false);
  const [phoneVerifyMsg, setPhoneVerifyMsg] = useState<string | null>(null);
  const [phoneVerifyErr, setPhoneVerifyErr] = useState(false);
  const [emailVerifyMsg, setEmailVerifyMsg] = useState<string | null>(null);
  const [emailVerifyErr, setEmailVerifyErr] = useState(false);

  const [success, setSuccess] = useState(false);
  const [verifiedMemberId, setVerifiedMemberId] = useState<string | null>(null);
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [idCheckOk, setIdCheckOk] = useState<string | null>(null);
  const [idCheckError, setIdCheckError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      setLocalError(null);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'member_id') {
      setVerifiedMemberId((vid) => (value.trim() === vid ? vid : null));
      setIdCheckOk(null);
      setIdCheckError(null);
      setLocalError(null);
    }
    if (name === 'password' || name === 'password_confirm') {
      setLocalError(null);
    }
    if (name === 'phone') {
      setPhoneProofToken(null);
      setPhoneVerifyMsg(null);
      setPhoneVerifyErr(false);
    }
    if (name === 'email') {
      setEmailProofToken(null);
      setEmailVerifyMsg(null);
      setEmailVerifyErr(false);
    }
  };

  const errMsg = (err: unknown): string => {
    const raw = axios.isAxiosError(err) ? err.response?.data : (err as { response?: { data?: unknown } }).response?.data;
    if (raw == null) {
      if (axios.isAxiosError(err) && err.message) return err.message;
      return '요청을 처리하지 못했습니다.';
    }
    return formatApiErrorMessage(raw);
  };

  const handleSendPhoneCode = async () => {
    setPhoneVerifyMsg(null);
    setPhoneVerifyErr(false);
    if (!form.phone.trim()) {
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg('휴대폰 번호를 입력해 주세요.');
      return;
    }
    setPhoneSendLoading(true);
    try {
      await authApi.sendRegisterVerification({ channel: 'phone', target: form.phone.trim() });
      setPhoneVerifyErr(false);
      setPhoneVerifyMsg('인증번호가 발송되었습니다. 문자를 확인해 주세요.');
    } catch (err) {
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg(errMsg(err));
    } finally {
      setPhoneSendLoading(false);
    }
  };

  const handleConfirmPhoneCode = async () => {
    setPhoneVerifyMsg(null);
    setPhoneVerifyErr(false);
    setPhoneConfirmLoading(true);
    try {
      const { data } = await authApi.confirmRegisterVerification({
        channel: 'phone',
        target: form.phone.trim(),
        code: phoneAuthCode.trim(),
      });
      setPhoneProofToken(data.proof_token);
      setPhoneVerifyErr(false);
      setPhoneVerifyMsg('휴대폰 인증이 완료되었습니다.');
    } catch (err) {
      setPhoneProofToken(null);
      setPhoneVerifyErr(true);
      setPhoneVerifyMsg(errMsg(err));
    } finally {
      setPhoneConfirmLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    setEmailVerifyMsg(null);
    setEmailVerifyErr(false);
    if (!form.email.trim()) {
      setEmailVerifyErr(true);
      setEmailVerifyMsg('이메일을 입력해 주세요.');
      return;
    }
    setEmailSendLoading(true);
    try {
      await authApi.sendRegisterVerification({ channel: 'email', target: form.email.trim() });
      setEmailVerifyErr(false);
      setEmailVerifyMsg('인증 메일을 발송했습니다. 메일함을 확인해 주세요.');
    } catch (err) {
      setEmailVerifyErr(true);
      setEmailVerifyMsg(errMsg(err));
    } finally {
      setEmailSendLoading(false);
    }
  };

  const handleConfirmEmailCode = async () => {
    setEmailVerifyMsg(null);
    setEmailVerifyErr(false);
    setEmailConfirmLoading(true);
    try {
      const { data } = await authApi.confirmRegisterVerification({
        channel: 'email',
        target: form.email.trim(),
        code: emailAuthCode.trim(),
      });
      setEmailProofToken(data.proof_token);
      setEmailVerifyErr(false);
      setEmailVerifyMsg('이메일 인증이 완료되었습니다.');
    } catch (err) {
      setEmailProofToken(null);
      setEmailVerifyErr(true);
      setEmailVerifyMsg(errMsg(err));
    } finally {
      setEmailConfirmLoading(false);
    }
  };

  const handleCheckId = async () => {
    setIdCheckOk(null);
    setIdCheckError(null);
    const id = form.member_id.trim();
    if (!id) {
      setIdCheckError('아이디를 입력해 주세요.');
      return;
    }
    setIdCheckLoading(true);
    try {
      const { data } = await authApi.checkMemberId(id);
      if (data.available) {
        setVerifiedMemberId(id);
        setIdCheckOk('사용 가능한 아이디입니다.');
        setLocalError(null);
      } else {
        setVerifiedMemberId(null);
        setIdCheckError('이미 사용 중인 아이디입니다.');
      }
    } catch (err: unknown) {
      setVerifiedMemberId(null);
      const ax = err as { response?: { data?: { member_id?: string[] } } };
      const m = ax.response?.data?.member_id;
      const msg = Array.isArray(m) ? m[0] : '아이디를 확인할 수 없습니다.';
      setIdCheckError(String(msg));
    } finally {
      setIdCheckLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const id = form.member_id.trim();
    if (id !== verifiedMemberId) {
      setLocalError('아이디 중복 확인을 완료해 주세요.');
      return;
    }
    if (!form.phone.trim()) {
      setLocalError('휴대폰 번호를 입력해 주세요.');
      return;
    }
    if (!form.email.trim()) {
      setLocalError('이메일을 입력해 주세요.');
      return;
    }
    if (!phoneProofToken && !emailProofToken) {
      setLocalError('휴대폰 또는 이메일 인증 중 최소 한 가지는 완료해 주세요.');
      return;
    }

    const result = await register({
      member_id: id,
      password: form.password,
      password_confirm: form.password_confirm,
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      phone_verify_token: phoneProofToken ?? '',
      email_verify_token: emailProofToken ?? '',
      email_receive: form.email_receive,
      sms_receive: form.sms_receive,
    });
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500/35';

  if (success) {
    return (
      <div className="p-6 text-center">
        <p className="font-medium text-emerald-700">회원가입이 완료되었습니다!</p>
        <p className="mt-2 text-sm text-neutral-600">로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <h1 className="text-center text-2xl font-bold text-neutral-900">회원가입</h1>

      {(error || localError) && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {localError || error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="member_id" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          아이디 <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="member_id"
            name="member_id"
            type="text"
            autoComplete="username"
            required
            value={form.member_id}
            onChange={handleChange}
            className={`${inputClass} min-w-0 flex-1`}
            placeholder="예: onlyone12"
          />
          <button
            type="button"
            onClick={handleCheckId}
            disabled={idCheckLoading}
            className="shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            {idCheckLoading ? '확인 중…' : '중복확인'}
          </button>
        </div>
        {idCheckOk && <p className="text-xs font-medium text-emerald-700">{idCheckOk}</p>}
        {idCheckError && <p className="text-xs text-red-600">{idCheckError}</p>}
        <p className="text-xs leading-relaxed text-neutral-600">
          4~20자, 영문으로 시작한 뒤 영문·숫자만 사용할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          비밀번호 <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
          className={inputClass}
        />
        <p className="text-xs leading-relaxed text-neutral-600">
          8자 이상, 영문과 숫자를 각각 1자 이상 포함해야 합니다.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password_confirm" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          비밀번호 확인 <span className="text-red-600">*</span>
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          value={form.password_confirm}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          이름 <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nickname" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          닉네임 <span className="text-red-600">*</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          autoComplete="nickname"
          required
          value={form.nickname}
          onChange={handleChange}
          className={inputClass}
          placeholder="2~20자"
        />
        <p className="text-xs leading-relaxed text-neutral-600">2~20자, 커뮤니티 등에 표시되는 이름입니다.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">
            연락처 <span className="text-red-600">*</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
            휴대폰과 이메일은 모두 입력해야 하며, 아래 인증 중 <strong className="font-medium text-neutral-800">최소 한 가지</strong>는
            반드시 완료해야 가입할 수 있습니다. 둘 다 인증하면 두 연락처 모두 본인 확인된 것으로 저장됩니다.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
            휴대폰 번호 <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="01012345678 또는 +8210…"
          />
          <p className="text-xs text-neutral-600">국내 010… 형식과 국제 +82 10… 형식 모두 입력할 수 있습니다.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-neutral-600">
            이메일 <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="example@email.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">수신동의</span>
          <div className={`${inputClass} flex flex-wrap items-center gap-6`} role="group" aria-label="수신동의">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="email_receive"
                checked={form.email_receive}
                onChange={handleChange}
                className="size-4 shrink-0 rounded border-neutral-300 bg-white text-teal-600 accent-teal-600"
              />
              E-mail
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="sms_receive"
                checked={form.sms_receive}
                onChange={handleChange}
                className="size-4 shrink-0 rounded border-neutral-300 bg-white text-teal-600 accent-teal-600"
              />
              SMS
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">휴대폰 본인 확인</p>
          <p className="text-xs text-neutral-600">위에 입력한 휴대폰 번호로 인증번호가 발송됩니다.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSendPhoneCode}
              disabled={phoneSendLoading}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
            >
              {phoneSendLoading ? '발송 중…' : '인증번호 받기'}
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[8rem] flex-1">
              <label htmlFor="phone_auth_code" className="sr-only">
                휴대폰 인증번호
              </label>
              <input
                id="phone_auth_code"
                value={phoneAuthCode}
                onChange={(e) => setPhoneAuthCode(e.target.value)}
                className={inputClass}
                placeholder="인증번호 6자리"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleConfirmPhoneCode()}
              disabled={phoneConfirmLoading}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {phoneConfirmLoading ? '확인 중…' : '인증 확인'}
            </button>
          </div>
          {phoneProofToken && <p className="text-xs font-medium text-emerald-700">휴대폰 인증 완료</p>}
          {phoneVerifyMsg && (
            <p
              className={`text-xs font-medium ${phoneVerifyErr ? 'text-red-600' : 'text-neutral-600'}`}
              role={phoneVerifyErr ? 'alert' : undefined}
            >
              {phoneVerifyMsg}
            </p>
          )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">이메일 본인 확인</p>
          <p className="text-xs text-neutral-600">위에 입력한 이메일 주소로 인증번호가 발송됩니다.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSendEmailCode}
              disabled={emailSendLoading}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
            >
              {emailSendLoading ? '발송 중…' : '인증번호 받기'}
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[8rem] flex-1">
              <label htmlFor="email_auth_code" className="sr-only">
                이메일 인증번호
              </label>
              <input
                id="email_auth_code"
                value={emailAuthCode}
                onChange={(e) => setEmailAuthCode(e.target.value)}
                className={inputClass}
                placeholder="인증번호 6자리"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <button
              type="button"
              onClick={handleConfirmEmailCode}
              disabled={emailConfirmLoading}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {emailConfirmLoading ? '확인 중…' : '인증 확인'}
            </button>
          </div>
          {emailProofToken && <p className="text-xs font-medium text-emerald-700">이메일 인증 완료</p>}
          {emailVerifyMsg && (
            <p
              className={`text-xs font-medium ${emailVerifyErr ? 'text-red-600' : 'text-neutral-600'}`}
              role={emailVerifyErr ? 'alert' : undefined}
            >
              {emailVerifyMsg}
            </p>
          )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-teal-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
      >
        {loading ? '처리 중...' : '회원가입'}
      </button>

      <p className="text-center text-sm text-neutral-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
