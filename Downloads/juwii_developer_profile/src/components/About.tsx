import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Rocket, Target } from 'lucide-react';

export function About() {
  const highlights = [
    {
      icon: GraduationCap,
      title: 'Education',
      description: 'Advanced Diploma in ICT (Application Development) at University of Mpumalanga',
      color: 'from-[#00BFA6] to-[#00B8D9]'
    },
    {
      icon: Briefcase,
      title: 'Founder',
      description: 'Nkundlande Tech and Elec Solutions - Opening March 2026',
      color: 'from-[#00B8D9] to-[#8e24aa]'
    },
    {
      icon: Rocket,
      title: 'Transition',
      description: 'From Electrical Engineering to ICT Development',
      color: 'from-[#8e24aa] to-[#00BFA6]'
    },
    {
      icon: Target,
      title: 'Mission',
      description: 'Building impactful software solutions for African communities',
      color: 'from-[#00BFA6] to-[#00B8D9]'
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-6 font-orbitron">
            <span className="bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] mx-auto mb-12" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-300 leading-relaxed">
              Hi, I'm <span className="text-[#00BFA6]">John Juwawa Sithole</span>, an aspiring Software and ICT Developer based in South Africa.
              I'm currently completing my Advanced Diploma in Information and Communication Technology (Application Development) 
              at the University of Mpumalanga, expected to graduate in May 2026.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              I transitioned from Electrical Engineering to ICT to pursue my passion for building impactful software solutions.
              As the founder of <span className="text-[#00B8D9]">Nkundlande Tech and Elec Solutions</span>, that was established in March 2025, focusing on innovative digital and electrical solutions that empower communities.
            </p>
            
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700"
          >
            <h3 className="text-2xl mb-6 text-[#00BFA6]">Career Objective</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              To create innovative, user-centered digital solutions that solve real-world challenges and 
              promote technological growth in Africa.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[#00BFA6] transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h4 className="text-xl mb-2 text-[#00BFA6]">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
