import { motion } from 'motion/react';
import { Mail, Phone, Linkedin, Github, MapPin } from 'lucide-react';

export function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'juwiijones984@gmail.com',
      href: 'mailto:juwiijones984@gmail.com',
      color: 'from-[#00BFA6] to-[#00B8D9]'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '0663706956',
      href: 'tel:0663706956',
      color: 'from-[#00B8D9] to-[#8e24aa]'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'john-joao-sithole',
      href: 'https://www.linkedin.com/in/john-joao-sithole-562944303',
      color: 'from-[#8e24aa] to-[#e91e63]'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'juwiijones984',
      href: 'https://github.com/juwiijones984',
      color: 'from-[#e91e63] to-[#00BFA6]'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'South Africa',
      href: '#',
      color: 'from-[#00BFA6] to-[#00B8D9]'
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4 relative z-10 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-6 font-orbitron">
            <span className="bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] bg-clip-text text-transparent">
              Let's Connect
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] mx-auto mb-8" />
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Interested in collaborating or have a project in mind? I'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={index}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-[#00BFA6] transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl mb-2 text-[#00BFA6]">{item.label}</h3>
                <p className="text-gray-300 break-words">{item.value}</p>
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 max-w-3xl mx-auto">
            <h3 className="text-2xl mb-4 bg-gradient-to-r from-[#00BFA6] to-[#00B8D9] bg-clip-text text-transparent">
              Available for Opportunities
            </h3>
            <p className="text-gray-400 text-lg">
              Currently seeking full-time positions and freelance projects in software development and ICT.
              Let's build something amazing together!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
