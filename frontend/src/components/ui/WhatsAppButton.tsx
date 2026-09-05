import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { FiX, FiClock, FiMapPin } from 'react-icons/fi';

export const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = '254104504692';
  const defaultMessage = encodeURIComponent(
    'Hello Apexbyte! I am browsing laptops on your website and would like some assistance choosing the right machine.'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 sm:w-88 bg-white dark:bg-gray-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden text-gray-900 dark:text-gray-100"
          >
            {/* Header */}
            <div className="bg-emerald-600 px-4 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                  <FaWhatsapp />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-tight">Apexbyte Tech Desk</h4>
                  <span className="text-xs text-emerald-100 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    Online • Kisii CBD
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close WhatsApp chat"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3.5 bg-gray-50 dark:bg-gray-900/60 text-sm">
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl shadow-sm border border-gray-150 dark:border-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">
                  Habari! Welcome to Apexbyte Kenya 👋
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Need quick specs advice, confirmation on showroom stock, or custom RAM/SSD upgrade before dispatch? Chat directly with our hardware technicians.
                </p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-emerald-600 dark:text-emerald-400 shrink-0 text-base" />
                  <span>Mocha Place, 2nd Floor, Hospital Rd, Kisii CBD</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-emerald-600 dark:text-emerald-400 shrink-0 text-base" />
                  <span>Mon – Sat: 8:30 AM – 6:30 PM</span>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg text-sm"
              >
                <FaWhatsapp size={18} />
                <span>Start WhatsApp Chat</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-emerald-500/30"
        aria-label="Chat with Apexbyte Tech Desk on WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <FaWhatsapp size={22} />
        <span className="hidden sm:inline font-bold text-sm tracking-wide">
          Chat With Us
        </span>
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
