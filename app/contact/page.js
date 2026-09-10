import Footer from '../components/Footer';
import ContactSection from '../components/ContactSection';
import InteriorPageFade from '../components/InteriorPageFade';

export const metadata = {
  title: 'Contact — Ted Solomon',
  description:
    'Get in touch with Ted Solomon — connect on LinkedIn, Twitter, Instagram, or by email.',
};

export default function Contact() {
  return (
    <>
      <InteriorPageFade>
        <ContactSection />
      </InteriorPageFade>
      <Footer />
    </>
  );
}
