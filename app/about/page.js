import Footer from '../components/Footer';
import AboutPageContent from '../components/AboutPageContent';
import InteriorPageFade from '../components/InteriorPageFade';

export const metadata = {
  title: 'About — Ted Solomon',
  description:
    'About Ted Solomon — Product Manager at Beck Technology. From heavy civil construction to implementation to product.',
};

export default function About() {
  return (
    <>
      <InteriorPageFade>
        <AboutPageContent />
      </InteriorPageFade>
      <Footer />
    </>
  );
}
