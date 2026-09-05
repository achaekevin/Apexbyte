import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiShield,
  FiAward,
  FiMapPin,
  FiCpu,
  FiBatteryCharging,
  FiTool,
  FiArrowRight,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Apexbyte Laptops Kenya (Kisii)</title>
        <meta
          name="description"
          content="Learn about Apexbyte Laptops Kenya - providing genuine, 7-point inspected laptops with local 1-year warranty and authentic showroom pickup at Mocha Place, Kisii CBD."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 text-slate-900 border-b border-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white dark:border-gray-800 py-20 overflow-hidden transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 dark:bg-white/10 dark:text-amber-300 dark:border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 transition-colors">
                <FiMapPin /> Mocha Place, 2nd Floor, Hospital Road, Kisii CBD
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-6 leading-tight text-slate-900 dark:text-white tracking-tight">
                Built by Technicians, <br />
                Trusted by Kenyan Professionals.
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-700 dark:text-slate-200 leading-relaxed mb-6 sm:mb-8">
                We started Apexbyte because buying a laptop in Kisii and Western Kenya shouldn't feel like gambling with your hard-earned money. We test, certify, and warranty every single machine before it leaves our showroom.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg">
                    Browse Inspected Laptops
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 dark:border-gray-700 text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Visit Our Showroom
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Story Behind Apexbyte */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider text-xs block mb-2">
                  Our Real Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
                  Tired of Gray-Market Traps & Fake Power Bricks in Town
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  <p>
                    Back in 2021, our founder Kevin Achae and fellow hardware technicians were fixing laptops for university students at Kisii University and tech professionals across Kenya. Almost daily, someone came in with a "bargain" laptop bought on downtown streets that died within 3 weeks.
                  </p>
                  <p>
                    The story was always the same: counterfeit chargers that fried motherboard capacitors, failing batteries that were reset with cheap software, and sellers who disappeared the moment a warranty claim was mentioned.
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Apexbyte was born to change this standard completely. We created a physical electronics store where every machine is rigorously benchmarked, battery health is proven in front of you, genuine OEM power adapters are standard, and genuine 1-year local warranty is honored right here at our Kisii showroom.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <span className="text-3xl font-black text-primary-600 dark:text-primary-400 block">
                      100%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Genuine Hardware
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-amber-500 block">
                      12 Mo.
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Store & Local Warranty
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-emerald-500 block">
                      7-Point
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Hands-On Diagnostic
                    </span>
                  </div>
                </div>
              </div>

              {/* Showroom & Hands-on Visual Box */}
              <div className="relative">
                <Card className="p-8 border-2 border-primary-100 dark:border-primary-900/40 bg-white dark:bg-gray-800 shadow-xl rounded-2xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl">
                      🏬
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        The Apexbyte Showroom Experience
                      </h3>
                      <p className="text-xs text-gray-500">Come visit us in Kisii Town CBD</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    We believe in complete transparency. When you visit our shop at Mocha Place on Hospital Road, we invite you to sit down, test the keyboard feel, run Cinebench or battery discharge tests, inspect the hinge tension, and verify the SSD read speeds before paying.
                  </p>

                  <div className="space-y-3 bg-gray-50 dark:bg-gray-750 p-4 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" />
                      <span className="font-semibold">Test & inspect before payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" />
                      <span>Free on-the-spot RAM or SSD upgrades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" />
                      <span>Free OS, essential drivers, and software setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500 shrink-0" />
                      <span>Original manufacturer charger with fused power cable</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Need directions from Kencom or Archives?</span>
                    <Link
                      to="/contact"
                      className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      View Map & Hours <FiArrowRight />
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 7-Point Quality Guarantee */}
        <section className="py-16 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 block">
                Quality Assurance Standard
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                The Apexbyte 7-Point Hardware Protocol
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Every laptop on our shelves undergoes an exhaustive bench inspection by our hardware crew. We do not sell untested imports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <FiBatteryCharging className="text-emerald-500" />,
                  title: '1. Battery Health & Capacity',
                  desc: 'Verified using hardware diagnostic tools. We guarantee minimum 80%+ retained original runtime capacity or replace the cells with brand new ones.',
                },
                {
                  icon: <FiCpu className="text-primary-500" />,
                  title: '2. Thermals & Fan Servicing',
                  desc: 'Cooling pipes are ultrasonically de-dusted and fresh high-conductivity thermal paste is applied to prevent thermal throttling under heavy loads.',
                },
                {
                  icon: <FiShield className="text-amber-500" />,
                  title: '3. NVMe SSD Health & SMART',
                  desc: 'Every drive is scanned with SMART diagnostics for 100% healthy sectors, zero bad blocks, and fast sequential read/write speeds.',
                },
                {
                  icon: <FiAward className="text-purple-500" />,
                  title: '4. Display & Dead Pixel Check',
                  desc: 'Full-screen RGB color cycling tests to confirm zero dead pixels, no pressure spots, smooth backlight uniformity, and firm hinge tension.',
                },
                {
                  icon: <FiTool className="text-blue-500" />,
                  title: '5. Keyboard, Trackpad & Biometrics',
                  desc: 'Every key is actuation-tested. Backlighting, multi-touch gestures, fingerprint readers, and IR face unlock sensors are verified.',
                },
                {
                  icon: <FiCheckCircle className="text-teal-500" />,
                  title: '6. All Physical Ports & Wi-Fi',
                  desc: 'Every USB-C, Thunderbolt, HDMI, audio jack, and SD reader is stress-tested. Wi-Fi cards and Bluetooth 5 are signal checked.',
                },
              ].map((step, idx) => (
                <Card key={idx} className="p-6 hover:shadow-premium transition-all duration-300">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </Card>
              ))}

              {/* 7th Feature Highlight */}
              <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary-600 to-sky-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
                    🔌
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl mb-1">
                      7. Genuine OEM Power Adapters Only
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                      We never pack generic, unbranded 3rd-party replacement chargers that overheat. Every laptop ships with the authentic manufacturer power adapter (HP Smart AC, Dell Barrel/Type-C, Lenovo Slim Tip, or Apple MagSafe).
                    </p>
                  </div>
                </div>
                <Link to="/shop">
                  <Button className="bg-white !text-primary-700 hover:!bg-blue-50 font-bold whitespace-nowrap shadow-md">
                    Shop Guaranteed Laptops
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Meet The Tech Team */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2 block">
                The Real Humans Behind Apexbyte
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Hardware Technicians, Not Telemarketers
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                When you call or message us on WhatsApp, you speak directly to someone who knows motherboard schematics, RAM compatibility, and battery cycle counts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center font-black text-2xl mb-4">
                  KA
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Kevin Achae</h3>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold block mb-3">
                  Founder & Chief Systems Engineer
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Passionate about component-level repairs, board diagnostics, and sourcing verified enterprise inventory from authorized US and UK corporate leases.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-2xl mb-4">
                  DK
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Dennis Karanja</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mb-3">
                  Lead Bench Diagnostic Tech
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Oversees the 7-point inspection protocol, custom RAM/SSD installation, and thermal maintenance for all high-performance workstations.
                </p>
              </Card>

              <Card className="p-6 text-center sm:col-span-2 lg:col-span-1">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-2xl mb-4">
                  MW
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Mercy Wanjiku</h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mb-3">
                  Showroom Client Care & Logistics
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Coordinates same-day dispatches across Kisii, parcel tracking with Fargo Courier / G4S, and warranty registrations for our clients.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to action - Adaptive Light/Dark */}
        <section className="py-16 bg-gray-100 text-slate-900 border-t border-gray-200 dark:bg-slate-950 dark:text-white dark:border-slate-800 text-center transition-colors">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">
              Need Personalized Advice on Your Next Machine?
            </h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
              Tell us your budget and what software you use (AutoCAD, Python, Premier Pro, Accounting, or Campus work). We'll recommend the best match without upselling.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/254104504692?text=Hello%20Apexbyte%20Tech%20Desk,%20I%20need%20advice%20choosing%20a%20laptop"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <FaWhatsapp size={18} />
                <span>Chat with Tech Desk on WhatsApp</span>
              </a>
              <Link to="/shop">
                <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-700 text-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10">
                  Explore Full Catalog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
