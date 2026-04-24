'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';
import axios from 'axios';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import { MODAL_CONTENT_BG, MODAL_TITLE_BAR, modalTitleHeadingClass } from '@/components/modals/modalTitleBar';

type PwChannel = 'phone' | 'email';

export default function FindAccountForm() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [idName, setIdName] = useState('');
  const [idEmail, setIdEmail] = useState('');
  const [idLoading, setIdLoading] = useState(false);
  const [idMsg, setIdMsg] = useState<string | null>(null);
  const [idErr, setIdErr] = useState(false);

  const [pwMemberId, setPwMemberId] = useState('');
  const [pwName, setPwName] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<PwChannel[]>([]);
  const [requireChannelChoice, setRequireChannelChoice] = useState(false);
  const [phoneMasked, setPhoneMasked] = useState<string | null>(null);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<PwChannel | ''>('');
  const [channelLocked, setChannelLocked] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [passwordChangeToken, setPasswordChangeToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [pwLookupLoading, setPwLookupLoading] = useState(false);
  const [pwSendLoading, setPwSendLoading] = useState(false);
  const [pwConfirmLoading, setPwConfirmLoading] = useState(false);
  const [pwCompleteLoading, setPwCompleteLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState(false);
  const [pwSuccessModalOpen, setPwSuccessModalOpen] = useState(false);

  const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500/35';

  const errText = (err: unknown) => {
    const raw = axios.isAxiosError(err) ? err.response?.data : undefined;
    return raw ? formatApiErrorMessage(raw) : '요청을 처리하지 못했습니다.';
  };

  useEffect(() => {
    if (channels.length === 1) {
      setSelectedChannel(channels[0]!);
    }
  }, [channels]);

  const resetPwFlow = () => {
    setResetSessionToken(null);
    setChannels([]);
    setRequireChannelChoice(false);
    setPhoneMasked(null);
    setEmailMasked(null);
    setSelectedChannel('');
    setChannelLocked(false);
    setAuthCode('');
    setPasswordChangeToken(null);
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdMsg(null);
    setIdErr(false);
    setIdLoading(true);
    try {
      const { data } = await authApi.findMemberId({ name: idName.trim(), email: idEmail.trim() });
      setIdErr(false);
      setIdMsg(`회원님의 아이디는 ${data.member_id} 입니다.`);
    } catch (err) {
      setIdErr(true);
      setIdMsg(errText(err));
    } finally {
      setIdLoading(false);
    }
  };

  const handlePwLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(false);
    setPwLookupLoading(true);
    resetPwFlow();
    try {
      const { data } = await authApi.passwordResetLookup({
        member_id: pwMemberId.trim(),
        name: pwName.trim(),
      });
      setResetSessionToken(data.reset_session_token);
      setChannels(data.channels);
      setRequireChannelChoice(data.require_channel_choice);
      setPhoneMasked(data.phone_masked);
      setEmailMasked(data.email_masked);
      setPwErr(false);
      setPwMsg('가입 시 등록된 연락처로 인증번호를 받을 수 있습니다. 인증 방법을 선택한 뒤 인증번호를 요청해 주세요.');
    } catch (err) {
      setPwErr(true);
      setPwMsg(errText(err));
      resetPwFlow();
    } finally {
      setPwLookupLoading(false);
    }
  };

  const handlePwSend = async () => {
    setPwMsg(null);
    setPwErr(false);
    if (!resetSessionToken) return;
    const ch = selectedChannel;
    if (!ch) {
      setPwErr(true);
      setPwMsg('이메일 또는 휴대폰 인증을 선택해 주세요.');
      return;
    }
    setPwSendLoading(true);
    try {
      await authApi.passwordResetSend({ reset_session_token: resetSessionToken, channel: ch });
      setChannelLocked(true);
      setPwErr(false);
      setPwMsg(
        ch === 'email'
          ? '등록된 이메일로 인증번호를 보냈습니다. 메일함을 확인해 주세요.'
          : '등록된 휴대폰 번호로 인증번호를 보냈습니다. 문자를 확인해 주세요.',
      );
    } catch (err) {
      setPwErr(true);
      setPwMsg(errText(err));
    } finally {
      setPwSendLoading(false);
    }
  };

  const handlePwConfirmCode = async () => {
    setPwMsg(null);
    setPwErr(false);
    if (!resetSessionToken || !selectedChannel) return;
    const code = authCode.trim();
    if (!code) {
      setPwErr(true);
      setPwMsg('인증번호를 입력해 주세요.');
      return;
    }
    setPwConfirmLoading(true);
    try {
      const { data } = await authApi.passwordResetConfirm({
        reset_session_token: resetSessionToken,
        channel: selectedChannel,
        code,
      });
      setPasswordChangeToken(data.password_change_token);
      setPwErr(false);
      setPwMsg('인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.');
    } catch (err) {
      setPwErr(true);
      setPwMsg(errText(err));
    } finally {
      setPwConfirmLoading(false);
    }
  };

  const handlePwComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(false);
    if (!passwordChangeToken) return;
    setPwCompleteLoading(true);
    try {
      await authApi.passwordResetComplete({
        password_change_token: passwordChangeToken,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      resetPwFlow();
      setPwMemberId('');
      setPwName('');
      setPwErr(false);
      setPwMsg(null);
      setPwSuccessModalOpen(true);
    } catch (err) {
      setPwErr(true);
      setPwMsg(errText(err));
    } finally {
      setPwCompleteLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-neutral-600">이미 로그인되어 있습니다.</p>
        <Link href="/mypage" className="inline-block font-semibold text-teal-600 underline hover:text-teal-500">
          마이페이지로 이동
        </Link>
      </div>
    );
  }

  const showPwContact = Boolean(resetSessionToken) && !passwordChangeToken;
  const showPwNew = Boolean(passwordChangeToken);

  const goLoginAfterPwReset = () => {
    setPwSuccessModalOpen(false);
    router.push('/login');
  };

  return (
    <>
      {pwSuccessModalOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={goLoginAfterPwReset}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pw-reset-success-title"
            className={`max-w-md overflow-hidden rounded-2xl border border-neutral-200 shadow-xl ${MODAL_CONTENT_BG}`}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className={`px-6 py-4 ${MODAL_TITLE_BAR}`}>
              <h3 id="pw-reset-success-title" className={`text-lg ${modalTitleHeadingClass}`}>
                비밀번호가 정상적으로 변경되었습니다
              </h3>
            </div>
            <div className={`p-6 ${MODAL_CONTENT_BG}`}>
            <p className="text-sm leading-relaxed text-neutral-600">새 비밀번호로 로그인해 주세요.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={goLoginAfterPwReset}
                className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
              >
                로그인 하러 가기
              </button>
            </div>
            </div>
          </div>
        </div>
      ) : null}

    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-bold text-neutral-900">아이디 찾기</h2>
        <p className="mt-1 text-sm text-neutral-600">가입 시 입력한 이름과 이메일을 입력해 주세요.</p>
        <form onSubmit={handleFindId} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="find_name" className="text-xs font-medium text-neutral-600">
              이름
            </label>
            <input id="find_name" required value={idName} onChange={(e) => setIdName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="find_email" className="text-xs font-medium text-neutral-600">
              이메일
            </label>
            <input
              id="find_email"
              type="email"
              required
              value={idEmail}
              onChange={(e) => setIdEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={idLoading}
            className="rounded-full bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {idLoading ? '확인 중…' : '확인'}
          </button>
          {idMsg && (
            <p className={`text-sm font-medium ${idErr ? 'text-red-600' : 'text-emerald-700'}`} role={idErr ? 'alert' : undefined}>
              {idMsg}
            </p>
          )}
        </form>
      </section>

      <hr className="border-neutral-200" />

      <section>
        <h2 className="text-lg font-bold text-neutral-900">비밀번호 변경</h2>
        <p className="mt-1 text-sm text-neutral-600">
          아이디와 이름을 입력하면 가입 시 인증에 사용한 이메일 또는 휴대폰(마스킹 표시)으로 인증번호를 보내 드립니다. 인증 후 새
          비밀번호를 설정할 수 있습니다.
        </p>

        {!showPwContact && !showPwNew ? (
          <form onSubmit={handlePwLookup} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="find_mid" className="text-xs font-medium text-neutral-600">
                아이디
              </label>
              <input
                id="find_mid"
                required
                value={pwMemberId}
                onChange={(e) => {
                  setPwMemberId(e.target.value);
                  if (resetSessionToken) resetPwFlow();
                }}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="find_pw_name" className="text-xs font-medium text-neutral-600">
                이름
              </label>
              <input
                id="find_pw_name"
                required
                value={pwName}
                onChange={(e) => {
                  setPwName(e.target.value);
                  if (resetSessionToken) resetPwFlow();
                }}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={pwLookupLoading}
              className="rounded-full bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {pwLookupLoading ? '확인 중…' : '다음'}
            </button>
          </form>
        ) : null}

        {showPwContact ? (
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-800">등록된 연락처</p>
            {emailMasked ? (
              <p className="text-sm text-neutral-700">
                <span className="text-neutral-500">이메일 </span>
                {emailMasked}
              </p>
            ) : null}
            {phoneMasked ? (
              <p className="text-sm text-neutral-700">
                <span className="text-neutral-500">휴대폰 </span>
                {phoneMasked}
              </p>
            ) : null}

            {requireChannelChoice ? (
              <fieldset className="flex flex-col gap-2 border-0 p-0">
                <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-600">
                  인증 받을 곳
                </legend>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {channels.includes('email') ? (
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        selectedChannel === 'email'
                          ? 'border-teal-600 bg-teal-50 text-neutral-900'
                          : 'border-neutral-300 bg-white text-neutral-700'
                      } ${channelLocked ? 'pointer-events-none opacity-70' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pw_ch"
                        checked={selectedChannel === 'email'}
                        onChange={() => !channelLocked && setSelectedChannel('email')}
                        className="text-teal-600 accent-teal-600"
                      />
                      이메일로 인증
                    </label>
                  ) : null}
                  {channels.includes('phone') ? (
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        selectedChannel === 'phone'
                          ? 'border-teal-600 bg-teal-50 text-neutral-900'
                          : 'border-neutral-300 bg-white text-neutral-700'
                      } ${channelLocked ? 'pointer-events-none opacity-70' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pw_ch"
                        checked={selectedChannel === 'phone'}
                        onChange={() => !channelLocked && setSelectedChannel('phone')}
                        className="text-teal-600 accent-teal-600"
                      />
                      휴대폰으로 인증
                    </label>
                  ) : null}
                </div>
              </fieldset>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handlePwSend()}
                disabled={pwSendLoading || !selectedChannel}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
              >
                {pwSendLoading ? '발송 중…' : '인증번호 받기'}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw_auth_code" className="text-xs font-medium text-neutral-600">
                인증번호
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <input
                  id="pw_auth_code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className={`${inputClass} max-w-xs`}
                  placeholder="6자리"
                  maxLength={6}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => void handlePwConfirmCode()}
                  disabled={pwConfirmLoading || !channelLocked}
                  className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
                >
                  {pwConfirmLoading ? '확인 중…' : '인증 확인'}
                </button>
              </div>
              <p className="text-xs text-neutral-500">먼저 인증번호 받기를 누른 뒤, 수신한 번호를 입력하고 인증 확인을 눌러 주세요.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetPwFlow();
              }}
              className="self-start text-sm text-neutral-500 underline hover:text-neutral-700"
            >
              아이디·이름부터 다시 입력
            </button>
          </div>
        ) : null}

        {showPwNew ? (
          <form onSubmit={handlePwComplete} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw_new" className="text-xs font-medium text-neutral-600">
                새 비밀번호
              </label>
              <input
                id="pw_new"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-neutral-600">8자 이상, 영문과 숫자를 각각 1자 이상 포함해야 합니다.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw_new2" className="text-xs font-medium text-neutral-600">
                새 비밀번호 확인
              </label>
              <input
                id="pw_new2"
                type="password"
                autoComplete="new-password"
                required
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={pwCompleteLoading}
              className="rounded-full bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {pwCompleteLoading ? '처리 중…' : '비밀번호 변경'}
            </button>
          </form>
        ) : null}

        {pwMsg ? (
          <p className={`mt-3 text-sm font-medium ${pwErr ? 'text-red-600' : 'text-emerald-700'}`} role={pwErr ? 'alert' : undefined}>
            {pwMsg}
          </p>
        ) : null}
      </section>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/login" className="font-semibold text-teal-600 underline hover:text-teal-500">
          로그인
        </Link>
        {' · '}
        <Link href="/register" className="font-semibold text-teal-600 underline hover:text-teal-500">
          회원가입
        </Link>
      </p>
    </div>
    </>
  );
}
