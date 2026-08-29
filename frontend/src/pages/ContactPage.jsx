import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Orders within Mogadishu are usually delivered within 1–2 days. Other regions in Somalia typically take 2–5 days depending on location.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'EVC Plus (mobile money) and Cash on Delivery. For EVC Plus you confirm the payment on your phone with your PIN — we never see or store it.',
  },
  {
    q: 'Is delivery free?',
    a: 'Delivery is free on orders at or above the free-shipping threshold shown at checkout. Smaller orders have a small flat delivery fee.',
  },
  {
    q: 'What if my item is faulty or not as described?',
    a: 'Contact us as soon as it arrives and we will arrange a replacement or refund. Products also carry the manufacturer’s warranty where applicable.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes — open "My Orders" in your account to see the status and delivery progress of every order.',
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [support, setSupport] = useState({
    supportEmail: 'cabdale13yare@gmail.com',
    supportPhone: '+252 61 XXXXXXX',
    storeName: 'Kobac Electronics',
  });

  useEffect(() => {
    api.get('/settings')
      .then((res) => setSupport((s) => ({ ...s, ...res.data })))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('sending');
    try {
      const { data } = await api.post('/contact', formData);
      setStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success(data.message || 'Message sent!');
    } catch (err) {
      setStatus('idle');
      setErrorMsg(err.response?.data?.message || 'Could not send your message. Please try again.');
    }
  };

  const contactCards = [
    {
      icon: Mail,
      accent: 'text-primary bg-primary/10',
      title: 'Email',
      value: support.supportEmail,
      href: `mailto:${support.supportEmail}`,
    },
    {
      icon: Phone,
      accent: 'text-green-500 bg-green-500/10',
      title: 'Phone',
      value: support.supportPhone,
      href: `tel:${support.supportPhone.replace(/\s/g, '')}`,
    },
    {
      icon: MapPin,
      accent: 'text-purple-500 bg-purple-500/10',
      title: 'Location',
      value: 'Mogadishu, Somalia',
      href: null,
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4"
          >
            Get in touch
          </motion.h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Questions about a product, an order, or a payment? Send us a message and the {support.storeName} team
            will get back to you within one business day.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Contact info + hours */}
          <div className="lg:col-span-2 space-y-4">
            {contactCards.map((c) => {
              const Wrapper = c.href ? 'a' : 'div';
              return (
                <Wrapper
                  key={c.title}
                  {...(c.href ? { href: c.href } : {})}
                  className={`flex items-center gap-4 glass border border-white/5 rounded-2xl p-5 transition-colors ${
                    c.href ? 'hover:border-white/15' : ''
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.accent}`}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{c.title}</p>
                    <p className="text-white font-semibold truncate">{c.value}</p>
                  </div>
                </Wrapper>
              );
            })}

            <div className="glass border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Support Hours</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Saturday – Thursday</span><span className="text-white font-medium">8:00 – 22:00</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Friday</span><span className="text-white font-medium">14:00 – 22:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="glass border border-white/5 rounded-3xl p-6 sm:p-8">
              {status === 'sent' ? (
                <div className="text-center py-10">
                  <div className="inline-flex w-14 h-14 rounded-full bg-green-500/15 text-green-400 items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Message sent</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Thanks for reaching out. We’ve emailed you a confirmation and will reply within one business day.
                  </p>
                  <Button variant="secondary" onClick={() => setStatus('idle')}>Send another message</Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Send a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        placeholder="Your name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Subject"
                      placeholder="Order inquiry, product question, ..."
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                    <div className="flex flex-col mb-5">
                      <label className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Message</label>
                      <textarea
                        rows="6"
                        required
                        maxLength={5000}
                        placeholder="How can we help?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all resize-none"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {errorMsg}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full sm:w-auto px-8 py-3 font-bold flex items-center justify-center gap-2"
                    >
                      {status === 'sending' ? 'Sending...' : <>Send Message <Send className="w-4 h-4" /></>}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 sm:mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
                >
                  <span className="text-white font-semibold text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1 text-gray-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
