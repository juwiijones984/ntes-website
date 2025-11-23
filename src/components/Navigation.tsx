import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from 'figma:asset/a35fb7689c0ce26682573f9bfcbf7c9fb873405a.png';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl shadow-2xl z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30"></div>
              <img src={logo} alt="Nkundlande Tech Logo" className="h-16 w-auto relative z-10 drop-shadow-2xl" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            <button onClick={() => scrollToSection('hero')} className="px-6 py-3 text-gray-700 hover:text-blue-900 transition-all relative group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => scrollToSection('about')} className="px-6 py-3 text-gray-700 hover:text-blue-900 transition-all relative group">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => scrollToSection('services')} className="px-6 py-3 text-gray-700 hover:text-blue-900 transition-all relative group">
              <span className="relative z-10">Services</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => scrollToSection('pricing')} className="px-6 py-3 text-gray-700 hover:text-blue-900 transition-all relative group">
              <span className="relative z-10">Pricing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => scrollToSection('gallery')} className="px-6 py-3 text-gray-700 hover:text-blue-900 transition-all relative group">
              <span className="relative z-10">Gallery</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => scrollToSection('certifications')} className="px-6 py-3 text-gray-700 hover:text-blue-900 transition-all relative group">
              <span className="relative z-10">Certifications</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => scrollToSection('contact')} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-2xl hover:scale-105 transition-all relative overflow-hidden group">
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 transition-all"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-gray-200/50 backdrop-blur-xl">
            <div className="flex flex-col space-y-2">
              <button onClick={() => scrollToSection('hero')} className="text-gray-700 hover:text-blue-900 transition-colors text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-900 transition-colors text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
                About
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-900 transition-colors text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
                Services
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-blue-900 transition-colors text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
                Pricing
              </button>
              <button onClick={() => scrollToSection('gallery')} className="text-gray-700 hover:text-blue-900 transition-colors text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
                Gallery
              </button>
              <button onClick={() => scrollToSection('certifications')} className="text-gray-700 hover:text-blue-900 transition-colors text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10">
                Certifications
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-all px-4 py-3 rounded-lg">
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}