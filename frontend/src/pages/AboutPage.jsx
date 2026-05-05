import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Zap, Users, Store, Smartphone } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: 'Happy Customers', value: '10k+', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Original Products', value: '100%', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Fast Delivery', value: '24/7', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="min-h-screen py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
              About <span className="text-primary">KOBAC</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              We are Somalia's premier destination for original, high-quality electronics. 
              Our mission is to bring the world's best technology right to your doorstep with unmatched reliability and service.
            </p>
          </motion.div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-black text-white tracking-tight">Our Story</h2>
            <div className="w-20 h-1.5 bg-primary rounded-full"></div>
            <p className="text-gray-400 leading-relaxed">
              Founded with a vision to revolutionize the electronics market in the region, Kobac Electronics started as a small dream to provide authentic devices to tech enthusiasts. 
            </p>
            <p className="text-gray-400 leading-relaxed">
              Today, we have grown into a trusted brand, partnering with global tech giants to ensure that every smartphone, laptop, and accessory you purchase from us is 100% genuine and backed by warranty.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex flex-col gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Latest Tech</h3>
                    <p className="text-sm text-gray-500 mt-1">We bring the newest releases first.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <Store className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Trusted Store</h3>
                    <p className="text-sm text-gray-500 mt-1">A physical and digital presence you can rely on.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass border border-white/5 rounded-3xl p-8 text-center shadow-xl hover:border-white/10 transition-colors"
            >
              <div className={`w-16 h-16 mx-auto rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Values Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white tracking-tight mb-6">Why Choose Us?</h2>
          <p className="text-gray-400 mb-12">We don't just sell electronics; we sell peace of mind.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <ShoppingBag className="w-8 h-8 text-primary mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Premium Shopping Experience</h4>
              <p className="text-sm text-gray-400 leading-relaxed">From browsing our sleek website to unboxing your new device, every step is designed for your convenience.</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <ShieldCheck className="w-8 h-8 text-primary mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-400 leading-relaxed">We support EVC Plus and other trusted local payment methods to ensure your money is always safe.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
