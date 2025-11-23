import { Routes, Route } from 'react-router-dom';
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
import { AdminDashboard } from './components/admin/AdminDashboard';

function PublicWebsite() {
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicWebsite />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
    </Routes>
  );
}