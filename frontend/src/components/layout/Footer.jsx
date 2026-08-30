import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SOCIALS = [
  { label: 'X', href: 'https://x.com/ApdulahiHu34594', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'Instagram', href: 'https://www.instagram.com/zekovic__', node: <><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></> },
  { label: 'TikTok', href: 'https://www.tiktok.com/@zekovic25', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.17 8.17 0 0 0 4.78 1.52V6.56a4.86 4.86 0 0 1-1.01.13z' },
];

const FooterCol = ({ title, links }) => (
  <div>
    <h3 className="text-xs font-bold text-fg uppercase tracking-wide mb-4">{title}</h3>
    <ul className="space-y-2.5 text-[13px] text-muted">
      {links.map(({ to, label }) => (
        <li key={label}>
          <Link to={to} className="hover:text-fg transition-colors">{label}</Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const year = new Date().getFullYear();
  const { storeName } = useSelector((s) => s.settings);

  return (
    <footer className="border-t border-line bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-3">
              <span className="text-lg font-bold text-fg tracking-tight">
                KOBAC <span className="text-primary">Electronics</span>
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed mb-5 max-w-xs">
              {storeName || 'Kobac Electronics'} premium phones, laptops and gadgets with fast local delivery across Somalia.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ label, href, path, node }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-muted hover:text-fg hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={path ? 'currentColor' : 'none'} stroke={path ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {path ? <path d={path} /> : node}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { to: '/shop?category=Phone', label: 'Smartphones' },
              { to: '/shop?category=Laptop', label: 'Laptops' },
              { to: '/shop?category=Watch', label: 'Smartwatches' },
              { to: '/shop?category=Gaming', label: 'Gaming' },
              { to: '/shop', label: 'All Products' },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: '/about', label: 'About Us' },
              { to: '/contact', label: 'Contact' },
              { to: '/privacy', label: 'Privacy Policy' },
              { to: '/terms', label: 'Terms of Service' },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { to: '/my-orders', label: 'My Orders' },
              { to: '/wishlist', label: 'Wishlist' },
              { to: '/settings', label: 'Settings' },
              { to: '/contact', label: 'Support' },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-line pt-6 flex flex-col items-center gap-1.5 text-center text-[12px] text-muted">
          <p>
            Designed &amp; built by{' '}
            <a
              href="https://github.com/Abdalle13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg font-semibold hover:text-primary transition-colors"
            >
              Abdalle Hussein
            </a>
          </p>
          <p>© {year} Kobac Electronics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
