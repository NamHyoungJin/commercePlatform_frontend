import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: '회원가입 | OnlyOneMusic' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section
        className="relative hidden min-h-[270px] items-center justify-center border-b border-white/[0.06] bg-[#0c0c0c] bg-cover bg-center bg-no-repeat md:flex"
        style={{ backgroundImage: "url('/img/_common/whoOnlyonemusic.png')" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
      </section>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6">
        <div className="w-full max-w-[84rem] rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-black/40 ring-1 ring-black/[0.06] sm:p-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
