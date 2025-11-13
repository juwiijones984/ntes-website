import { motion } from 'motion/react';
import { Code2, Database, Wrench, Users, Clock, Lightbulb, MessageSquare, Palette, TrendingUp, Target, RefreshCw, Search } from 'lucide-react';

export function Skills() {
  const technicalSkills = [
    { category: 'Frontend', skills: ['HTML', 'CSS', 'JavaScript', 'Kotlin', 'Jetpack Compose'], icon: Code2 },
    { category: 'Backend', skills: ['Java (Jakarta EE)', 'Node.js', 'Express.js'], icon: Database },
    { category: 'Database', skills: ['MySQL', 'MongoDB', 'Firebase', 'Database Design & Management'], icon: Database },
    { category: 'Tools', skills: ['Git', 'GitHub', 'NetBeans', 'VS Code', 'Android Studio', 'CI/CD', 'Deployment'], icon: Wrench },
    { category: 'Other', skills: ['Project Management', 'UI/UX Design', 'Graphic Design', 'Microsoft 365', 'Basic Networking', 'Customer Service'], icon: Palette }
  ];

  const softSkills = [
    { name: 'Quick Learner with Growth-Oriented Mindset', icon: TrendingUp, color: 'from-[#00BFA6] to-[#00B8D9]' },
    { name: 'Strong Problem-Solving and Analytical Thinking', icon: Lightbulb, color: 'from-[#00B8D9] to-[#8e24aa]' },
    { name: 'Excellent Time Management and Organizational Skills', icon: Clock, color: 'from-[#8e24aa] to-[#e91e63]' },
    { name: 'Effective Communicator with Strong Interpersonal Abilities', icon: MessageSquare, color: 'from-[#e91e63] to-[#00BFA6]' },
    { name: 'Works Well Under Pressure and Meets Deadlines', icon: Target, color: 'from-[#00BFA6] to-[#00B8D9]' },
    { name: 'Team-Oriented with Proven Leadership Experience', icon: Users, color: 'from-[#00B8D9] to-[#8e24aa]' },
    { name: 'Adaptable to New Technologies and Work Environments', icon: RefreshCw, color: 'from-[#8e24aa] to-[#e91e63]' },
    { name: 'Detail-Driven with Commitment to Quality and Innovation', icon: Search, color: 'from-[#e91e63] to-[#00BFA6]' }
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
              Skills & Expertise
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] mx-auto" />
        </motion.div>

        {/* Technical Skills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl mb-8 text-center text-[#00BFA6]">Technical Skills</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {technicalSkills.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700 hover:border-[#00BFA6] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <h4 className="text-xl text-[#00BFA6]">{category.category}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Soft Skills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl mb-8 text-center text-[#00B8D9]">Soft Skills</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {softSkills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700 hover:border-[#00B8D9] transition-all text-center"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${skill.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={28} />
                  </div>
                  <p className="text-gray-300">{skill.name}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
