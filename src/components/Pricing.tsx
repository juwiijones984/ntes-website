import { FileText, Palette, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Pricing() {
  const documentation = [
    { name: "Business Profile (Company Overview)", regularPrice: "R450", specialPrice: "R315" },
    { name: "Business Proposal (For Clients/Investors)", regularPrice: "R650", specialPrice: "R455" },
    { name: "Business Plan (Detailed, with Financials)", regularPrice: "R1,200", specialPrice: "R840" },
    { name: "Business Pitch Deck (PowerPoint/Slides)", regularPrice: "R850", specialPrice: "R595" }
  ];

  const branding = [
    { name: "Flyer / Poster Design", regularPrice: "R200", specialPrice: "R140" },
    { name: "Business Cards Design", regularPrice: "R300", specialPrice: "R210", note: "(Includes Print-Ready File)" },
    { name: "Letterhead / Company Documents Design", regularPrice: "R250", specialPrice: "R175" },
    { name: "Logo Design", regularPrice: "R600", specialPrice: "R420" }
  ];

  const advanced = [
    { name: "Company Registration Assistance", regularPrice: "R950", specialPrice: "R665" },
    { name: "Website Starter Package (1-3 Pages)", regularPrice: "R1,500", specialPrice: "R1,050" },
    { name: "E-Commerce / Booking Website", regularPrice: "R3,500", specialPrice: "R2,450" },
    { name: "Social Media Setup & Branding", regularPrice: "R500", specialPrice: "R350", note: "Per Platform" }
  ];

  return (
    <section id="pricing" className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      
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
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">Special Offers Available</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-purple-900 bg-clip-text text-transparent">
            Business Solutions Price List
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
        </motion.div>

        {/* Business Documentation */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4 mb-8"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-4xl bg-gradient-to-r from-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Business Documentation
            </h3>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentation.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                  <h4 className="text-lg mb-4 text-gray-800">{item.name}</h4>
                  <div className="flex items-end justify-between">
                    <span className="text-gray-400 line-through text-sm">{item.regularPrice}</span>
                    <div className="text-right">
                      <div className="text-xs text-red-600 mb-1">Special Offer</div>
                      <div className="text-3xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        {item.specialPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Branding & Marketing */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4 mb-8"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-4xl bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">
              Branding & Marketing Materials
            </h3>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branding.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                  <h4 className="text-lg mb-4 text-gray-800">{item.name}</h4>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-gray-400 line-through text-sm">{item.regularPrice}</span>
                    <div className="text-right">
                      <div className="text-xs text-red-600 mb-1">Special Offer</div>
                      <div className="text-3xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        {item.specialPrice}
                      </div>
                    </div>
                  </div>
                  {item.note && <p className="text-sm text-gray-500 italic">{item.note}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Advanced Business Solutions */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4 mb-8"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-4xl bg-gradient-to-r from-emerald-900 to-teal-900 bg-clip-text text-transparent">
              Advanced Business Solutions
            </h3>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advanced.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                  <h4 className="text-lg mb-4 text-gray-800">{item.name}</h4>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-gray-400 line-through text-sm">{item.regularPrice}</span>
                    <div className="text-right">
                      <div className="text-xs text-red-600 mb-1">Special Offer</div>
                      <div className="text-3xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        {item.specialPrice}
                      </div>
                    </div>
                  </div>
                  {item.note && <p className="text-sm text-gray-500 italic">{item.note}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-40"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-10 rounded-3xl text-center shadow-2xl">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <p className="text-2xl">All prices are in South African Rand (ZAR)</p>
            <p className="text-xl text-blue-100 mt-2">Special prices available for limited time!</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}