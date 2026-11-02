import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FiAward,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiZap,
  FiHardDrive,
  FiBatteryCharging,
  FiShield,
} from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE, getInitials } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import { useSettings } from '../hooks/useSettings';
import TechBackground from '../components/ui/TechBackground';

import api from '../services/api';

const heroLaptops = [
  {
    id: 'fleet',
    name: 'Apexbyte Active Showroom Fleet',
    brand: 'Mocha Place Showroom',
    badge: 'Live Kisii Inventory',
    price: 'KSh 32,000',
    compareAtPrice: 'KSh 38,000',
    saveAmount: 'Save KSh 6,000 (16% Off)',
    image: '/laptops/showroom-fleet.jpg',
    processor: 'Multi-Core Intel & Ryzen',
    ram: '8GB - 32GB RAM Options',
    storage: '256GB - 1TB NVMe SSD',
    display: '13" to 15.6" Anti-Glare',
    battery: '85% - 100% Battery Health',
    ideal: 'Walk-In Testing Today in Kisii CBD',
    accentGradient: 'from-emerald-500/20 via-teal-500/15 to-transparent',
    tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'hp',
    name: 'HP ProBook & Pavilion 15',
    brand: 'HP Official',
    badge: 'Top Business Pick',
    price: 'KSh 82,000',
    compareAtPrice: 'KSh 92,000',
    saveAmount: 'Save KSh 10,000 (11% Off)',
    image: '/laptops/hp-pavilion-natural.jpg',
    processor: 'Intel Core i5 / i7 Turbo',
    ram: '16GB DDR4 High-Speed',
    storage: '512GB PCIe M.2 NVMe',
    display: '15.6" Micro-Edge FHD IPS',
    battery: 'Up to 9 Hours Runtime',
    ideal: 'Office Work, University & Accounting',
    accentGradient: 'from-cyan-500/20 via-blue-500/15 to-transparent',
    tagColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'macbook',
    name: 'Apple MacBook Pro Retina / M-Series',
    brand: 'Apple',
    badge: 'Pro Creator & Dev',
    price: 'KSh 245,000',
    compareAtPrice: 'KSh 270,000',
    saveAmount: 'Save KSh 25,000 (9% Off)',
    image: '/laptops/macbook-pro-natural.jpg',
    processor: 'Apple Silicon / Core i7 Turbo',
    ram: '16GB Unified High-Speed RAM',
    storage: '512GB Ultra-Fast SSD',
    display: 'Liquid Retina XDR True Tone',
    battery: 'All-Day 15-Hour Endurance',
    ideal: 'Software Engineering & Video Editing',
    accentGradient: 'from-purple-500/20 via-indigo-500/15 to-transparent',
    tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  {
    id: 'dell',
    name: 'Dell XPS 13 & Latitude Series',
    brand: 'Dell Precision',
    badge: 'Executive Ultrabook',
    price: 'KSh 155,000',
    compareAtPrice: 'KSh 175,000',
    saveAmount: 'Save KSh 20,000 (11% Off)',
    image: '/laptops/dell-xps-natural.jpg',
    processor: 'Intel Core i7 11th/12th Gen',
    ram: '16GB LPDDR5 Dual-Channel',
    storage: '512GB Fast NVMe SSD',
    display: '13.4" InfinityEdge 4K / FHD+',
    battery: 'ExpressCharge 80% in 60m',
    ideal: 'Corporate Travel & Remote Multitasking',
    accentGradient: 'from-blue-600/20 via-sky-500/15 to-transparent',
    tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  {
    id: 'thinkpad',
    name: 'Lenovo ThinkPad T-Series & X1',
    brand: 'Lenovo ThinkPad',
    badge: 'Military-Grade Durability',
    price: 'KSh 115,000',
    compareAtPrice: 'KSh 128,000',
    saveAmount: 'Save KSh 13,000 (10% Off)',
    image: '/laptops/lenovo-thinkpad-natural.jpg',
    processor: 'Core i5 / i7 vPro Processor',
    ram: '16GB Upgradable to 32GB',
    storage: '512GB NVMe OPAL Encrypted',
    display: '14.0" Matte Anti-Glare IPS',
    battery: 'Dual Hot-Swap Battery Support',
    ideal: 'Data Science, Diagnostics & Typing',
    accentGradient: 'from-rose-500/20 via-red-500/15 to-transparent',
    tagColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  {
    id: 'asus',
    name: 'ASUS ROG Strix & TUF Gaming Beast',
    brand: 'ASUS ROG',
    badge: 'Dedicated NVIDIA RTX GPU',
    price: 'KSh 195,000',
    compareAtPrice: 'KSh 215,000',
    saveAmount: 'Save KSh 20,000 (9% Off)',
    image: '/laptops/asus-rog-natural.jpg',
    processor: 'Ryzen 7 / Core i7 Octa-Core',
    ram: '16GB / 32GB DDR5 Gaming RAM',
    storage: '1TB Gen4 PCIe NVMe SSD',
    display: '144Hz / 240Hz High-Refresh IPS',
    battery: 'Dual Fan Liquid Metal Thermal',
    ideal: 'AAA Gaming, Blender 3D, CAD & Arch',
    accentGradient: 'from-amber-500/20 via-orange-500/15 to-transparent',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { settings } = useSettings();
  const [currentLaptopIndex, setCurrentLaptopIndex] = useState(0);

  // Auto-cycle continuously through alternating laptop models without stopping
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLaptopIndex((prev) => (prev + 1) % heroLaptops.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentLaptopIndex]);

  const activeLaptop = heroLaptops[currentLaptopIndex];

  const nextLaptop = () => {
    setCurrentLaptopIndex((prev) => (prev + 1) % heroLaptops.length);
  };

  const prevLaptop = () => {
    setCurrentLaptopIndex((prev) => (prev - 1 + heroLaptops.length) % heroLaptops.length);
  };

  // Fetch featured products
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getProducts({ isFeatured: true, limit: 4 }),
  });

  // Fetch new arrivals
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productService.getProducts({ isNewArrival: true, limit: 4 }),
  });

  // Fetch top categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      api.get('/categories').then((res: any) => res.data || res),
  });

  // Fetch real customer reviews from the database
  const { data: realReviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: () => reviewService.getFeaturedReviews(6),
  });

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['home-brands'],
    queryFn: () =>
      api.get('/brands').then((res: any) => res.data || res),
  });

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      quantity: 1,
      stock: product.stock,
    });
    toast.success(
      (t) => (
        <div className="flex items-center justify-between gap-3 text-sm text-slate-900 dark:text-white">
          <span>Added <strong>{product.name}</strong> to cart!</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/cart');
            }}
            className="px-3 py-1 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 text-xs shadow-sm whitespace-nowrap"
          >
            View Cart
          </button>
        </div>
      ),
      { duration: 4000 }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white transition-colors">
      <Helmet>
        <title>Apexbyte Laptops Kenya | Authentic New & Certified Laptops in Kisii</title>
        <meta
          name="description"
          content="Kisii's trusted laptop store. Every laptop 7-point inspected with 1-year local warranty, same-day delivery, and showroom pickup at Mocha Place, Hospital Road, Kisii Town."
        />
      </Helmet>

      {/* Full-Page Screen-Filling Alternating Laptop Showcase Hero */}
      <TechBackground variant="hero" className="w-full">
      <section
        className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-gray-50/80 via-white/80 to-gray-100/80 text-slate-900 border-b border-gray-200 dark:from-gray-950/80 dark:via-gray-900/80 dark:to-gray-950/80 dark:text-white dark:border-gray-800 transition-colors pt-4 pb-4 sm:pt-6 sm:pb-6"
      >
        {/* Full-Bleed Edge-to-Edge Dynamic Ambient Backdrop */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLaptop.id + '-ambient-img'}
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 0.18, scale: 1.02 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.85 }}
              className="absolute inset-0 w-full h-full bg-center bg-cover filter blur-3xl scale-110"
              style={{ backgroundImage: `url(${activeLaptop.image})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/60 to-white/95 dark:from-gray-950/90 dark:via-gray-950/70 dark:to-gray-950/95" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLaptop.id + '-ambient-glow'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 bg-gradient-to-tr ${activeLaptop.accentGradient} blur-3xl`}
            />
          </AnimatePresence>
          {/* Tech dot matrix grid */}
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] bg-[radial-gradient(#808080_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Top Header & Verification Pill */}
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto shrink-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 sm:py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 dark:bg-white/10 dark:text-amber-300 dark:border-white/20 text-[11px] sm:text-xs font-bold mb-2 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{settings.showroom_address} • {settings.badge_warranty} • Test Before Payment</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            {settings.hero_title}
          </motion.h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-1 line-clamp-1 sm:line-clamp-none">
            {settings.hero_subtitle}
          </p>
        </div>

        {/* Left & Right Edge Navigation Arrows spanning full page */}
        <button
          type="button"
          onClick={prevLaptop}
          className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 cursor-pointer backdrop-blur-md"
          aria-label="Previous laptop model"
          title="Previous Model"
        >
          <FiChevronLeft size={26} />
        </button>
        <button
          type="button"
          onClick={nextLaptop}
          className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 cursor-pointer backdrop-blur-md"
          aria-label="Next laptop model"
          title="Next Model"
        >
          <FiChevronRight size={26} />
        </button>

        {/* Full-Page Center Stage Arena: Spans Entire Screen Width & Height */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 flex-1 flex flex-col justify-center relative z-10 my-2 sm:my-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
            {/* Left Column: Floating Hardware Specifications (Desktop 3 cols) */}
            <div className="hidden lg:block lg:col-span-3 space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLaptop.id + '-specs-left'}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 25 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                    Verified Hardware Specs:
                  </span>

                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/90 dark:border-gray-700/90 flex items-center gap-3 shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FiCpu size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block font-medium">Processor</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block">
                        {activeLaptop.processor}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/90 dark:border-gray-700/90 flex items-center gap-3 shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FiZap size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block font-medium">Memory (RAM)</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block">
                        {activeLaptop.ram}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/90 dark:border-gray-700/90 flex items-center gap-3 shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <FiHardDrive size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block font-medium">Solid State Drive</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block">
                        {activeLaptop.storage}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Center Column: The Grand Alternating Laptop Model (Desktop 6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLaptop.id}
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="relative w-full flex flex-col items-center"
                >
                  {/* Floating Top Badge & Ideal Usage */}
                  <div className="mb-2 sm:mb-3 flex items-center gap-2 flex-wrap justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${activeLaptop.tagColor} shadow-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      {activeLaptop.badge}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700 shadow-sm backdrop-blur-md">
                      {activeLaptop.ideal}
                    </span>
                  </div>

                  {/* Grand Laptop Showcase Window */}
                  <motion.div
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
                    className="relative w-full flex items-center justify-center group"
                  >
                    <div className="relative w-full max-w-sm sm:max-w-xl lg:max-w-2xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200/90 dark:border-gray-700/90 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md group-hover:border-primary-500/50 transition-colors">
                      <img
                        src={activeLaptop.image}
                        alt={activeLaptop.name}
                        className="w-full h-[32vh] sm:h-[42vh] lg:h-[48vh] max-h-[500px] object-contain object-center p-2 sm:p-4 group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Specular chassis light beam reflection */}
                      <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />

                      {/* In-Frame Bottom HUD Bar */}
                      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-gray-950/95 via-gray-950/75 to-transparent text-white">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider block">
                              {activeLaptop.brand}
                            </span>
                            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-white truncate">
                              {activeLaptop.name}
                            </h2>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-baseline justify-end gap-1.5">
                              <span className="text-sm sm:text-lg font-black text-amber-300 block">
                                {activeLaptop.price}
                              </span>
                              {activeLaptop.compareAtPrice && (
                                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                                  {activeLaptop.compareAtPrice}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] sm:text-xs text-emerald-400 font-medium block">
                              {activeLaptop.display}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Realistic Ground Shadow & Depth Underglow */}
                  <div className="w-3/4 sm:w-2/3 h-5 bg-black/30 dark:bg-black/70 blur-xl rounded-full mt-2" />
                  <div className="w-4/5 sm:w-3/4 h-8 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-emerald-500/0 blur-xl rounded-full -mt-4 pointer-events-none" />

                  {/* Mobile Spec Grid directly under laptop for small viewports */}
                  <div className="lg:hidden grid grid-cols-2 gap-2 w-full max-w-sm mt-3 px-1">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">Processor</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                        {activeLaptop.processor}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">Memory &amp; Storage</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                        {activeLaptop.ram} • {activeLaptop.storage}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Alternating Price, Battery & Guarantee (Desktop 3 cols) */}
            <div className="hidden lg:block lg:col-span-3 space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLaptop.id + '-specs-right'}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                    Showroom Assurance:
                  </span>

                  <motion.div
                    animate={{ y: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
                    className="p-4 rounded-2xl bg-primary-50/90 dark:bg-primary-950/60 backdrop-blur-md border border-primary-200 dark:border-primary-800 shadow-lg"
                  >
                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-0.5">
                      Cash / M-Pesa Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary-600 dark:text-primary-400 block">
                        {activeLaptop.price}
                      </span>
                      {activeLaptop.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {activeLaptop.compareAtPrice}
                        </span>
                      )}
                    </div>
                    {activeLaptop.saveAmount && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {activeLaptop.saveAmount}
                      </span>
                    )}
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                      ✓ In Stock at Mocha Place CBD
                    </span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/90 dark:border-gray-700/90 flex items-center gap-3 shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FiBatteryCharging size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block font-medium">Battery Benchmark</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block">
                        {activeLaptop.battery}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/90 dark:border-gray-700/90 flex items-center gap-3 shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <FiShield size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block font-medium">Warranty Coverage</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate block">
                        {settings.badge_warranty}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Full-Width Bottom Control Dock: Continuous Progress, Actions & Model Track */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shrink-0 relative z-10 pt-2">
          {/* Continuous progress countdown bar */}
          <div className="w-full h-1.5 bg-gray-200/80 dark:bg-gray-800/80 rounded-full overflow-hidden mb-3 shadow-inner">
            <motion.div
              key={currentLaptopIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4.0, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 rounded-full"
            />
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-3">
            <Button
              size="md"
              onClick={() => navigate('/shop')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg text-xs sm:text-sm px-4 sm:px-6 py-2.5"
            >
              Explore All Laptops in Stock
            </Button>
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${settings.store_name}, I am interested in testing the laptops shown on your website`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              <span>💬</span> Chat on WhatsApp / Test in Showroom
            </a>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/finder')}
              className="border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white text-xs sm:text-sm hidden sm:inline-flex"
            >
              Interactive Laptop Finder
            </Button>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Continuous Live Showcase</span>
            </div>
          </div>

          {/* Model Selector Track across the entire page */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 px-1">
            <span className="font-bold uppercase tracking-wider text-[10px] sm:text-xs">
              Alternating Fleet Showcase: {activeLaptop.name}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Model {currentLaptopIndex + 1} of {heroLaptops.length} • Auto-Alternating Continuously
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {heroLaptops.map((laptop, idx) => (
              <button
                key={laptop.id}
                type="button"
                onClick={() => setCurrentLaptopIndex(idx)}
                className={`shrink-0 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  currentLaptopIndex === idx
                    ? 'bg-primary-600 text-white shadow-md border-primary-600 scale-105'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 backdrop-blur-sm'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentLaptopIndex === idx ? 'bg-white animate-pulse' : 'bg-gray-400 dark:bg-gray-500'}`} />
                <span>{laptop.name.split(' ')[0]} {laptop.name.split(' ')[1] || ''}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  currentLaptopIndex === idx ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {laptop.price.replace('From ', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
      </TechBackground>

      {/* Human Retail Trust Strip - Fully Responsive to Light & Dark Modes */}
      <section className="bg-gray-100 text-slate-900 border-b border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm sm:text-base">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏬</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">{settings.badge_pickup}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Test before you pay</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛡️</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">{settings.badge_warranty}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Authorized service centers</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚚</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">{settings.badge_delivery}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Dispatched in 2-3 hours</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚡</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">{settings.badge_returns}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Free labor with purchase</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <TechBackground variant="catalog" className="w-full">
      <section className="py-10 sm:py-16 bg-white/80 dark:bg-gray-900/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-10"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 text-slate-900 dark:text-white tracking-tight">Featured Laptops</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Hand-picked certified laptops for every workload
            </p>
          </motion.div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(featuredProducts?.data || []).map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200/90 dark:border-gray-700/90 hover:border-primary-500/50 dark:hover:border-primary-500/50 h-full flex flex-col justify-between overflow-hidden">
                    <div>
                      <Link to={`/products/${product.id}`}>
                        <div className="relative overflow-hidden rounded-t-xl aspect-square bg-gray-100 dark:bg-gray-800">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.isFeatured && (
                            <Badge className="absolute top-2 right-2" variant="primary">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </Link>
                      <div className="p-3.5 sm:p-5">
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-bold text-sm sm:text-base mb-1.5 text-slate-900 dark:text-white hover:underline transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <div className="flex items-center text-amber-400 text-xs sm:text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <= product.averageRating
                                    ? 'text-amber-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            ({product.reviewCount || 1})
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                          {product.stock < 10 && product.stock > 0 && (
                            <Badge variant="warning" size="sm">
                              Only {product.stock} left
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-5 pt-0">
                      <Button
                        fullWidth
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm py-2 sm:py-2.5 shadow-sm"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/shop">
              <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                View All Laptops
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      </TechBackground>

      {/* Categories */}
      <section className="py-10 sm:py-16 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-10"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 text-slate-900 dark:text-white tracking-tight">Shop by Category</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Find the perfect laptop for your specific usage</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {(categories || []).slice(0, 4).map((category: any, index: number) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/shop?category=${category.id}`}>
                  <Card className="text-center hover:shadow-premium cursor-pointer transition-all p-4 sm:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💻</div>
                      <h3 className="text-base sm:text-lg font-bold mb-1 text-slate-900 dark:text-white">{category.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-3 text-xs sm:text-sm line-clamp-2">
                        Explore {category.name.toLowerCase()} laptops
                      </p>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View Collection →
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Laptop Brand Stores */}
      <section id="official-brand-stores" className="py-14 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 mb-2">
                <FiAward size={14} /> Official Brand Stores
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Shop by Brand</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">100% genuine laptops with authorized distributor warranty</p>
            </div>
            <Link to="/shop" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              Explore All Brands <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {(brands || []).map((brand: any) => (
              <Link
                key={brand.id}
                to={`/shop?brand=${brand.slug || brand.id}`}
                className="group block p-4 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-primary-500 rounded-2xl text-center transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2 mb-3 shadow-inner group-hover:border-primary-400">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{brand.name.substring(0, 3)}</span>
                  )}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:underline transition-colors">{brand.name}</h3>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">Official Store</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-white tracking-tight">New Arrivals</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Freshly inspected machines added to our Kisii showroom this week
            </p>
          </motion.div>

          {loadingNew ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(newArrivals?.data || []).slice(0, 4).map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Badge variant="success" size="sm">
                          New
                        </Badge>
                        {product.stock < 10 && product.stock > 0 && (
                          <Badge variant="warning" size="sm">
                            Only {product.stock} left
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <div className="p-3.5 sm:p-5">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-bold text-sm sm:text-base mb-1.5 text-slate-900 dark:text-white hover:underline transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="flex items-center text-amber-400 text-xs sm:text-sm">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xs sm:text-sm ${
                                star <= product.averageRating
                                  ? 'text-amber-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                              {formatCurrency(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        fullWidth
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm py-2 sm:py-2.5 shadow-sm"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Real Customer Reviews Section - Fully Responsive to Light & Dark Modes */}
      <section className="py-16 bg-gray-100 text-slate-900 border-y border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 dark:bg-white/10 dark:text-white dark:border-white/20 px-3.5 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 transition-colors">
              <span>★</span> 100% Verified Buyer Reviews
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white tracking-tight">Verified Customer Feedback</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Direct reviews submitted exclusively by verified purchasers following delivery or showroom pickup
            </p>
          </motion.div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 bg-gray-200 dark:bg-white/10 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : realReviews && realReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {realReviews.slice(0, 6).map((review: any, index: number) => {
                const authorName = review.user
                  ? `${review.user.firstName} ${review.user.lastName}`
                  : 'Verified Customer';
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border-gray-200 text-slate-900 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white h-full flex flex-col justify-between p-6 hover:shadow-md transition-all duration-300">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {review.user?.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={authorName}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/30 dark:ring-white/30"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 dark:bg-slate-800 dark:text-white font-bold flex items-center justify-center ring-2 ring-primary-500/20 dark:ring-white/30 text-sm">
                                {review.user ? getInitials(review.user.firstName, review.user.lastName) : 'VC'}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">{authorName}</h4>
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified Purchase
                              </span>
                            </div>
                          </div>
                          <div className="flex text-amber-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        {review.title && (
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2 text-base line-clamp-1">
                            "{review.title}"
                          </h5>
                        )}

                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-4">
                          {review.comment}
                        </p>
                      </div>

                      {review.product && (
                        <Link
                          to={`/products/${review.product.id}`}
                          className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 group text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white transition-colors"
                        >
                          <span className="text-slate-400 dark:text-slate-500">Reviewed:</span>
                          <span className="font-medium underline underline-offset-2 truncate text-slate-800 dark:text-slate-200">
                            {review.product.name}
                          </span>
                        </Link>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-gray-200 text-slate-900 dark:bg-gray-900 dark:border-gray-800 dark:text-white rounded-2xl border p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-700 dark:bg-white/20 dark:text-white text-3xl mb-5 shadow-inner">
                🛡️
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                100% Genuine Purchaser Reviews Policy
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                We strictly prohibit artificial, seeded, or simulated reviews. Every review is strictly linked to a verified delivered purchase so you can shop with complete peace of mind. Real purchaser reviews appear here as orders are completed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
                <div className="bg-gray-50 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 rounded-xl p-5 border transition-colors">
                  <div className="text-2xl mb-2">🔒</div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">Verified Buyers Only</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                    Only customers who placed and received their order can submit verified reviews.
                  </p>
                </div>
                <div className="bg-gray-50 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 rounded-xl p-5 border transition-colors">
                  <div className="text-2xl mb-2">⚖️</div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">Zero Fake Feedback</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                    No fabricated or seeded reviews. Real performance and hands-on impressions only.
                  </p>
                </div>
                <div className="bg-gray-50 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 rounded-xl p-5 border transition-colors">
                  <div className="text-2xl mb-2">📦</div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">Post-Delivery Reviews</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                    Purchasers can rate their laptop and attach genuine photos directly after delivery.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/shop')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg"
                >
                  Explore Laptops
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/about')}
                  className="border-gray-300 dark:border-gray-700 text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Learn About Our Guarantee
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Authentic Store Guarantees */}
      <section id="store-guarantees" className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Why Kenyan & South Nyanza Professionals Choose Apexbyte
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg">
              Certified retail store with a physical showroom and bench-tested inventory in Kisii
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Showroom Testing',
                desc: `Walk into ${settings.showroom_address}. Test battery health, thermals, and keyboards before paying.`,
                icon: '🏬',
              },
              {
                title: settings.badge_warranty,
                desc: `${settings.badge_warranty} backed by local authorized technicians in ${settings.city}.`,
                icon: '🛡️',
              },
              {
                title: settings.badge_delivery,
                desc: `Direct rider delivery within ${settings.city} in 2-3 hours. Countrywide insured courier within 24 hours.`,
                icon: '🚚',
              },
              {
                title: settings.badge_returns,
                desc: 'Bring your old laptop for instant store credit. Free on-the-spot RAM & SSD upgrade installations.',
                icon: '⚡',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 text-center hover:shadow-premium transition-all"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
