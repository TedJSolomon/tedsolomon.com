import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Blog — Ted Solomon',
  description:
    'Ted Solomon writes about product management, building software, and the path from construction to tech.',
};

export default function Blog() {
  return (
    <>
      <Nav />

      <section className="coming-soon">
        <div className="coming-soon-tag">Blog</div>
        <h1>Coming Summer 2026</h1>
        <p>Thoughts on product, building, and figuring it out along the way.</p>
      </section>

      <Footer />
    </>
  );
}
