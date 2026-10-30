import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiChevronRight,
  FiHome,
  FiMail,
  FiMapPin,
  FiServer,
} from 'react-icons/fi';
import Card from '../components/ui/Card';

const Privacy = () => {
  // Guarantee instant scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const quickLinks = [
    { id: 'collection', label: '1. Information We Collect' },
    { id: 'usage', label: '2. How We Use Data' },
    { id: 'payment', label: '3. Payment & M-Pesa Security' },
    { id: 'cookies', label: '4. Cookies & Sessions' },
    { id: 'retention', label: '5. Storage & Retention' },
    { id: 'rights', label: '6. Your Legal Rights' },
    { id: 'contact', label: '7. Compliance Contact' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy | Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="Privacy policy, customer data protection, and cookie compliance at Apexbyte Laptops Kenya. Fully compliant with Kenya Data Protection Act 2019."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors pb-16">
        {/* Breadcrumb Navigation Bar */}
        <div className="bg-white dark:bg-gray-850 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 gap-1.5 flex-wrap">
              <Link
                to="/"
                className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                <FiHome size={14} />
                <span>Home</span>
              </Link>
              <FiChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Legal &amp; Policy</span>
              <FiChevronRight size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">Privacy Policy</span>
            </nav>
          </div>
        </div>

        {/* Hero Header Banner */}
        <section className="relative bg-gradient-to-b from-primary-900/10 via-primary-900/5 to-transparent dark:from-primary-950/40 dark:via-gray-900/40 dark:to-transparent py-10 sm:py-14 border-b border-gray-200/80 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3.5 border border-primary-200 dark:border-primary-800">
              <FiShield className="text-primary-600 dark:text-primary-400" /> Kenya Data Protection Act 2019
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Transparent, secure, and compliant data practices for every laptop buyer across Kisii and throughout Kenya.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Effective Date: <strong>September 1, 2026</strong></span>
              <span>•</span>
              <span>Jurisdiction: <strong>Republic of Kenya</strong></span>
              <span>•</span>
              <span>Version: <strong>2.4</strong></span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Trust Guarantees Highlights (3 Pillars) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-emerald-500/30">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-3">
                <FiCheckCircle />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Zero Third-Party Selling
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Your personal details, contact numbers, and delivery addresses are never leased, sold, or shared with data brokers.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-blue-500/30">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg mb-3">
                <FiLock />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Encrypted Credentials
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                All passwords are cryptographically salted and hashed using standard bcrypt algorithms. Raw passwords cannot be read by staff.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-amber-500/30">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg mb-3">
                <FiServer />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Daraja M-Pesa Isolation
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Transactions are handled through direct Safaricom STK Push and card tokenization. We never see or store your M-Pesa PIN.
              </p>
            </Card>
          </div>

          {/* Quick Jump Navigation Bar */}
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2 px-1">
              Quick Section Directory:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickLinks.map((ql) => (
                <button
                  key={ql.id}
                  onClick={() => scrollToSection(ql.id)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left"
                >
                  {ql.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Policy Document Card */}
          <Card className="p-5 sm:p-8 lg:p-10 bg-white dark:bg-gray-800 space-y-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed shadow-lg">
            {/* 1. Collection */}
            <section id="collection" className="scroll-mt-24 space-y-3 pt-2">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  1. Information We Collect
                </h2>
              </div>
              <p>
                When you visit, register, or order laptops with Apexbyte Kenya (operating physically at <strong>Shop S14, 2nd Floor, Mocha Place, Hospital Road, Kisii Town CBD</strong> and online at <strong>apexbyte.co.ke</strong>), we collect only information strictly necessary to fulfill your technical orders:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Contact &amp; Identification Data:</strong> Full name, telephone number (for M-Pesa prompt transmission, delivery rider dispatch, and parcel tracking updates), and email address.
                </li>
                <li>
                  <strong>Delivery &amp; Logistics Data:</strong> Physical residential address, office location, town, or selected courier collection parcel depot (e.g. Fargo Courier, Easy Coach, Transline Classic, or G4S depot).
                </li>
                <li>
                  <strong>Authentication Credentials:</strong> Email and cryptographically salted, hashed passwords. Apexbyte administrators and technicians have no ability to view your plaintext password.
                </li>
                <li>
                  <strong>Device &amp; Hardware Preferences:</strong> Saved comparison items, wishlist laptops, technical configurations selected (RAM/SSD capacity), and customer showroom visit logs.
                </li>
                <li>
                  <strong>Financial Transaction References:</strong> Safaricom M-Pesa transaction codes (e.g., <code>SLK489XYZ</code>), payment timestamps, order totals in KSh, and checkout request identifiers.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 2. Usage */}
            <section id="usage" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  2. How We Use Your Personal Data
                </h2>
              </div>
              <p>
                Your data is collected and processed under lawful bases stipulated under Section 30 of the Kenya Data Protection Act, 2019:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Order Fulfillment:</strong> Validating stock availability, allocating physical machines from our showroom inventory, configuring custom RAM or NVMe storage expansions, and dispatching couriers.
                </li>
                <li>
                  <strong>Warranty Lifecycle Management:</strong> Registering your 1-Year Local Technical Warranty against the manufacturer serial number on your motherboard and issuing repair claim tokens.
                </li>
                <li>
                  <strong>Payment Verification:</strong> Verifying Daraja STK Push callbacks and bank settlement confirmations to mark your invoice paid.
                </li>
                <li>
                  <strong>Customer Service &amp; Technical Support:</strong> Communicating dispatch waybills via SMS/WhatsApp or diagnosing hardware troubleshooting questions through our technicians.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 3. Payment Security */}
            <section id="payment" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  3. Payment Security &amp; Safaricom Daraja M-Pesa Safety
                </h2>
              </div>
              <p>
                Financial security is our highest priority:
              </p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-2 text-xs sm:text-sm">
                <p>
                  🔒 <strong>Lipa Na M-Pesa STK Push:</strong> Payment triggers communicate directly with Safaricom Daraja API over HTTPS TLS 1.3 encrypted tunnels. Your M-Pesa PIN is entered directly into your Safaricom SIM Toolkit on your own handset and is never transmitted to, viewed, or stored on Apexbyte servers.
                </p>
                <p>
                  💳 <strong>Card &amp; Bank Payments:</strong> Card payments are handled by PCI-DSS Level 1 certified processors. We do not store 16-digit credit card numbers, expiration dates, or 3-digit CVV security codes.
                </p>
              </div>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 4. Cookies */}
            <section id="cookies" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  4. Cookies &amp; Local Storage Usage
                </h2>
              </div>
              <p>
                We use strictly functional browser cookies and HTML5 local storage:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Session &amp; Authentication:</strong> Encrypted JWT tokens to keep you logged in to your account across browser tabs.
                </li>
                <li>
                  <strong>Shopping Cart Persistence:</strong> Remembering the laptops added to your shopping cart so you do not lose items when navigating.
                </li>
                <li>
                  <strong>Hardware Comparison Store:</strong> Remembering up to 4 laptops selected in the side-by-side spec comparison matrix.
                </li>
                <li>
                  <strong>Visual Appearance:</strong> Remembering your preference between Light Mode, Dark Mode, and System Theme.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 5. Retention */}
            <section id="retention" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  5. Data Retention &amp; Protection Safeguards
                </h2>
              </div>
              <p>
                Order invoices and serial-number warranty registrations are preserved for seven (7) years to satisfy Kenya Revenue Authority (KRA) commercial record-keeping obligations and to honor lifetime technical support. Data is housed in secure, firewall-protected relational databases with automated daily backups.
              </p>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 6. Legal Rights */}
            <section id="rights" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  6. Your Rights Under Kenyan Data Protection Laws
                </h2>
              </div>
              <p>
                Pursuant to Part IV of the Kenya Data Protection Act, you possess the following rights:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li><strong>Right of Access:</strong> Request a full copy of all personal records associated with your account.</li>
                <li><strong>Right to Rectification:</strong> Promptly update out-of-date phone numbers or delivery addresses.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request permanent account deletion where continuing retention is not legally required by tax or warranty law.</li>
                <li><strong>Right to Object:</strong> Opt out of non-essential promotional SMS or email announcements at any time.</li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 7. Contact */}
            <section id="contact" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  7. Contact Our Data Protection Desk
                </h2>
              </div>
              <p>
                To exercise any data rights or submit compliance questions, reach our compliance team directly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-850">
                  <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm mb-1">
                    <FiMapPin className="text-primary-600" /> Physical Showroom Address
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Apexbyte Laptops Kenya<br />
                    Shop S14, 2nd Floor, Mocha Place<br />
                    Hospital Road, Kisii CBD, Kenya
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-850">
                  <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm mb-1">
                    <FiMail className="text-primary-600" /> Compliance Desk
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Email: <a href="mailto:privacy@apexbyte.co.ke" className="text-primary-600 hover:underline">privacy@apexbyte.co.ke</a><br />
                    Support: <a href="mailto:support@apexbyte.co.ke" className="text-primary-600 hover:underline">support@apexbyte.co.ke</a><br />
                    Phone: <a href="tel:+254104504692" className="text-primary-600 hover:underline">+254 104 504 692</a>
                  </p>
                </div>
              </div>
            </section>
          </Card>

          {/* Bottom Navigation Helper */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/40 text-xs sm:text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Need to review our buyer terms and hardware warranty coverage?
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/terms"
                className="font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Terms &amp; Conditions</span> <FiChevronRight size={14} />
              </Link>
              <span>•</span>
              <Link
                to="/returns"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Warranty &amp; Returns</span> <FiChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
