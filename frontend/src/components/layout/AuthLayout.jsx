import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

const POINTS = [
  { icon: ShieldCheck, text: 'Genuine products, backed by warranty' },
  { icon: Truck, text: 'Fast local delivery across Somalia' },
  { icon: Sparkles, text: 'EVC Plus and Cash on Delivery checkout' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex-grow w-full grid lg:grid-cols-2">
    {/* Brand panel — desktop only */}
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-blue-700 text-white p-12 xl:p-16">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        KOBAC <span className="text-white/70">Electronics</span>
      </Link>
      <div>
        <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-8">
          Premium tech,<br />delivered across Somalia.
        </h2>
        <ul className="space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-white/90">
              <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Icon size={17} />
              </span>
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-white/50">© {new Date().getFullYear()} Kobac Electronics</p>
    </div>

    {/* Form panel */}
    <div className="flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 bg-canvas">
      <div className="w-full max-w-sm">
        <Link to="/" className="lg:hidden inline-block text-lg font-bold tracking-tight text-fg mb-8">
          KOBAC <span className="text-primary">Electronics</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1.5 mb-7">{subtitle}</p>}

        {children}

        {footer && (
          <div className="mt-8 pt-6 border-t border-line text-center text-sm text-muted">
            {footer}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default AuthLayout;
