import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Zap, Users, Store, Smartphone, Truck } from 'lucide-react';

const stats = [
  { label: 'Happy customers', value: '10k+', icon: Users },
  { label: 'Original products', value: '100%', icon: ShieldCheck },
  { label: 'Support', value: '24/7', icon: Zap },
];

const highlights = [
  { icon: Smartphone, title: 'Latest tech', text: 'We bring the newest releases first.' },
  { icon: Store, title: 'Trusted store', text: 'A physical and digital presence you can rely on.' },
  { icon: Truck, title: 'Local delivery', text: 'Fast, tracked delivery across Somalia.' },
];

const values = [
  {
    icon: ShoppingBag,
    title: 'Premium shopping experience',
    text: 'From browsing the site to unboxing your device, every step is built for your convenience.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    text: 'EVC Plus and other trusted local payment methods keep your money safe.',
  },
];

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const AboutPage = () => {
  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div {...fade} className="max-w-2xl mb-14 sm:mb-20">
          <h1 className="text-3xl sm:text-5xl font-bold text-fg tracking-tight mb-4">
            About <span className="text-primary">Kobac</span>
          </h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed">
            Somalia's destination for original, high-quality electronics. We bring the
            world's best technology to your doorstep with reliable service and local payment.
          </p>
        </motion.div>

        {/* Story */}
        <motion.div {...fade} className="grid md:grid-cols-2 gap-8 md:gap-12 mb-14 sm:mb-20">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-fg tracking-tight">Our story</h2>
            <div className="w-14 h-1 bg-primary rounded-full" />
            <p className="text-muted leading-relaxed">
              Kobac Electronics started as a small dream to give tech enthusiasts in the
              region a reliable place to buy authentic devices.
            </p>
            <p className="text-muted leading-relaxed">
              Today we are a trusted brand, working with global tech suppliers so that every
              phone, laptop and accessory you buy from us is genuine and backed by warranty.
            </p>
          </div>

          <div className="border border-line rounded-2xl bg-surface divide-y divide-line">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4 p-5">
                <div className="w-11 h-11 rounded-xl bg-surface-2 border border-line flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-fg">{title}</h3>
                  <p className="text-sm text-muted mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fade} className="grid grid-cols-3 gap-3 sm:gap-4 mb-14 sm:mb-20">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border border-line rounded-2xl bg-surface p-5 sm:p-6 text-center">
              <Icon className="w-5 h-5 text-muted mx-auto mb-3" />
              <p className="text-2xl sm:text-3xl font-bold text-fg">{value}</p>
              <p className="text-xs sm:text-sm text-muted mt-1">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div {...fade}>
          <h2 className="text-2xl font-bold text-fg tracking-tight mb-2">Why choose us</h2>
          <p className="text-muted mb-8">We don't just sell electronics, we sell peace of mind.</p>

          <div className="grid md:grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-line rounded-2xl bg-surface p-6">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-fg mb-1.5">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutPage;
