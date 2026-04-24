import Link from '@/components/AppLink';

const linkClass =
  'text-neutral-200 transition-colors hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-900 text-neutral-200">
      <div className="mx-auto w-full max-w-pc px-4 py-8 sm:px-6 md:py-16">
        <div className="hidden gap-12 text-base md:grid md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="mb-4 font-display text-xl font-semibold tracking-tight text-white">OnlyOneMusic Co., Ltd.</p>
            <p className="text-base leading-relaxed text-neutral-400">
              예배와 찬양을 위한 악보를 한곳에서 검색하고 구매하세요.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-300">고객센터</h3>
            <ul className="space-y-2.5 text-base text-neutral-400">
              <li>
                <Link href="/customer/notice" className={linkClass}>
                  공지사항
                </Link>
              </li>
              <li>
                <Link href="/customer/faq" className={linkClass}>
                  자주 묻는 질문 (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/customer/qna" className={linkClass}>
                  묻고 답하기 (QNA)
                </Link>
              </li>
              <li>
                <Link href="/customer/terms" className={linkClass}>
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/customer/privacy" className={linkClass}>
                  개인정보취급방침
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-300">회사</h3>
            <ul className="space-y-2.5 text-base text-neutral-200">
              <li>(주)온리원뮤직</li>
              <li>070-7750-7034</li>
              <li>
                <a href="mailto:music@onlyonemusic.com" className={linkClass}>
                  music@onlyonemusic.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-300">빠른 링크</h3>
            <ul className="space-y-2.5 text-base text-neutral-400">
              <li>
                <Link href="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/scores?sort=newest" className={linkClass}>
                  최신 악보
                </Link>
              </li>
              <li>
                <Link href="/scores?sort=popular" className={linkClass}>
                  인기 악보
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700/80 pt-6 text-left text-base leading-relaxed text-neutral-400 md:mt-14 md:pt-8">
          <p>
            서울특별시 중랑구 동일로157길 52-10 203호 · 사업자등록번호 654-86-01682 · 통신판매업신고 2020-서울중랑-1137
          </p>
          <p className="mt-2">회사명 (주)온리원뮤직 · 대표 남형진 · 개인정보 보호 책임자 남형진</p>
          <p className="mt-6 text-neutral-500">Copyright © 2017 ONLYONEMUSIC All right Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
