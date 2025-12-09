import { Phone, Mail, Facebook, MapPin, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        timestamp: new Date(),
        status: 'new'
      });

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating orbs */}
      <motion.div 
        className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          y: [0, 40, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          y: [0, -50, 0],
          x: [0, -40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2">
              <Phone className="w-5 h-5 text-blue-300" />
              <span className="text-sm text-white/90">Get In Touch</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 text-white" style={{
            textShadow: '0 0 80px rgba(59, 130, 246, 0.5)'
          }}>
            Contact Us
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Phone, title: "Phone", content: "+2766 370 6956", href: "tel:+27663706956", gradient: "from-blue-500 to-cyan-500" },
            { icon: Mail, title: "Email", content: "nkundlandetechandelcsolutions@gmail.com", href: "mailto:nkundlandetechandelcsolutions@gmail.com", gradient: "from-purple-500 to-pink-500" },
            { icon: Facebook, title: "Facebook", content: "@NTES", href: "https://facebook.com/NTES", gradient: "from-indigo-500 to-blue-500" }
          ].map((contact, index) => {
            const Icon = contact.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${contact.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center transform group-hover:-translate-y-2 transition-all">
                  <div className={`w-20 h-20 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl mb-3 text-white">{contact.title}</h3>
                  <a href={contact.href} target={contact.title === "Facebook" ? "_blank" : undefined} rel={contact.title === "Facebook" ? "noopener noreferrer" : undefined} className="text-blue-200 hover:text-white transition-colors break-all block">
                    {contact.content}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl text-white mb-4">Send us a Message</h3>
              <p className="text-blue-100">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <p className="text-green-100">Message sent successfully! We'll get back to you soon.</p>
              </motion.div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                <p className="text-red-100">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-100 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="+27 XX XXX XXXX"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-blue-100 mb-2">
                  Service Interested In
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="" className="text-gray-900">Select a service</option>
                  <option value="electrical" className="text-gray-900">Electrical Services</option>
                  <option value="ict" className="text-gray-900">ICT Solutions</option>
                  <option value="graphic-design" className="text-gray-900">Graphic Design</option>
                  <option value="business-solutions" className="text-gray-900">Business Solutions</option>
                  <option value="house-wiring" className="text-gray-900">House Wiring</option>
                  <option value="pumps" className="text-gray-900">Pump Services</option>
                  <option value="other" className="text-gray-900">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-blue-100 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                  placeholder="Tell us about your project or requirements..."
                />
              </div>

              <div className="md:col-span-2 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-30"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <MapPin className="w-8 h-8 text-blue-300" />
              <h3 className="text-3xl text-white">Visit Us</h3>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Stand No 2785 Kwazanele: Breyten, Mpumalanga, 2330
            </p>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Ready to transform your business with cutting-edge technology solutions? Contact us today for a consultation and discover how we can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+27663706956"
                className="group/btn relative px-10 py-5 bg-white text-blue-900 rounded-2xl overflow-hidden shadow-2xl hover:shadow-white/50 transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                <span className="relative z-10">Call Now</span>
              </a>
              <a 
                href="mailto:nkundlandetechandelcsolutions@gmail.com"
                className="group/btn relative px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl overflow-hidden hover:bg-white/20 transition-all hover:scale-105"
              >
                <span className="relative z-10">Send Email</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="pt-12 border-t border-white/20 text-center"
        >
          <p className="text-blue-200 text-lg mb-2">
            © 2025 Nkundlande Tech & Elec Solutions (PTY) LTD. All rights reserved.
          </p>
          <p className="text-blue-300">
            Stand No 2785 Kwazanele: Breyten, Mpumalanga, 2330
          </p>
        </motion.div>
      </div>
    </section>
  );
}