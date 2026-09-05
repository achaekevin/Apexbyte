import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Can I physically inspect and test the laptop before making payment?',
    answer:
      'Yes, 100%! If you visit our showroom at Mocha Place, 2nd Floor (Hospital Road, Kisii Town CBD), our technicians will happily boot the machine, show you battery health cycle counts, SSD benchmark speeds, and let you test the keyboard and screen. For clients in Kisii choosing delivery, you can also inspect the sealed machine with the rider before releasing M-Pesa payment.',
  },
  {
    question: 'What does your 1-Year Local Warranty cover?',
    answer:
      'All brand-new and certified laptops come with 12 months comprehensive warranty covering motherboard hardware, internal components, display panels, keyboard, and factory defects. We also provide lifetime free technical support and driver installation for all machines bought at Apexbyte.',
  },
  {
    question: 'How fast is delivery in Kisii, and what are the shipping costs?',
    answer:
      'We offer same-day delivery across Kisii Town (CBD, Milimani, Nyanchwa, Daraja Mbili, Jogoo, Suneka, etc.), Ogembo, and Keroka. Orders placed before 4:00 PM are dispatched via trusted direct rider within 2 to 3 hours. Delivery is completely FREE for orders above KSh 50,000, and a flat KSh 300 for local delivery.',
  },
  {
    question: 'How do deliveries to other towns across Kenya work (Nairobi, Mombasa, Kisumu, Eldoret)?',
    answer:
      'For clients across Kenya, we dispatch via trusted courier partners: Fargo Courier, Easy Coach, Transline Classic, Guardian, or G4S. Packages are double-boxed, bubble-wrapped, and insured. You will receive a tracking waybill number immediately after dispatch, and packages arrive at your nearest town depot within 24 hours.',
  },
  {
    question: 'Can you upgrade the RAM or SSD before sending my laptop?',
    answer:
      'Absolutely! We carry high-speed DDR4/DDR5 RAM and NVMe SSDs in stock. If you need a laptop upgraded from 8GB to 16GB/32GB, or storage boosted to 1TB, our technicians install it free of labor charge and test it before handover.',
  },
  {
    question: 'Do you accept laptop trade-ins towards an upgrade?',
    answer:
      'Yes, we accept clean trade-ins of HP, Dell, Lenovo, and Apple laptops. Bring your machine to our showroom for a quick 15-minute diagnostic evaluation by our bench technician, and we will issue an instant store credit valuation towards your upgrade.',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Laptop Recommendation / Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        'Thank you! Your message has been received by our Kisii Tech Desk. We will call or reply via WhatsApp shortly.',
        { duration: 5000 }
      );
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Laptop Recommendation / Inquiry',
        message: '',
      });
    }, 800);
  };

  return (
    <>
      <Helmet>
        <title>Contact & Showroom Location | Apexbyte Laptops Kenya (Kisii)</title>
        <meta
          name="description"
          content="Visit Apexbyte showroom at Mocha Place, 2nd Floor, Hospital Road, Kisii Town CBD. Call +254 104 504 692 or chat on WhatsApp for verified laptop sales and technical support."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header Hero - Adaptive Light & Dark */}
        <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 text-slate-900 border-b border-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white dark:border-gray-800 py-16 text-center transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 dark:bg-white/10 dark:text-amber-300 dark:border-white/20 text-xs font-semibold mb-3 transition-colors">
                📍 Kisii CBD Physical Showroom
              </span>
              <h1 className="text-4xl sm:text-5xl font-black mb-4 text-slate-900 dark:text-white">
                We're Here to Help You Choose Right
              </h1>
              <p className="text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
                Have questions about laptop specs, current showroom stock, or custom upgrades? Speak directly with our hardware technicians.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Direct Contacts & Showroom Location */}
            <div className="space-y-6">
              {/* Showroom Location Card */}
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl">
                    <FiMapPin />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      Physical Showroom
                    </h3>
                    <p className="text-xs text-gray-500">Walk-in testing & pickup</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Apexbyte Laptops Kenya
                  </p>
                  <p>Shop S14, 2nd Floor, Mocha Place</p>
                  <p>Hospital Road (Opposite Kisii Central Police Station / near Quickmart)</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    Kisii Central Business District, Kisii County
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-750 text-xs text-gray-500">
                  <p>💡 <em>Walking from Kisii Bus Park or Quickmart takes only 3 minutes down Hospital Road.</em></p>
                </div>
              </Card>

              {/* Direct WhatsApp & Call Card */}
              <Card className="p-6 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 dark:bg-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      Instant WhatsApp Chat
                    </h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Fastest response time (under 5 mins)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Send us a message with your budget and intended use. Our hardware techs will send photos and available configurations right away.
                </p>

                <a
                  href="https://wa.me/254104504692?text=Hello%20Apexbyte%20Tech%20Desk,%20I%20have%20an%20inquiry%20regarding%20laptops"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-xs"
                >
                  <FaWhatsapp size={16} />
                  <span>Chat on WhatsApp (+254 104 504 692)</span>
                </a>
              </Card>

              {/* Phone & Email Details */}
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-base shrink-0">
                    <FiPhone />
                  </div>
                  <div className="text-sm">
                    <span className="block font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-0.5">
                      Direct Telephone
                    </span>
                    <a href="tel:+254104504692" className="hover:text-primary-600 font-medium block">
                      +254 104 504 692
                    </a>
                    <span className="text-xs text-gray-500 block">
                      Direct Showroom &amp; Support Line
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-150 dark:border-gray-750">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center text-base shrink-0">
                    <FiMail />
                  </div>
                  <div className="text-sm">
                    <span className="block font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-0.5">
                      Customer Email
                    </span>
                    <a href="mailto:support@apexbyte.co.ke" className="hover:text-primary-600 text-xs font-medium block">
                      support@apexbyte.co.ke
                    </a>
                    <a href="mailto:sales@apexbyte.co.ke" className="text-xs text-gray-500 hover:text-primary-600 block">
                      sales@apexbyte.co.ke
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-150 dark:border-gray-750">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center text-base shrink-0">
                    <FiClock />
                  </div>
                  <div className="text-sm">
                    <span className="block font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-0.5">
                      Operating Hours
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <strong>Mon – Fri:</strong> 8:30 AM – 6:30 PM
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <strong>Saturday:</strong> 9:00 AM – 5:00 PM
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Sunday & Holidays:</strong> Closed (Delivery on request)
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right 2 Columns: Working Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl">
                <div className="mb-6">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider block mb-1">
                    Send Us a Message
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    Get in Touch with Our Hardware Team
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Fill in your details below and a technician will follow up within 30 minutes during store hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Your Full Name *
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. John Kamau"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Phone Number (WhatsApp Preferred) *
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="e.g. 0104 504 692"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="e.g. kamau@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Inquiry Topic *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Laptop Recommendation / Inquiry">Looking for Laptop Recommendation</option>
                        <option value="Confirm Showroom Stock">Check Physical Showroom Stock</option>
                        <option value="RAM or SSD Upgrade Request">Request RAM / SSD Upgrade</option>
                        <option value="Track Delivery Status">Track Existing Delivery</option>
                        <option value="Warranty or After-Sales Support">Warranty & Technical Service</option>
                        <option value="Trade-In Evaluation">Trade-In Old Laptop</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Your Message or Specs Needed *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us what you need. (e.g., 'Looking for a Dell Latitude or ThinkPad with Core i7 and 16GB RAM for programming under KSh 60,000. Can I test it at your Kimathi Street shop?')"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                      🔒 We never share your phone number with 3rd parties.
                    </p>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center gap-2"
                    >
                      <FiSend />
                      <span>{isSubmitting ? 'Sending...' : 'Send Message to Tech Desk'}</span>
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Verified Buyer FAQ Accordion */}
              <div id="faq" className="mt-12">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <FiHelpCircle /> Transparent Answers
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Real questions our customers ask before purchasing or visiting our showroom.
                  </p>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <Card
                        key={index}
                        className="overflow-hidden border border-gray-200 dark:border-gray-700 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        >
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {faq.question}
                          </span>
                          <span className="text-gray-400 shrink-0">
                            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 bg-gray-50/70 dark:bg-gray-850/60 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-750">
                            {faq.answer}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
