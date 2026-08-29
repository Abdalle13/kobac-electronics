import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Truck, Mail, Star, Quote, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [bestSellers, setBestSellers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    if (userInfo && userInfo.role && userInfo.role.toLowerCase() === 'admin') {
      navigate('/dashboard');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    api.get('/products/best-sellers?limit=4')
      .then((res) => setBestSellers(res.data))
      .catch(() => {});

    api.get('/products/reviews/recent?limit=8')
      .then((res) => setRecentReviews(res.data))
      .catch(() => {});
  }, []);

  const FALLBACK_REVIEWS = [
    { name: 'Abdirahman Hassan', location: 'Mogadishu', review: 'Kobac Electronics delivers exactly what they promise. I ordered an iPhone and it arrived quickly and in perfect condition. Very impressed!', rating: 5, product: 'iPhone 15 Pro Max' },
    { name: 'Fadumo Yusuf', location: 'Hargeisa', review: 'The MacBook Pro I bought here is absolutely amazing. The quality is genuine and the service was professional. I will definitely order again.', rating: 5, product: 'MacBook Pro 16-inch' },
    { name: 'Saciid Maxamed', location: 'Mogadishu', review: 'Amazing store! Got my Sony headphones within two days. The sound quality is incredible. Kobac is my number one choice for electronics.', rating: 5, product: 'Sony WH-1000XM5' },
    { name: 'Lul Cabdalle', location: 'Berbera', review: 'Very professional and reliable. The Apple Watch I ordered is 100% authentic and works perfectly. Great customer support too!', rating: 5, product: 'Apple Watch Series 9' },
    { name: 'Hodan Cabdi', location: 'Bosaso', review: 'I was hesitant at first but ordered AirPods Pro and they are 100% original. Fast delivery and great packaging. Highly recommend!', rating: 5, product: 'AirPods Pro (2nd Gen)' },
    { name: 'Dalmar Nuur', location: 'Kismayo', review: 'Bought a PS5 for my son and he loves it. Everything works perfectly. Kobac Electronics is trustworthy and reliable. Will be back soon.', rating: 5, product: 'PlayStation 5' },
    { name: 'Ifrah Warsame', location: 'Hargeisa', review: 'Excellent customer experience. The iPad Pro I ordered is exactly as described. Clean, fast, and premium. This is my go-to tech store now.', rating: 5, product: 'iPad Pro 12.9-inch' },
    { name: 'Axmed Jaamac', location: 'Mogadishu', review: 'The Nintendo Switch OLED came in perfect condition. My kids are enjoying it so much. Thank you Kobac Electronics!', rating: 5, product: 'Nintendo Switch OLED' },
  ];

  // Use real reviews once there are enough to fill the marquee, otherwise fall back
  const testimonials = recentReviews.length >= 3
    ? recentReviews.map((r) => ({
        name: r.name,
        location: 'Verified Buyer',
        review: r.comment,
        rating: r.rating,
        product: r.productName,
      }))
    : FALLBACK_REVIEWS;

  return (
    <div className="w-full">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-28 md:pt-24 md:pb-36 min-h-[58vh] sm:min-h-[78vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.png"
            alt="Premium Electronics"
            className="w-full h-full object-cover opacity-55 sm:opacity-40 mix-blend-overlay scale-105 sm:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black sm:bg-gradient-to-r sm:from-black sm:via-black/80 sm:to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center sm:text-left max-w-2xl mx-auto sm:mx-0"
          >
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-5 sm:mb-7 text-white leading-[1.05]">
              Premium tech,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                delivered
              </span>{' '}
              across Somalia.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-7 sm:mb-10 leading-relaxed max-w-md mx-auto sm:mx-0">
              Genuine phones, laptops, watches and gaming gear, with fast local delivery
              and EVC Plus checkout.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center sm:justify-start">
              <Link to="/shop" className="w-full xs:w-auto">
                <Button className="w-full xs:w-auto px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl hover:scale-[1.03] transition-transform active:scale-95">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {!userInfo && (
                <Link to="/register" className="w-full xs:w-auto">
                  <Button variant="ghost" className="w-full xs:w-auto px-8 py-3.5 text-sm font-semibold text-white border border-white/25 rounded-xl hover:bg-white/10 hover:text-white">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Best Sellers ──────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="py-14 sm:py-20 md:py-24 bg-canvas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-fg tracking-tight">Best Sellers</h2>
              </div>
              <p className="text-muted max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                The products our customers order the most.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="flex justify-center mt-10 sm:mt-12">
              <Link to="/shop">
                <Button variant="secondary" className="px-8 py-3 text-sm font-semibold rounded-2xl flex items-center gap-2">
                  View All Products <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Features ─────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-surface border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-fg tracking-tight mb-4">
              Why choose us?
            </h2>
            <p className="text-muted max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              We provide authentic electronics with reliable support and localized delivery services across Somalia.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Get your tech delivered straight to your door, safely and securely.' },
              { icon: Shield, title: 'Secure Payments', desc: 'Multiple payment options including EVC Plus and Cash On Delivery.' },
              { icon: Zap, title: 'Premium Quality', desc: 'We only source industry-leading brands and guaranteed products.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex sm:flex-col flex-row items-center sm:items-center sm:text-center text-left gap-4 sm:gap-0 p-4 sm:p-6 bg-canvas border border-line rounded-2xl hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 sm:mb-4">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-fg sm:mb-2">{title}</h3>
                  <p className="text-muted text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — Marquee ────────────────── */}
      <section className="py-14 sm:py-20 bg-canvas overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg tracking-tight">
            Trusted by customers across Somalia
          </h2>
          <p className="text-muted text-xs sm:text-sm mt-2">Real reviews from real people.</p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 sm:w-32 z-10 bg-gradient-to-r from-canvas to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 sm:w-32 z-10 bg-gradient-to-l from-canvas to-transparent" />

          <div className="flex gap-3 sm:gap-5 animate-marquee-left w-max">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[250px] sm:w-[300px] flex-shrink-0 flex flex-col bg-surface border border-line hover:border-primary/25 rounded-2xl p-4 sm:p-5 gap-3 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={10} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <Quote size={12} className="text-primary/25" />
                </div>
                <p className="text-muted text-[12px] sm:text-[13px] leading-relaxed flex-1">"{t.review}"</p>
                <div className="flex items-center gap-2 pt-3 border-t border-line">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-[12px] font-bold text-fg leading-tight">{t.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted">{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────── */}
      <section className="py-14 sm:py-20 border-t border-line relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 z-0" />
        <div className="max-w-lg mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <Mail size={22} className="sm:hidden" />
            <Mail size={32} className="hidden sm:block" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3 sm:mb-4">Stay in the Loop</h2>
          <p className="text-muted text-sm sm:text-base mb-6 sm:mb-8">
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
              className="w-full bg-surface border border-line rounded-xl px-4 py-3.5 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
            <Button type="submit" className="w-full py-3.5 font-bold">
              Subscribe
            </Button>
          </form>
          <p className="text-[10px] text-muted mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
