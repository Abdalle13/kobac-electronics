import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! Our support team will contact you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full">
      {/* Hero Header */}
      <section className="relative pt-10 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6"
          >
            GET IN <span className="text-primary tracking-widest">TOUCH</span>
          </motion.h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question about a product or an order? Our dedicated technical support team is here to help you navigate the future of electronics.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Information */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            <motion.div variants={itemVariants} className="glass border border-white/5 rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm mb-4">Official response channel</p>
              <a href="mailto:cabdale13yare@gmail.com" className="text-lg font-bold text-white hover:text-primary transition-colors underline decoration-primary/30 decoration-2 underline-offset-4">
                cabdale13yare@gmail.com
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="glass border border-white/5 rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Call Direct</h3>
              <p className="text-gray-400 text-sm mb-4">Direct technical line</p>
              <a href="tel:+2520619157381" className="text-lg font-bold text-white hover:text-green-400 transition-colors">
                +252 0619157381
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="glass border border-white/5 rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Visit Us</h3>
              <p className="text-gray-400 text-sm mb-4">Luxury Tech Showroom</p>
              <p className="text-white font-bold">Mogadishu, Somalia</p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="glass border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">SEND A MESSAGE</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      placeholder="John Doe" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <Input 
                      label="Email Address" 
                      placeholder="john@example.com" 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <Input 
                    label="Subject" 
                    placeholder="Technical Support / Order Inquiry" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Message</label>
                    <textarea 
                      rows="6"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all transition-colors resize-none"
                      placeholder="How can we help you today?"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="px-10 py-4 font-bold flex items-center gap-2 group">
                      Send Manifest <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Support Grid Extra */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-32">
          {[
            { icon: <Clock />, title: "24/7 Support", desc: "Always here for you" },
            { icon: <Globe />, title: "Global Shipping", desc: "Reach any destination" },
            { icon: <MessageSquare />, title: "Fast Response", desc: "Under 12 hours" },
            { icon: <Shield />, title: "Secure Tech", desc: "Protected shopping" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:border-primary/30 transition-all mb-4">
                {React.cloneElement(feature.icon, { size: 24 })}
              </div>
              <h4 className="text-white font-bold mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
