import { DM_Serif_Display, JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';
import SmoothScroll from './components/SmoothScroll';
import PageTransition from './components/PageTransition';
import ScrollProgressBar from './components/ScrollProgressBar';

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
  variable: '--font-dm-serif-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
  variable: '--font-jetbrains-mono',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Ted Solomon',
  description: 'Ted Solomon — Product Manager at Beck Technology.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${jetbrainsMono.variable} ${outfit.variable}`}
    >
      <body>
        <ScrollProgressBar />
        <SmoothScroll>
          <PageTransition>{children}</PageTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
