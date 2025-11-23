import { Phone, Mail, Facebook, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function Contact() {
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