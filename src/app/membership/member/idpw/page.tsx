import FindAccountForm from '@/components/membership/FindAccountForm';

export const metadata = { title: '아이디 찾기 · 비밀번호 변경 | OnlyOneMusic' };

/** 로그인과 동일: 히어로 이미지 + 어두운 콘텐츠 영역 + 흰 카드 (좌측 마이페이지 서브메뉴 없음) */
export default function MembershipIdpwPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section
        className="relative hidden min-h-[270px] items-center justify-center border-b border-white/[0.06] bg-[#0c0c0c] bg-cover bg-center bg-no-repeat md:flex"
        style={{ backgroundImage: "url('/img/_common/whoOnlyonemusic.png')" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
        <h1 className="relative z-10 mx-auto w-full max-w-pc px-4 text-center home-album-strip-title sm:px-6">
          아이디 찾기 · 비밀번호 변경
        </h1>
      </section>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6">
        <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-black/40 ring-1 ring-black/[0.06]">
          <FindAccountForm />
        </div>
      </div>
    </div>
  );
}
