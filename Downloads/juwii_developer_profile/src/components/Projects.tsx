import { motion } from 'motion/react';
import Tilt from 'react-parallax-tilt';
import { ExternalLink, Github } from 'lucide-react';

export function Projects() {
  const projects = [
    {
      id: 1,
      title: 'Best Kasi Kota App',
      description: 'The Fast Food Ordering System is a web-based platform for a single-owner restaurant, allowing customers to place and track orders online while the admin manages stock, receives order alerts, and monitors operations.',
      tech: ['TypeScript'],
      gradient: 'from-[#00BFA6] to-[#00B8D9]',
      icon: '🍔'
    },
    {
      id: 2,
      title: 'South Africa Market',
      description: 'South Africa Market is a simple, all-in-one platform connecting buyers and sellers nationwide. Entrepreneurs, shops, and individuals can list products or services, while customers browse, filter by location, and make purchases seamlessly.',
      tech: ['TypeScript'],
      gradient: 'from-[#00B8D9] to-[#8e24aa]',
      icon: '🛒'
    },
    {
      id: 3,
      title: 'Your Look Beauty Platform',
      description: 'Your Look is an all-in-one beauty and wellness app that connects customers with trusted service providers for hair, nails, skincare, and makeup. It offers easy booking, product shopping, and loyalty programs.',
      tech: ['TypeScript'],
      gradient: 'from-[#8e24aa] to-[#e91e63]',
      icon: '💄'
    },
    {
      id: 4,
      title: 'Bug Tracking System',
      description: 'A system developed to simplify the process of identifying, reporting, and resolving software bugs in an organized, user-friendly, and collaborative environment.',
      tech: ['Java'],
      gradient: 'from-[#e91e63] to-[#ff9800]',
      icon: '🐛'
    },
    {
      id: 5,
      title: 'Egumeni Eats',
      description: 'Tfokomala Hotel ordering system - a platform for ordering food and managing operations.',
      tech: ['TypeScript'],
      gradient: 'from-[#ff9800] to-[#00BFA6]',
      icon: '🍽️'
    },
    {
      id: 6,
      title: 'Make It So App',
      description: 'Config files for my GitHub profile.',
      tech: ['Config'],
      gradient: 'from-[#00BFA6] to-[#4caf50]',
      icon: '⚙️'
    },
    {
      id: 7,
      title: 'Wayne Hotel Website',
      description: 'A website for Wayne Hotel.',
      tech: ['HTML'],
      gradient: 'from-[#4caf50] to-[#00B8D9]',
      icon: '🏨'
    },
    {
      id: 8,
      title: 'My Career Portal App',
      description: 'The UMP career portal app which connects employers, undergraduates, alumni, and graduates.',
      tech: ['Kotlin'],
      gradient: 'from-[#00B8D9] to-[#9c27b0]',
      icon: '🎓'
    },
    {
      id: 9,
      title: 'Event Ticketing App',
      description: 'An app for event ticketing.',
      tech: ['Kotlin'],
      gradient: 'from-[#9c27b0] to-[#e91e63]',
      icon: '🎫'
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
              Featured Projects
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] mx-auto mb-8" />
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Innovative solutions built to solve real-world problems
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Tilt
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="#00BFA6"
                glarePosition="all"
                glareBorderRadius="1rem"
                className="h-full"
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-[#00BFA6] transition-all h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${project.gradient} flex items-center justify-center text-3xl`}>
                      {project.icon}
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#00BFA6] transition-colors"
                      >
                        <Github size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#00B8D9] transition-colors"
                      >
                        <ExternalLink size={20} />
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-2xl mb-4 text-[#00BFA6]">{project.title}</h3>
                  <p className="text-gray-400 mb-6 flex-grow">{project.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-800 text-[#00BFA6] text-sm rounded-full border border-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
