import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiChevronRight,
  FiHome,
  FiDollarSign,
  FiMapPin,
} from 'react-icons/fi';
import Card from '../components/ui/Card';

const Terms = () => {
  // Guarantee instant scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const quickLinks = [
    { id: 'overview', label: '1. Overview & Pricing' },
    { id: 'authenticity', label: '2. Authenticity & Inspection' },
    { id: 'payment', label: '3. Payment & Title' },
    { id: 'shipping', label: '4. Shipping & Transit' },
    { id: 'warranty', label: '5. Warranty Terms' },
    { id: 'returns', label: '6. Returns & Refunds' },
    { id: 'disputes', label: '7. Governing Law' },
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
        <title>Terms & Conditions | Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="Terms and conditions, buyer agreements, warranty guidelines, and delivery policies at Apexbyte Laptops Kenya. Operating at Mocha Place, Kisii CBD."
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
              <span className="font-semibold text-gray-900 dark:text-white">Terms &amp; Conditions</span>
            </nav>
          </div>
        </div>

        {/* Hero Header Banner */}
        <section className="relative bg-gradient-to-b from-primary-900/10 via-primary-900/5 to-transparent dark:from-primary-950/40 dark:via-gray-900/40 dark:to-transparent py-10 sm:py-14 border-b border-gray-200/80 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3.5 border border-primary-200 dark:border-primary-800">
              <FiShield className="text-primary-600 dark:text-primary-400" /> Official Buyer Agreement
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Terms &amp; Conditions of Service
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Standard commercial agreements governing laptop sales, showroom pickups at Mocha Place (Kisii), and insured transit nationwide.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Effective Date: <strong>September 1, 2026</strong></span>
              <span>•</span>
              <span>Governing Jurisdiction: <strong>Laws of Kenya</strong></span>
              <span>•</span>
              <span>Applicability: <strong>In-Store &amp; Online Orders</strong></span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Trust Guarantees Highlights (3 Pillars) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-primary-500/30">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg mb-3">
                <FiCheckCircle />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Genuine Hardware Guarantee
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Brand-new models carry authentic factory serial numbers; certified pre-owned units pass our strict 7-point bench test.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-amber-500/30">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg mb-3">
                <FiDollarSign />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Transparent KSh Pricing
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Prices include all taxes with no unexpected surcharge at checkout. M-Pesa payment confirmations generate instant digital receipts.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-emerald-500/30">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-3">
                <FiTruck />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Transit Insurance &amp; Tracking
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Parcels dispatched via courier partners are insured and waybill-tracked until you inspect and sign upon collection.
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

          {/* Detailed Terms Document Card */}
          <Card className="p-5 sm:p-8 lg:p-10 bg-white dark:bg-gray-800 space-y-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed shadow-lg">
            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24 space-y-3 pt-2">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  1. Overview &amp; Commercial Pricing Terms
                </h2>
              </div>
              <p>
                These Terms and Conditions constitute a legally binding agreement between you (&ldquo;Customer&rdquo;, &ldquo;Buyer&rdquo;) and <strong>Apexbyte Laptops Kenya</strong> (&ldquo;Apexbyte&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), operating physically at <strong>Shop S14, 2nd Floor, Mocha Place, Hospital Road, Kisii Town CBD</strong> and online at <strong>apexbyte.co.ke</strong>.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Currency:</strong> All prices displayed on our website are denominated in <strong>Kenya Shillings (KES / KSh)</strong> and include statutory value-added levies where applicable.
                </li>
                <li>
                  <strong>Price Verification:</strong> While we endeavor to ensure 100% catalog pricing accuracy, in the event of an obvious technical typographical error, we reserve the right to contact the buyer before shipment to correct the error or cancel and refund the order immediately.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 2. Authenticity */}
            <section id="authenticity" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  2. Hardware Authenticity &amp; Quality Inspection
                </h2>
              </div>
              <p>
                We maintain an uncompromising zero-tolerance policy towards counterfeit, stolen, or gray-market equipment:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Brand-New Units:</strong> Sealed manufacturer retail boxes with authentic serial numbers verifiable on official OEM portals (Apple, HP PartSurfer, Dell Service Tag, Lenovo Warranty Lookup).
                </li>
                <li>
                  <strong>Certified Pre-Owned Units:</strong> Grade-A clean machines that undergo our proprietary <strong>7-Point Technician Diagnostic Bench Test</strong> (battery cycle retention $\ge 80\%$, display panel color uniformity, NVMe SMART wear level, thermal paste application, keyboard switches, port integrity, and chassis inspection).
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 3. Payment */}
            <section id="payment" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  3. Payment Terms, Title &amp; Risk of Loss
                </h2>
              </div>
              <p>
                Payment must be verified prior to hardware release or courier dispatch:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Accepted Payment Methods:</strong> Safaricom Lipa Na M-Pesa (STK Push &amp; Buy Goods), Credit/Debit Cards (Visa &amp; Mastercard via 3D-Secure), and approved electronic bank fund transfers (EFT/RTGS).
                </li>
                <li>
                  <strong>Cash on Delivery (COD):</strong> Strictly restricted to deliveries within <strong>Kisii Town CBD</strong> where a verified Apexbyte rider physically handovers the machine against immediate M-Pesa confirmation.
                </li>
                <li>
                  <strong>Transfer of Title:</strong> Title and property in the purchased products pass to the buyer upon full payment clearance and customer signature on the delivery dispatch note or courier waybill.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 4. Shipping */}
            <section id="shipping" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  4. Shipping, Transit &amp; Showroom Collection
                </h2>
              </div>
              <p>
                We operate multiple flexible fulfillment options:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Showroom Walk-in Collection:</strong> You may inspect, power on, benchmark, and collect your machine in person at Mocha Place, 2nd Floor, Kisii CBD at zero delivery fee.
                </li>
                <li>
                  <strong>Same-Day Local Delivery:</strong> Within Kisii CBD, Milimani, Nyanchwa, Daraja Mbili, and Jogoo: orders confirmed before 4:00 PM are delivered via direct motorcycle courier within 2–3 hours. Free for orders above KSh 50,000.
                </li>
                <li>
                  <strong>Nationwide Courier Transit:</strong> For Nairobi, Mombasa, Kisumu, Eldoret, Nakuru, and all other Kenyan counties, machines are securely bubble-wrapped, boxed, and dispatched through registered courier partners (Fargo Courier, Easy Coach, Transline Classic, or G4S) within 24 hours. A tracking waybill number is sent immediately via SMS and WhatsApp.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 5. Warranty */}
            <section id="warranty" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  5. Local Technical Warranty Coverage
                </h2>
              </div>
              <p>
                Every laptop purchased is covered by our comprehensive service warranty:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>12-Month Comprehensive Coverage:</strong> Covers motherboard hardware, GPU/CPU architecture, display matrix failure, keyboard controller, and original charging circuitry against manufacturing defects.
                </li>
                <li>
                  <strong>Free Lifetime Support:</strong> Free OS driver re-installations, cleanings, and diagnostic evaluations at our Kisii workshop for the lifetime of the laptop.
                </li>
                <li>
                  <strong>Exclusions &amp; Void Conditions:</strong> Warranty is voided by intentional physical impact (cracked screens from drops), liquid immersion or beverage spills, power surges resulting from ungrounded sockets, or unapproved third-party technician disassembly without prior Apexbyte authorization.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 6. Returns */}
            <section id="returns" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  6. 7-Day Replacement &amp; Return Policy
                </h2>
              </div>
              <p>
                In compliance with Kenyan Consumer Protection principles:
              </p>
              <p className="text-xs sm:text-sm">
                If an unexpected hardware fault arises within <strong>7 calendar days</strong> of receiving your machine, contact our tech desk immediately. Upon verification by our bench technician within 24 hours, you are entitled to an immediate identical swap, store upgrade credit, or full refund. Consult our full <Link to="/returns" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Warranty &amp; Returns Policy</Link> for detailed eligibility criteria.
              </p>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 7. Disputes */}
            <section id="disputes" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  7. Governing Law &amp; Dispute Resolution
                </h2>
              </div>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the <strong>Laws of the Republic of Kenya</strong>. Any dispute arising out of or in connection with this agreement shall first be submitted to good-faith informal negotiation with Apexbyte management before resort to judicial arbitration in Kisii County courts.
              </p>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-850">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm mb-1">
                  <FiMapPin className="text-primary-600" /> Store Management Contacts
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Apexbyte Laptops Kenya • Shop S14, 2nd Floor, Mocha Place, Hospital Road, Kisii CBD<br />
                  Direct Telephone: <a href="tel:+254104504692" className="text-primary-600 hover:underline font-semibold">+254 104 504 692</a><br />
                  Customer Email: <a href="mailto:support@apexbyte.co.ke" className="text-primary-600 hover:underline font-semibold">support@apexbyte.co.ke</a>
                </p>
              </div>
            </section>
          </Card>

          {/* Bottom Navigation Helper */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/40 text-xs sm:text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Need to review how we protect your personal shopping data?
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/privacy"
                className="font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Privacy Policy</span> <FiChevronRight size={14} />
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

export default Terms;
