import { Helmet } from 'react-helmet-async';
import { FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import Card from '../components/ui/Card';

const Returns = () => {
  return (
    <>
      <Helmet>
        <title>Warranty, Returns & Refund Policy - Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="Learn about Apexbyte's 7-day replacement guarantee, 1-year warranty coverage, and hassle-free returns policy in Kenya."
        />
      </Helmet>

      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Buyer Protection Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-3 mb-2">
            Returns, Refunds & Warranty Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Transparent peace of mind for every laptop delivered from Mocha Place, Kisii
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <FiRefreshCw className="text-3xl text-primary-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">7-Day Swap Guarantee</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Immediate replacement if any unexpected hardware defect is discovered within 7 days of parcel delivery.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <FiShield className="text-3xl text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">1-Year Warranty</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Comprehensive internal hardware, motherboard, and display warranty backed by our certified technical team.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <FiTruck className="text-3xl text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">Return Shipping</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              If an item is defective upon arrival, Apexbyte covers the Fargo Courier return dispatch costs.
            </p>
          </Card>
        </div>

        <Card className="p-8 sm:p-10 space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              1. Return Eligibility
            </h2>
            <p>
              To qualify for a return or exchange:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>The claim must be initiated within <strong>7 days</strong> of confirmed delivery or showroom collection.</li>
              <li>The laptop must be in its original physical condition, including original charger, power brick, and packaging.</li>
              <li>Software modifications (e.g. BIOS flashing, unofficial OS alterations) must not have caused the fault.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              2. Technical Inspection & Verification
            </h2>
            <p>
              Returned machines are bench-inspected within 24–48 hours by our senior electronics engineers at Mocha Place, Kisii. Once the hardware fault is verified, the buyer can select between an immediate identical replacement, an upgrade, or a full refund via M-Pesa / original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              3. Refund Processing Times
            </h2>
            <p>
              Approved M-Pesa refunds are issued within 24 hours of inspection approval. Card refunds are remitted immediately and typically reflect on bank statements within 3–5 business days depending on the card issuer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              4. How to Initiate a Return or Claim
            </h2>
            <p>
              Contact our technical help desk via WhatsApp at <strong>+254 104 504 692</strong> with your Order Number and a brief description/video of the issue, or visit our showroom directly at <strong>Shop S14, 2nd Floor, Mocha Place, Kisii CBD</strong>.
            </p>
          </section>
        </Card>
      </div>
    </>
  );
};

export default Returns;
