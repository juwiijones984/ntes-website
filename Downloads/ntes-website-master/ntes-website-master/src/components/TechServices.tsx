import { HardDrive, Settings, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function TechServices() {
  const hardwareServices = [
    "Laptop Screen Replacement",
    "Keyboard Replacement or Repair",
    "Battery Replacement",
    "Charging Port Repair",
    "Hard Drive (HDD/SSD) Upgrade or Replacement",
    "RAM Upgrade Replacement",
    "Motherboard Diagnostics and Repair",
    "Laptop Casing Repair",
    "Internal Cleaning (Fan/Dust Buildup)",
    "Cooling System Servicing",
    "Power Supply Unit (PSU) Replacement"
  ];

  const softwareServices = [
    "Operating System Installation (Windows, Linux, MacOS)",
    "System Upgrade and Optimization",
    "Virus, Malware, and Spyware Removal",
    "Data Backup and Recovery",
    "Software Installation (Microsoft Office, Antivirus, etc.)",
    "Driver Updates and Compatibility Fixes",
    "Boot Issues and Startup Error Troubleshooting",
    "Blue Screen (BSOD) Error Fixing",
    "Partitioning and Disk Formatting",
    "BIOS Update and Configuration",
    "Password Recovery and Reset",
    "Network Setup and Troubleshooting (Wi-Fi/LAN)"
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-100 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      
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
              <Settings className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">Comprehensive Tech Support</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Tech Services List
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hardware Services */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <HardDrive className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl bg-gradient-to-r from-blue-900 to-cyan-900 bg-clip-text text-transparent">
                  Hardware Upgrade and Repair
                </h3>
              </div>
              <div className="space-y-3">
                {hardwareServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start space-x-3 group/item"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-700 group-hover/item:text-blue-900 transition-colors">{service}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Software Services */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">
                  Software Services
                </h3>
              </div>
              <div className="space-y-3">
                {softwareServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start space-x-3 group/item"
                  >
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-700 group-hover/item:text-purple-900 transition-colors">{service}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}