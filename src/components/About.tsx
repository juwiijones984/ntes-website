import { motion } from 'framer-motion';
import { Award, Zap, TrendingUp } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200 rounded-full px-6 py-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">About Our Company</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Excellence in Innovation
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Nkundlande Tech & Elec Solutions (PTY) LTD is a dynamic and innovative company offering expert services in Technology, Electrical & Auto Electrical Solutions, Smart Farming Innovations, and General Maintenance.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Officially registered with CIPC (Companies and Intellectual Property Commission) on March 18, 2025 under registration number 2025/242206/07. The company is committed to providing cutting-edge solutions that enhance daily life, businesses, and industries through technology integration and problem-solving engineering.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 gap-6"
          >
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl transform group-hover:scale-105 transition-transform"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-2xl shadow-2xl transform group-hover:-translate-y-1 transition-all">
                <Zap className="w-12 h-12 text-yellow-300 mb-4" />
                <h3 className="text-2xl mb-2 text-white">Cutting-Edge Technology</h3>
                <p className="text-blue-100">Leveraging the latest innovations to deliver superior solutions</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl transform group-hover:scale-105 transition-transform"></div>
              <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 p-8 rounded-2xl shadow-2xl transform group-hover:-translate-y-1 transition-all">
                <TrendingUp className="w-12 h-12 text-green-300 mb-4" />
                <h3 className="text-2xl mb-2 text-white">Rapid Growth</h3>
                <p className="text-purple-100">Expanding our services to meet evolving market demands</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}