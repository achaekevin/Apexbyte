import { Helmet } from 'react-helmet-async';
import Card from '../components/ui/Card';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="Terms and conditions, buyer agreements, warranty guidelines, and delivery policies at Apexbyte Laptops Kenya."
        />
      </Helmet>

      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full">
            Buyer Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-3 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Applicable to all online purchases and in-person transactions at Mocha Place, Kisii CBD
          </p>
        </div>

        <Card className="p-8 sm:p-10 space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              1. Overview & Pricing
            </h2>
            <p>
              By accessing Apexbyte or purchasing hardware products, you agree to comply with these terms. All prices displayed on our website are denominated in Kenya Shillings (KSh) and include applicable taxes unless specified otherwise. We reserve the right to correct typographical pricing errors before order fulfillment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              2. Hardware Authenticity & Condition
            </h2>
            <p>
              Apexbyte guarantees that all brand-new laptops are 100% authentic manufacturer units with genuine serial numbers. Certified pre-owned laptops undergo a mandatory 7-point hardware inspection (battery cycles, thermal paste, SSD health, display uniformity, keyboard responsiveness, ports, and chassis integrity).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              3. Payment & Title
            </h2>
            <p>
              Full payment must be confirmed via M-Pesa Buy Goods/Paybill, Card, or approved bank transfer prior to parcel release for courier transit. Cash on Delivery is strictly available within Kisii Town CBD upon physical handover. Title to the product passes to the buyer upon receipt and signature.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              4. Warranty & Support Terms
            </h2>
            <p>
              Brand-new laptops carry a 1-Year limited manufacturer or showroom warranty. Certified refurbished units include a 6-Month local technician warranty covering motherboard and internal component defects. Damage resulting from liquid spills, physical drops, or unapproved third-party tampering voids the warranty.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              5. Dispute Resolution
            </h2>
            <p>
              Any disputes arising under these terms shall be resolved under the laws of the Republic of Kenya. Buyers are encouraged to contact our technical management team at Mocha Place or via <strong>support@apexbyte.co.ke</strong> for amicable resolution.
            </p>
          </section>
        </Card>
      </div>
    </>
  );
};

export default Terms;
