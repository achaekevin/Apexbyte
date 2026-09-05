import { Helmet } from 'react-helmet-async';
import Card from '../components/ui/Card';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="Privacy policy, customer data protection, and cookie compliance at Apexbyte Laptops Kenya."
        />
      </Helmet>

      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full">
            Data Protection & Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-3 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: September 2026 • Compliant with the Kenya Data Protection Act, 2019
          </p>
        </div>

        <Card className="p-8 sm:p-10 space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              1. Information We Collect
            </h2>
            <p>
              When you purchase or browse laptops with Apexbyte Kenya (operating physically at Mocha Place, Kisii CBD and online at apexbyte.co.ke), we collect only necessary personal data including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Name, mobile phone number (for M-Pesa billing and courier dispatch SMS).</li>
              <li>Delivery address and shipping details.</li>
              <li>Encrypted authentication credentials (passwords are hashed with bcrypt; raw passwords are never logged or stored).</li>
              <li>Transaction reference IDs and order records.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              2. How We Use Your Data
            </h2>
            <p>
              Your personal information is used exclusively to fulfill orders, process warranties, dispatch parcels via verified couriers (such as Fargo Courier, Easy Coach, or G4S), and communicate critical security alerts. We do not sell or lease customer information to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              3. Payment Security & Lipa Na M-Pesa
            </h2>
            <p>
              Card and mobile payments are processed securely through certified gateway integrations (Stripe, Safaricom Daraja M-Pesa API, and PayPal). Apexbyte never stores credit card CVV codes or M-Pesa PIN numbers on its servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              4. Cookies and Session Storage
            </h2>
            <p>
              We utilize essential HTTP cookies and local storage to preserve your authenticated login session, shopping cart items, active comparison lists, and theme preferences (Dark/Light mode). You can configure your browser to clear cookies at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              5. Your Rights & Data Deletion
            </h2>
            <p>
              Under Kenya's Data Protection Act, you have the right to request a copy of all stored data, update inaccurate delivery records, or request complete account erasure by contacting our compliance desk at <strong>support@apexbyte.co.ke</strong>.
            </p>
          </section>
        </Card>
      </div>
    </>
  );
};

export default Privacy;
