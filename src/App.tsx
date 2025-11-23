import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { TechServices } from './components/TechServices';
import { Pricing } from './components/Pricing';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Gallery } from './components/Gallery';
import { Certifications } from './components/Certifications';
import { Contact } from './components/Contact';
import { Navigation } from './components/Navigation';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <About />
      <Services />
      <TechServices />
      <Pricing />
      <WhyChooseUs />
      <Gallery />
      <Certifications />
      <Contact />
    </div>
  );
}