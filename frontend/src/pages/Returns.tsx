import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiChevronRight,
  FiHome,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import Card from '../components/ui/Card';

const Returns = () => {
  // Guarantee instant scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const quickLinks = [
    { id: 'eligibility', label: '1. 7-Day Eligibility' },
    { id: 'inspection', label: '2. Inspection Process' },
    { id: 'refunds', label: '3. Refund Timeframes' },
    { id: 'procedure', label: '4. How to File a Claim' },
    { id: 'exclusions', label: '5. What is Not Covered' },
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
        <title>Warranty, Returns &amp; Refund Policy | Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="Learn about Apexbyte's 7-day replacement guarantee, 1-year local warranty coverage, and hassle-free returns policy in Kenya."
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
              <span className="font-semibold text-gray-900 dark:text-white">Warranty &amp; Returns</span>
            </nav>
          </div>
        </div>

        {/* Hero Header Banner */}
        <section className="relative bg-gradient-to-b from-emerald-900/10 via-emerald-900/5 to-transparent dark:from-emerald-950/40 dark:via-gray-900/40 dark:to-transparent py-10 sm:py-14 border-b border-gray-200/80 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3.5 border border-emerald-200 dark:border-emerald-800">
              <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" /> 100% Buyer Protection Guarantee
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Warranty, Returns &amp; Refund Policy
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Transparent peace of mind for every machine delivered from Mocha Place, Kisii CBD or shipped countrywide.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Coverage: <strong>1-Year Local Technical Warranty</strong></span>
              <span>•</span>
              <span>Swap Window: <strong>7-Day Defect Exchange</strong></span>
              <span>•</span>
              <span>Diagnostics: <strong>Under 24 Hours</strong></span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-primary-500/30">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg mb-3">
                <FiRefreshCw />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                7-Day Swap Guarantee
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Immediate replacement if any unexpected hardware fault is verified within 7 days of parcel handover.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-amber-500/30">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg mb-3">
                <FiShield />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                1-Year Local Warranty
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Motherboard hardware, CPU/GPU, and display panels backed by our certified senior technicians in Kisii.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-emerald-500/30">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-3">
                <FiTruck />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                Complimentary Transit
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                If an item is defective upon arrival, Apexbyte covers the verified courier return transit costs across Kenya.
              </p>
            </Card>
          </div>

          {/* Quick Jump Directory */}
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2 px-1">
              Quick Section Directory:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickLinks.map((ql) => (
                <button
                  key={ql.id}
                  onClick={() => scrollToSection(ql.id)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                >
                  {ql.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Policy Document Card */}
          <Card className="p-5 sm:p-8 lg:p-10 bg-white dark:bg-gray-800 space-y-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed shadow-lg">
            {/* 1. Eligibility */}
            <section id="eligibility" className="scroll-mt-24 space-y-3 pt-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  1. 7-Day Return &amp; Exchange Eligibility
                </h2>
              </div>
              <p>
                To qualify for a 7-day hardware swap or return:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Window:</strong> The return request must be submitted within <strong>seven (7) calendar days</strong> from the date of confirmed courier delivery or showroom collection.
                </li>
                <li>
                  <strong>Condition:</strong> The laptop must be returned in the original physical state received, accompanied by the original power adapter, power brick, and packaging accessories.
                </li>
                <li>
                  <strong>Diagnostics:</strong> Software customizations (such as operating system updates or driver installs) do not void return eligibility, provided hardware components have not been physically disassembled.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 2. Inspection */}
            <section id="inspection" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  2. Technical Inspection &amp; Verification Protocol
                </h2>
              </div>
              <p>
                Every returned machine undergoes evaluation by our bench technicians at Mocha Place within 24 to 48 hours of intake:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-2">
                <li>
                  <strong>Verification:</strong> Technicians inspect motherboard rails, thermal readings, display panel connections, and storage SMART health.
                </li>
                <li>
                  <strong>Customer Choice:</strong> Once a factory fault is confirmed, you may choose an <strong>immediate identical replacement</strong>, an <strong>upgrade to a higher model</strong> (paying the difference), or a <strong>full refund</strong>.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 3. Refunds */}
            <section id="refunds" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  3. Refund Processing Timeframes
                </h2>
              </div>
              <p>
                Refunds are remitted directly to the original source of funds:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">
                    <FiClock /> Safaricom M-Pesa Refunds
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Approved M-Pesa refunds are disbursed directly to your mobile phone number within <strong>24 hours</strong> of inspection approval.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">
                    <FiClock /> Card &amp; Bank Refunds
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Card refunds are initiated immediately and reflect on your bank statement within <strong>3 to 5 business days</strong> depending on your card issuer.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 4. Procedure */}
            <section id="procedure" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  4. How to File a Return or Warranty Claim
                </h2>
              </div>
              <ol className="list-decimal pl-5 sm:pl-6 space-y-3">
                <li>
                  <strong>Contact the Tech Desk:</strong> Reach our workshop via WhatsApp or phone at <a href="tel:+254104504692" className="text-primary-600 font-bold hover:underline">+254 104 504 692</a> with your Order Number and serial number.
                </li>
                <li>
                  <strong>Describe the Issue:</strong> Share a 15-second video or photo showing the hardware symptom.
                </li>
                <li>
                  <strong>Handover or Courier Drop-off:</strong> Visit our showroom in Kisii (Mocha Place, 2nd Floor) or drop the parcel off at your local registered Fargo Courier / Easy Coach branch using our return account code.
                </li>
                <li>
                  <strong>Resolution:</strong> Receive regular SMS/WhatsApp updates as your machine is tested, repaired, or swapped.
                </li>
              </ol>
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* 5. Exclusions */}
            <section id="exclusions" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  5. Non-Covered Exclusions &amp; Void Conditions
                </h2>
              </div>
              <p>
                The following incidents are excluded from warranty coverage:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 text-xs sm:text-sm">
                <li>Accidental physical impact damage, cracked screens from falls, or chassis bending.</li>
                <li>Liquid ingress, tea/coffee spills, or corrosion resulting from liquid submersion.</li>
                <li>Electrical surge damage caused by charging via ungrounded domestic sockets or faulty extension cables.</li>
                <li>Unauthorized tampering or disassembly by unqualified third-party technicians.</li>
              </ul>
            </section>
          </Card>

          {/* Bottom Navigation Helper */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs sm:text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Need to check our buyer agreement terms and data protection policies?
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
                to="/privacy"
                className="font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Privacy Policy</span> <FiChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Returns;
