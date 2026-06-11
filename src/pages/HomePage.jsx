import Navigation from '../components/navigation/Navigation';
import Hero from '../sections/Hero';
import { Container } from '../components/layout';
import StatisticsStrip from '../sections/StatisticsStrip';
import FeaturedPodcasts from '../sections/FeaturedPodcasts';
import AIHighlights from '../sections/AIHighlights';
import LatestEpisodes from '../sections/LatestEpisodes';
import AnalyticsDashboard from '../sections/AnalyticsDashboard';
import Integrations from '../sections/Integrations';
import Footer from '../sections/Footer';

export default function HomePage({ introComplete }) {
  return (
    <>
      <Navigation />
      <Hero introComplete={introComplete} />
      {/* Statistics strip between Hero and Podcasts */}
      <div style={{ padding: '0 0 20px' }}>
        <Container>
          <StatisticsStrip />
        </Container>
      </div>
      <FeaturedPodcasts />
      <AIHighlights />
      <LatestEpisodes />
      <AnalyticsDashboard />
      <Integrations />
      <Footer />
    </>
  );
}
