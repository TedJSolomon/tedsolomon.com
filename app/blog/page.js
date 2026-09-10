import Footer from '../components/Footer';
import BlogSection from '../components/BlogSection';

export const metadata = {
  title: 'Blog — Ted Solomon',
  description:
    'Ted Solomon writes about product management, building software, and the path from construction to tech.',
};

export default function Blog() {
  return (
    <>
      <BlogSection />
      <Footer />
    </>
  );
}
