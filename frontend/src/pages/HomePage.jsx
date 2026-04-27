import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Truck, Mail, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (userInfo && userInfo.role && userInfo.role.toLowerCase() === 'admin') {
      navigate('/dashboard');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    dispatch(fetchProducts(''));
  }, [dispatch]);

  const newArrivals = products.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const REVIEWS = [
    { name: 'Abdirahman Hassan', location: 'Mogadishu', review: 'Kobac Electronics delivers exactly what they promise. I ordered an iPhone and it arrived quickly and in perfect condition. Very impressed!', rating: 5, product: 'iPhone 15 Pro Max' },
    { name: 'Fadumo Yusuf', location: 'Hargeisa', review: 'The MacBook Pro I bought here is absolutely amazing. The quality is genuine and the service was professional. I will definitely order again.', rating: 5, product: 'MacBook Pro 16-inch' },
    { name: 'Saciid Maxamed', location: 'Mogadishu', review: 'Amazing store! Got my Sony headphones within two days. The sound quality is incredible. Kobac is my number one choice for electronics.', rating: 5, product: 'Sony WH-1000XM5' },
    { name: 'Lul Cabdalle', location: 'Berbera', review: 'Very professional and reliable. The Apple Watch I ordered is 100% authentic and works perfectly. Great customer support too!', rating: 5, product: 'Apple Watch Series 9' },
    { name: 'Hodan Cabdi', location: 'Bosaso', review: 'I was hesitant at first but ordered AirPods Pro and they are 100% original. Fast delivery and great packaging. Highly recommend!', rating: 5, product: 'AirPods Pro (2nd Gen)' },
    { name: 'Dalmar Nuur', location: 'Kismayo', review: 'Bought a PS5 for my son and he loves it. Everything works perfectly. Kobac Electronics is trustworthy and reliable. Will be back soon.', rating: 5, product: 'PlayStation 5' },
    { name: 'Ifrah Warsame', location: 'Hargeisa', review: 'Excellent customer experience. The iPad Pro I ordered is exactly as described. Clean, fast, and premium. This is my go-to tech store now.', rating: 5, product: 'iPad Pro 12.9-inch' },
    { name: 'Axmed Jaamac', location: 'Mogadishu', review: 'The Nintendo Switch OLED came in perfect condition. My kids are enjoying it so much. Thank you Kobac Electronics!', rating: 5, product: 'Nintendo Switch OLED' },
  ];

  return (
    <div className="w-full">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-32 md:pt-16 md:pb-40">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.png"
            alt="Premium Electronics"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/60 via-[#0A0A0B]/75 to-[#0A0A0B] sm:bg-gradient-to-r sm:from-[#0A0A0B] sm:via-[#0A0A0B]/80 sm:to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center sm:text-left max-w-2xl mx-auto sm:mx-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-5 sm:mb-6">
              <Zap size={11} className="animate-pulse" /> Exclusive tech 2026
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 sm:mb-6 text-white leading-[0.88]">
              ELEVEN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0066FF]">
                BEYOND
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 sm:mb-10 leading-relaxed max-w-sm sm:max-w-md mx-auto sm:mx-0">
              Experience the pinnacle of innovation. From ultra-powerful laptops to the smartest watches, we define the standard of modern electronics.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center sm:justify-start">
              <Link to="/shop" className="w-full xs:w-auto">
                <Button className="w-full xs:w-auto px-8 py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl">
                  Explore Shop <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/shop" className="w-full xs:w-auto">
                <Button variant="ghost" className="w-full xs:w-auto px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white border border-white/10 rounded-xl hover:bg-white/5">
                  View Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-24 bg-gradient-to-b from-[#0A0A0B] to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter">NEW ARRIVALS</h2>
              <p className="text-gray-500 text-sm sm:text-base mt-1">The latest drops from the world's most innovative brands.</p>
            </div>
            <Link to="/shop" className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-white hover:text-blue-400 transition-colors shrink-0 ml-4">
              <span className="hidden xs:inline">Discover All</span>
              <div className="p-1.5 sm:p-2 rounded-full border border-white/10 group-hover:border-blue-500/50 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-shimmer h-60 sm:h-80 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-center text-sm">
              {error}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {newArrivals.map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
              {newArrivals.length === 0 && !loading && (
                <div className="col-span-full py-10 text-center text-gray-500 text-sm">
                  No products yet. Add some from the dashboard!
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-[var(--color-surface)]/30 border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
              Why choose us?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              We provide authentic electronics with reliable support and localized delivery services across Somalia.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Get your tech delivered straight to your door, safely and securely.' },
              { icon: Shield, title: 'Secure Payments', desc: 'Multiple payment options including EVC Plus and Cash On Delivery.' },
              { icon: Zap, title: 'Premium Quality', desc: 'We only source industry-leading brands and guaranteed products.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex sm:flex-col flex-row items-center sm:items-center sm:text-center text-left gap-4 sm:gap-0 p-4 sm:p-6 bg-[#0a0a0b] border border-[var(--color-border)] rounded-2xl hover:border-[#0066FF]/50 transition-colors">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0066FF]/10 text-[#0066FF] rounded-full flex items-center justify-center flex-shrink-0 sm:mb-4">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white sm:mb-2">{title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — Marquee ────────────────── */}
      <section className="py-14 sm:py-20 bg-[#0A0A0B] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">
            Trusted by customers across Somalia
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Real reviews from real people.</p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 sm:w-32 z-10 bg-gradient-to-r from-[#0A0A0B] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 sm:w-32 z-10 bg-gradient-to-l from-[#0A0A0B] to-transparent" />

          <div className="flex gap-3 sm:gap-5 animate-marquee-left w-max">
            {[...REVIEWS, ...REVIEWS].map((t, i) => (
              <div key={i} className="w-[250px] sm:w-[300px] flex-shrink-0 flex flex-col bg-[#111113] border border-white/[0.07] hover:border-primary/25 rounded-2xl p-4 sm:p-5 gap-3 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={10} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <Quote size={12} className="text-primary/25" />
                </div>
                <p className="text-gray-400 text-[12px] sm:text-[13px] leading-relaxed flex-1">"{t.review}"</p>
                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-[12px] font-bold text-white leading-tight">{t.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-600">{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────── */}
      <section className="py-14 sm:py-20 border-t border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0066FF]/5 z-0" />
        <div className="max-w-lg mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <Mail size={22} className="sm:hidden" />
            <Mail size={32} className="hidden sm:block" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Stay in the Loop</h2>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base mb-6 sm:mb-8">
            Subscribe for deals, new arrivals, and tech news!
          </p>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('Thanks for subscribing!');
              e.target.reset();
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-colors"
              required
            />
            <Button type="submit" className="w-full py-3.5 font-bold">
              Subscribe
            </Button>
          </form>
          <p className="text-[10px] text-gray-600 mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
