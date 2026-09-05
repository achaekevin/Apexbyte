import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiTruck, FiPhone, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <>
      <Helmet>
        <title>Order Confirmed - Apexbyte Laptops Kenya</title>
      </Helmet>

      <div className="min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          {/* Animated Success Badge */}
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-emerald-500/20">
            <FiCheckCircle className="text-4xl text-emerald-600 dark:text-emerald-400" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Order Successfully Placed
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-3 mb-2">
            Asante Sana! Your Order is Confirmed
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
            We've received your order and our hardware bench technicians at Mocha Place are prepping your machine for dispatch.
          </p>

          {/* Order Details Card */}
          <Card className="p-6 sm:p-8 text-left mb-8 shadow-premium border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  Reference Order ID
                </span>
                <p className="font-mono text-lg sm:text-xl font-black text-primary-600 dark:text-primary-400">
                  {orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/dashboard/orders/${orderId}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <FiPackage /> View Order Status
                  </Button>
                </Link>
              </div>
            </div>

            {/* Delivery & Dispatch Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 text-lg">
                  <FiPackage />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Quality Inspection</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Thermal, SSD health & battery stress bench-test completed before sealing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 text-lg">
                  <FiTruck />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Swift Delivery</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Same-day rider delivery in Kisii Town. 24-hour Fargo/G4S courier countrywide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 text-lg">
                  <FaWhatsapp />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Instant Updates</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Real-time SMS and WhatsApp parcel tracking number sent directly to your phone.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Support Callout */}
          <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <FiPhone className="text-2xl text-primary-600 dark:text-primary-400 shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Need Help or Faster Showroom Collection?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Call or WhatsApp our Mocha Place technical dispatch team directly at <strong>+254 104 504 692</strong>.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/254104504692?text=Hello%20Apexbyte,%20I%20just%20placed%20order%20"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                <FaWhatsapp className="text-base" /> Chat on WhatsApp
              </Button>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop">
              <Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
                <FiShoppingBag /> Browse More Laptops
              </Button>
            </Link>
            <Link to="/dashboard/orders">
              <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
                Go to My Orders <FiArrowRight />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrderSuccess;
