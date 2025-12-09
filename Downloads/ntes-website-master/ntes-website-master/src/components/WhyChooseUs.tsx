import { Award, Lightbulb, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Award,
      title: "Experienced & Skilled Team",
      description: "Expertise in electrical, technology, and business solutions",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Lightbulb,
      title: "Innovation-Driven",
      description: "Integrating technology into everyday solutions",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Target,
      title: "Affordable & Reliable Services",
      description: "High-quality work at competitive rates",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Customer-Focused Approach",
      description: "Tailored services to meet unique client needs",
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      
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
              <span className="text-sm text-blue-900">Our Advantages</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Why Choose Us
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* 3D card effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                
                <div className="relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
                  <div className="text-center">
                    <div className={`w-24 h-24 bg-gradient-to-br ${reason.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}