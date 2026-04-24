import type { Metadata } from 'next';
import { Noto_Sans_KR, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthBootstrap from '@/components/auth/AuthBootstrap';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

/** OG·canonical 절대 URL. 프로덕션 빌드에서 `https://www.onlyonemusic.kr` 등으로 맞추려면 `.env`에 설정. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onlyonemusic.kr';
const defaultTitle = '오직 한가지! www.onlyonemusic.kr';
const defaultDescription = '온리원뮤직 악보';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  /**
   * 파비콘 바이너리는 `src/app/favicon.ico`에 둠(App Router 규약).
   * `public/favicon.ico`만 있으면 빌드 시 Next가 기본 ICO로 덮어써 탭에 Vercel 기본 아이콘이 보일 수 있음.
   * PNG·애플 터치는 `public/icon.png`, `public/apple-icon.png` 그대로 `/`로 제공.
   */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'OnlyOneMusic',
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    images: [{ url: '/icon.png', alt: 'OnlyOneMusic' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${sourceSerif.variable} h-full`}>
      {/* 확장 프로그램이 body에 속성을 주입하면(예: cz-shortcut-listen) hydration 불일치가 남 → 해당 노드만 경고 억제 */}
      <body
        className="flex min-h-full flex-col bg-background antialiased text-text-secondary"
        suppressHydrationWarning
      >
        <AuthBootstrap>
          <Header />
          <main className="flex min-h-0 w-full flex-1 flex-col">{children}</main>
          <Footer />
        </AuthBootstrap>
      </body>
    </html>
  );
}
