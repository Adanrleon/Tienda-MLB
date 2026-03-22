import Link from 'next/link';
import { MlbLogo } from '../ui/mlb-logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <MlbLogo className="h-6 w-auto" />
              <span className="display-title text-xl text-slate-900 tracking-wider">
                MAJOR LEAGUE JERSEYS
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-7 text-slate-500">
              The premier digital storefront for authentic MLB jerseys. Dedicated to the fans, 
              the collectors, and the historians of America s pastime.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="caps-label">Collections</p>
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
              <Link href="/catalog" className="hover:text-mlb-red transition-colors">Authentic Elite</Link>
              <Link href="/catalog?category=Home" className="hover:text-mlb-red transition-colors">Home Series</Link>
              <Link href="/catalog?category=Road" className="hover:text-mlb-red transition-colors">Road Grit</Link>
              <Link href="/catalog?category=City Connect" className="hover:text-mlb-red transition-colors">City Connect</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="caps-label">Support</p>
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
              <Link href="/cart" className="hover:text-mlb-red transition-colors">Order Tracking</Link>
              <Link href="/cart" className="hover:text-mlb-red transition-colors">Sizing Guide</Link>
              <Link href="/cart" className="hover:text-mlb-red transition-colors">Shipping Policy</Link>
              <Link href="/cart" className="hover:text-mlb-red transition-colors">Returns</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="caps-label">Organization</p>
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
              <Link href="/login" className="hover:text-mlb-red transition-colors">Fan Account</Link>
              <Link href="/catalog" className="hover:text-mlb-red transition-colors">Team Licensing</Link>
              <Link href="/catalog" className="hover:text-mlb-red transition-colors">Corporate Sales</Link>
              <nav className="flex items-center gap-4 pt-4 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="MasterCard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-3" />
              </nav>
            </nav>
          </div>
        </div>
        
        <div className="mt-16 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Major League Jerseys. Not an official site of Major League Baseball. All trademarks are property of their respective owners.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
             <Link href="/" className="hover:text-slate-900 transition-colors">Privacy</Link>
             <Link href="/" className="hover:text-slate-900 transition-colors">Terms</Link>
             <Link href="/" className="hover:text-slate-900 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
