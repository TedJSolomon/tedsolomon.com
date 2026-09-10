import Footer from '../components/Footer';
import BlogSection from '../components/BlogSection';
import InteriorPageFade from '../components/InteriorPageFade';

export const metadata = {
  title: 'Blog — Ted Solomon',
  description:
    'Ted Solomon writes about product management, building software, and the path from construction to tech.',
};

export default function Blog() {
  return (
    <>
      <InteriorPageFade>
        <BlogSection />
      </InteriorPageFade>
      <Footer />
    </>
  );
}
