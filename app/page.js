import Nav from './components/Nav';
import Footer from './components/Footer';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ProjectsSection from './components/ProjectsSection';
import Reveal from './components/Reveal';

export const metadata = {
  title: 'Ted Solomon — Product Manager, Builder',
  description:
    'Ted Solomon — Product Manager at Beck Technology. Former construction estimator turned PM. I ship software people actually want to use.',
};

export default function Home() {
  return (
    <>
      <Nav />

      <Hero />

      <div className="divider"><hr /></div>

      <AboutSection />

      <div className="divider"><hr /></div>

      <ProjectsSection />

      <div className="divider"><hr /></div>

      <Reveal>
        <section className="footer-section" id="contact">
          <div className="section-label">Connect</div>
          <div className="footer-content">
            <h2>Let&apos;s talk.</h2>
            <p>
              Interested in product management, building something cool, or just want to connect —
              I&apos;m always up for a conversation.
            </p>
            <div className="social-links">
              <a href="https://linkedin.com/in/ted-j-solomon" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href="https://x.com/tedjsolomon" target="_blank" rel="noopener noreferrer">
                Twitter / X
              </a>
              <a href="https://www.instagram.com/tedsolomon/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="mailto:tedjsolomon@gmail.com">Email</a>
            </div>
          </div>
        </section>
      </Reveal>

      <Footer />
    </>
  );
}
