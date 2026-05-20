import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Projects — Ted Solomon',
  description: 'Projects by Ted Solomon — Vision Quest newsletter, Catalyft mobile app, and Meeting Cost Calculator.',
};

export default function Projects() {
  return (
    <>
      <Nav />

      <div className="page-hero">
        <div className="page-hero-tag">Projects</div>
        <h1>Things I&apos;ve Built</h1>
        <p>Side projects I&apos;ve taken from idea to shipped — outside of the day job.</p>
      </div>

      <div className="divider"><hr /></div>

      <section className="project-full">
        <div className="section-label">Newsletter</div>
        <div>
          <h2 className="project-full-name">Vision Quest</h2>
          <p className="project-full-desc">
            A weekly tech newsletter breaking down AI, hardware, and emerging tech for people who
            want to stay informed without the jargon. I co-founded it and handle the product side
            — reader analytics, content strategy, and growth.
          </p>
          <p className="project-full-desc">
            Built on Beehiiv. The focus is on making complex tech topics accessible and actionable
            for a general professional audience — not just people already in the industry.
          </p>
          <div className="project-full-tags">
            <span className="tag">Beehiiv</span>
            <span className="tag">Product Strategy</span>
            <span className="tag">Growth</span>
            <span className="tag">Newsletter</span>
          </div>
          <a href="#" className="btn-secondary">Visit Vision Quest →</a>
        </div>
      </section>

      <section className="project-full">
        <div className="section-label">Mobile App</div>
        <div>
          <h2 className="project-full-name">Catalyft</h2>
          <p className="project-full-desc">
            A mobile workout tracking app built for weightlifting. Designed to make logging sets,
            tracking progress, and planning workouts simple and fast. Built from the ground up as a
            side project — currently heading to the App Store.
          </p>
          <div className="project-full-tags">
            <span className="tag">iOS</span>
            <span className="tag">Mobile App</span>
            <span className="tag">Product Design</span>
            <span className="tag">Fitness</span>
          </div>
          <a href="#" className="btn-secondary">Coming to the App Store →</a>
        </div>
      </section>

      <section className="project-full">
        <div className="section-label">Tool</div>
        <div>
          <h2 className="project-full-name">Meeting Cost Calculator</h2>
          <p className="project-full-desc">
            See what your meetings really cost. A real-time cost ticker that calculates the true
            dollar value of every minute spent in a room — based on actual attendee salaries.
          </p>
          <p className="project-full-desc">
            Built with a pre-loaded demo company of 175+ employees across 8 departments. Pick
            your attendees, set a duration, hit start, and watch the cost tick up in real time.
            One-time or recurring — with annualized cost projections.
          </p>
          <div className="project-full-tags">
            <span className="tag">React</span>
            <span className="tag">Next.js</span>
            <span className="tag">Real-time</span>
            <span className="tag">Productivity</span>
          </div>
          <a href="/tools/meeting-cost-calculator" className="btn-secondary">Open Calculator →</a>
        </div>
      </section>

      <Footer />
    </>
  );
}
