import { Zap, Cpu, Sprout, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export function Services() {
  const services = [
    {
      icon: Zap,
      title: "Electrical & Auto Electrical Services",
      description: "Installation, maintenance, and troubleshooting for homes, businesses, and vehicles, including DB boxes, solar power, appliance setup, and fault repairs.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Cpu,
      title: "Technology & Business Solutions",
      description: "Website and app development, documentation (product plans, registrations), graphic design, software services, computer repairs, and installation.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Sprout,
      title: "Smart Farming Innovations",
      description: "Implementing automated irrigation, monitoring, renewable energy solutions, and modern farming techniques for sustainable agriculture.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Wrench,
      title: "Multipurpose Innovation & Maintenance",
      description: "Applying the Internet of Things (IoT) to design and maintain smart tools for solving everyday challenges.",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <section id="services" className="py-32 bg-gradient-to-b from-white to-gray-100 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

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
              <Cpu className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">What We Offer</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Premium Services
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* 3D shadow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                
                <div className="relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
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
          className="relative group mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-rose-600 to-pink-700 text-white p-10 rounded-3xl shadow-2xl transform group-hover:-translate-y-1 transition-all">
            <h3 className="text-3xl mb-4">Mobile Grooming Service (OMJ Exclusive Haircuts)</h3>
            <p className="text-rose-50 text-lg">
              A professional mobile grooming service offering quality haircuts at customers' convenience.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform group-hover:-translate-y-1 transition-all">
            <h3 className="text-3xl mb-4 bg-gradient-to-r from-indigo-900 to-blue-900 bg-clip-text text-transparent">
              Custom Solutions & Repairs
            </h3>
            <p className="text-gray-700 text-lg">
              Tailored innovations, repairs, and maintenance services to enhance daily life, business operations, and technological efficiency.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}