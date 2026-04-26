import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[#0D0D0F] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-10 sm:mb-12">

          {/* Brand */}
          <div className="sm:col-span-1">
            <Link to="/" className="inline-block mb-3 sm:mb-4">
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                Kobac <span className="text-primary">Electronics</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 sm:mb-5 max-w-xs">
              Premium electronics and gadgets at your fingertips. Discover the future, today.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2.5 sm:gap-3">
              {[
                { label: 'X', href: '#', svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
                { label: 'IG', href: '#', svg: <><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></> },
                { label: 'TK', href: '#', svg: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.17 8.17 0 0 0 4.78 1.52V6.56a4.86 4.86 0 0 1-1.01.13z" /> },
              ].map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {svg}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop + Support in a 2-col row on mobile */}
          <div className="grid grid-cols-2 gap-8 sm:contents">
            {/* Shop */}
            <div>
              <h3 className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-3 sm:mb-4">Shop</h3>
              <ul className="space-y-2.5 sm:space-y-3 text-[12px] sm:text-[13px] text-gray-500">
                {[
                  { to: '/shop?category=Phone', label: 'Smartphones' },
                  { to: '/shop?category=Laptop', label: 'Laptops' },
                  { to: '/shop?category=Watch', label: 'Smartwatches' },
                  { to: '/shop?category=Gaming', label: 'Gaming' },
                  { to: '/shop', label: 'All Products' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2.5 sm:space-y-3 text-[12px] sm:text-[13px] text-gray-500">
                {[
                  { to: '/contact', label: 'Contact Us' },
                  { to: '/my-orders', label: 'Track Order' },
                  { to: '/contact', label: 'Shipping Info' },
                  { to: '/contact', label: 'Returns & Warranty' },
                ].map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[11px] sm:text-[12px] text-gray-600 text-center sm:text-left">
            © {year} Kobac Electronics. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-5 text-[11px] sm:text-[12px] text-gray-600">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
