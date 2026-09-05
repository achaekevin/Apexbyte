import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 transition-colors">
      {/* Top Value Assurance Ribbon */}
      <div className="border-b border-gray-200 dark:border-slate-800/80 bg-gray-200/40 dark:bg-slate-900/50 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xl shrink-0">
                <FiMapPin />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Showroom Pickup</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mocha Place, 2nd Flr, Kisii CBD</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl shrink-0">
                <FiShield />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">1-Year Warranty</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Authorized local service center support</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl shrink-0">
                <FiTruck />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Same-Day Delivery</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Kisii, Nyamira & Migori (Courier nationwide)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl shrink-0">
                <FiRefreshCw />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">7-Point Inspection</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Thermal, battery, SSD & screen verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Showroom Info (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                A
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Apex<span className="text-primary-600 dark:text-primary-400">byte</span>
                <span className="text-xs block font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase -mt-1">
                  Laptops Kenya • Kisii
                </span>
              </span>
            </Link>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              Kisii's authentic electronics hub for verified brand-new and certified business laptops. We bench-test every machine thoroughly before handover and provide direct technician support.
            </p>

            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="text-amber-500 mt-0.5 shrink-0" />
                <span>Shop S14, 2nd Floor, Mocha Place, Hospital Road, Kisii Town CBD</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiPhone className="text-emerald-500 shrink-0" />
                <a href="tel:+254104504692" className="hover:text-primary-600 dark:hover:text-white transition-colors font-medium">
                  +254 104 504 692
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaWhatsapp className="text-emerald-500 shrink-0" />
                <a
                  href="https://wa.me/254104504692"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                >
                  WhatsApp Tech Desk: 0104 504 692
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FiMail className="text-primary-500 shrink-0" />
                <a href="mailto:support@apexbyte.co.ke" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  support@apexbyte.co.ke
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FiClock className="text-gray-400 shrink-0" />
                <span>Mon–Fri: 8:30 AM – 6:30 PM | Sat: 9:00 AM – 5:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-4">
              Explore Laptops
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/shop?brand=hp" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  HP EliteBooks & Envy
                </Link>
              </li>
              <li>
                <Link to="/shop?brand=dell" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Dell Latitude & Vostro
                </Link>
              </li>
              <li>
                <Link to="/shop?brand=lenovo" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Lenovo ThinkPads
                </Link>
              </li>
              <li>
                <Link to="/shop?brand=apple" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Apple MacBooks
                </Link>
              </li>
              <li>
                <Link to="/shop?category=gaming" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  High Performance & Gaming
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Side-by-Side Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-4">
              Customer Desk
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/contact" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Showroom Location & Contact
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  The Apexbyte Story & Guarantee
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Buyer FAQs & Inspection
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Laptop Buying Guides (Kenya)
                </Link>
              </li>
              <li>
                <Link to="/contact#trade-in" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Trade-In & Upgrade Program
                </Link>
              </li>
              <li>
                <Link to="/dashboard/orders" className="hover:text-primary-600 dark:hover:text-white transition-colors">
                  Track Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-4">
              Payment & Dispatch
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              We accept M-Pesa, Bank Transfer, Card, and Cash on Delivery within Kisii Town.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-xs mb-1">
                  LIPA NA M-PESA
                </span>
                <span className="text-[11px] text-gray-600 dark:text-gray-300">
                  Buy Goods Till / Paybill available on delivery
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                <span className="block font-bold text-amber-600 dark:text-amber-400 text-xs mb-1">
                  COUNTRYWIDE PARCEL
                </span>
                <span className="text-[11px] text-gray-600 dark:text-gray-300">
                  Secured dispatch via Fargo Courier, Easy Coach, Transline Classic or G4S
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-200 dark:border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
          <p>
            &copy; {currentYear} <strong>Apexbyte Laptops Kenya</strong>. All rights reserved. Located at Mocha Place, Hospital Road, Kisii Town CBD.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-primary-600 dark:hover:text-gray-300 transition-colors">
              About Showroom
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-primary-600 dark:hover:text-gray-300 transition-colors">
              Contact Tech Desk
            </Link>
            <span>•</span>
            <Link to="/shop" className="hover:text-primary-600 dark:hover:text-gray-300 transition-colors">
              Laptops in Kisii
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
