import { motion } from 'motion/react';
import { Shield, Award, FileCheck, Building2, CheckCircle2, Calendar } from 'lucide-react';

export function Certifications() {
  const certifications = [
    {
      icon: Building2,
      title: "CIPC Registered",
      details: "Companies and Intellectual Property Commission",
      info: "Certificate of Registration",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: Calendar,
      title: "Registration Date",
      details: "Official Business Start Date",
      info: "18 March 2025",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: FileCheck,
      title: "Registration Number",
      details: "CIPC Official Number",
      info: "2025/242206/07",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      icon: Shield,
      title: "Enterprise Status",
      details: "Verified Company Status",
      info: "In Business",
      gradient: "from-orange-600 to-red-600"
    }
  ];

  const credentials = [
    "Certified Electrical Installation Services",
    "Licensed Technology Solutions Provider",
    "Registered Business Consultancy",
    "Authorized Smart Farming Innovations",
    "Compliant Auto Electrical Services",
    "Professional Graphic Design Services"
  ];

  return (
    <section id="certifications" className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>

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
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">Trusted & Verified</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Certifications & Registration
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
          <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto">
            We are a fully registered and compliant company, committed to delivering professional services with integrity and excellence.
          </p>
        </motion.div>

        {/* Main Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {certifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* 3D glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cert.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                
                <div className="relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${cert.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-2 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-2">{cert.details}</p>
                  <p className="text-center text-gray-700">{cert.info}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Company Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative bg-white p-10 md:p-12 rounded-3xl shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Company Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Registered Name</p>
                      <p className="text-gray-800">Nkundlande Tech and Elec Solutions (PTY) LTD</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="text-gray-800">2025/242206/07</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="text-gray-800">18 March 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Enterprise Type</p>
                      <p className="text-gray-800">Private Company (PTY) LTD</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Enterprise Status</p>
                      <p className="text-gray-800">In Business</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800">Stand No 2785 Kwazanele: Breyten, Mpumalanga, 2330</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Registered with CIPC</p>
                      <p className="text-gray-800">Companies and Intellectual Property Commission</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Financial Year End</p>
                      <p className="text-gray-800">November</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl bg-gradient-to-r from-green-900 to-emerald-900 bg-clip-text text-transparent">
                    Service Credentials
                  </h3>
                </div>
                <div className="space-y-3">
                  {credentials.map((credential, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-3 group/item"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-gray-700 group-hover/item:text-green-900 transition-colors">{credential}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Registered", value: "2025", gradient: "from-blue-600 to-cyan-600" },
            { label: "Compliant", value: "100%", gradient: "from-green-600 to-emerald-600" },
            { label: "Licensed", value: "Yes", gradient: "from-purple-600 to-pink-600" },
            { label: "Insured", value: "Yes", gradient: "from-orange-600 to-red-600" }
          ].map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              <div className={`relative bg-gradient-to-br ${badge.gradient} p-6 rounded-2xl text-center shadow-xl transform group-hover:scale-105 transition-all`}>
                <p className="text-sm text-white/80 mb-1">{badge.label}</p>
                <p className="text-3xl text-white">{badge.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Legal Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-blue-50 border border-blue-200 rounded-2xl px-8 py-4">
            <p className="text-sm text-gray-600">
              All certifications and registrations are verified and up to date. We maintain full compliance with industry regulations and standards.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Certificate issued by the Companies and Intellectual Property Commission (CIPC) on Monday, March 24, 2025. 
              Tracking Number: 9432165129 | Customer Code: AALVQB
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}