import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiRefreshCw,
  FiShoppingCart,
  FiLayers,
  FiAward,
} from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import productService from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useComparisonStore } from '../store/comparisonStore';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import toast from 'react-hot-toast';

interface UserAnswers {
  usage: 'student' | 'programming' | 'business' | 'gaming' | 'creative';
  budget: 'budget' | 'mid' | 'premium' | 'flagship';
  screen: 'compact' | 'standard' | 'large' | 'any';
  brand: string;
  os: string;
}

const USAGE_OPTIONS = [
  {
    id: 'student',
    title: 'Student & General Use',
    desc: 'Web browsing, Zoom classes, Microsoft Office, lightweight & long battery life.',
    icon: '🎓',
    priorities: ['Affordability', 'Battery Life', 'Lightweight Portability'],
  },
  {
    id: 'programming',
    title: 'Coding & Software Engineering',
    desc: 'Docker, VS Code, fast multi-core processor, 16GB+ RAM, and fast NVMe SSD.',
    icon: '💻',
    priorities: ['High-Performance CPU', '16GB+ RAM', 'Fast SSD'],
  },
  {
    id: 'business',
    title: 'Business & Professional Work',
    desc: 'Sleek design, enterprise security (TPM/Fingerprint), durability, reliable build.',
    icon: '💼',
    priorities: ['Durability & Keyboard', 'Crisp Display', 'Enterprise Security'],
  },
  {
    id: 'gaming',
    title: 'Gaming & 3D Simulation',
    desc: 'Dedicated NVIDIA/Radeon GPU, high refresh rate screen, robust cooling.',
    icon: '🎮',
    priorities: ['Dedicated GPU', '144Hz+ Display', 'Thermal Cooling'],
  },
  {
    id: 'creative',
    title: 'Creative Design & 4K Video',
    desc: 'Color-accurate IPS/OLED display, dedicated graphics, large storage.',
    icon: '🎨',
    priorities: ['Color Accuracy', 'GPU Acceleration', 'Large Storage'],
  },
];

const BUDGET_OPTIONS = [
  {
    id: 'budget',
    label: 'Under KSh 45,000',
    sub: 'Best value for tight student budgets',
    min: 0,
    max: 45000,
  },
  {
    id: 'mid',
    label: 'KSh 45,000 – KSh 75,000',
    sub: 'Sweet spot for Core i5/i7 business laptops',
    min: 45000,
    max: 75000,
  },
  {
    id: 'premium',
    label: 'KSh 75,000 – KSh 130,000',
    sub: 'High-end developer rigs & entry gaming',
    min: 75000,
    max: 130000,
  },
  {
    id: 'flagship',
    label: 'KSh 130,000 and Above',
    sub: 'Flagship MacBooks, RTX gaming & workstations',
    min: 130000,
    max: 1000000,
  },
];

const SCREEN_OPTIONS = [
  {
    id: 'compact',
    label: '13" to 14" Ultraportable',
    desc: 'Lightweight, fits easily in backpack, great for commuting.',
  },
  {
    id: 'standard',
    label: '15.6" Standard Workhorse',
    desc: 'The classic balance of workspace with full numeric keypad.',
  },
  {
    id: 'large',
    label: '16" to 17.3" Immersive',
    desc: 'Maximum screen real-estate for gaming, code splits, and timelines.',
  },
  {
    id: 'any',
    label: 'Any Screen Size',
    desc: 'Focus on performance and specs rather than dimensions.',
  },
];

const BRAND_OPTIONS = ['Any Brand', 'HP', 'Dell', 'Lenovo', 'Apple', 'Asus', 'Acer'];

const LaptopFinder = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<UserAnswers>({
    usage: 'programming',
    budget: 'mid',
    screen: 'any',
    brand: 'Any Brand',
    os: 'any',
  });

  const { addItem } = useCartStore();
  const { addProduct, products: comparisonProducts } = useComparisonStore();

  // Fetch catalog products
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ['finder-products'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });

  const laptops = useMemo(() => {
    return catalogData?.data || catalogData?.products || [];
  }, [catalogData]);

  // Transparent Rule-Based Scoring Engine
  const recommendations = useMemo(() => {
    if (!laptops || laptops.length === 0) return [];

    const budgetRule = BUDGET_OPTIONS.find((b) => b.id === answers.budget)!;

    const scored = laptops.map((laptop: any) => {
      let score = 50; // Base score
      const reasons: string[] = [];
      const price = Number(laptop.price) || 0;
      const ram = Number(laptop.ram) || 8;
      const storage = Number(laptop.storage) || 256;
      const displaySize = Number(laptop.displaySize) || 14;
      const brandName = (laptop.brand?.name || '').toLowerCase();
      const cpu = (laptop.processor || '').toLowerCase();
      const gpu = (laptop.gpu || '').toLowerCase();

      // 1. Budget Fit (Max 30 pts)
      if (price >= budgetRule.min && price <= budgetRule.max) {
        score += 30;
        reasons.push(`Perfect match for your ${budgetRule.label} budget range`);
      } else if (price < budgetRule.min) {
        score += 20;
        reasons.push(`Well under your budget, saving you money`);
      } else if (price <= budgetRule.max * 1.15) {
        score += 10; // Slightly above budget
      }

      // 2. Usage Matching (Max 35 pts)
      switch (answers.usage) {
        case 'gaming':
          if (gpu.includes('nvidia') || gpu.includes('rtx') || gpu.includes('gtx') || gpu.includes('radeon')) {
            score += 25;
            reasons.push('Dedicated gaming GPU hardware detected');
          }
          if (ram >= 16) score += 10;
          break;

        case 'programming':
          if (ram >= 16) {
            score += 20;
            reasons.push('16GB+ RAM supports heavy Docker, IDEs, and VMs');
          } else if (ram >= 8) {
            score += 10;
          }
          if (cpu.includes('i7') || cpu.includes('i9') || cpu.includes('ryzen 7') || cpu.includes('m1') || cpu.includes('m2') || cpu.includes('m3')) {
            score += 15;
            reasons.push('High-performance multi-core processor for fast compiles');
          }
          break;

        case 'business':
          if (brandName.includes('hp') || brandName.includes('dell') || brandName.includes('lenovo')) {
            score += 15;
            reasons.push('Industry-standard enterprise reliability & keyboard comfort');
          }
          if (storage >= 512) score += 10;
          if (displaySize <= 14.5) {
            score += 10;
            reasons.push('Compact & portable for client meetings and travel');
          }
          break;

        case 'student':
          if (price <= 55000) {
            score += 20;
            reasons.push('Budget-friendly pricing ideal for student coursework');
          }
          if (displaySize <= 14.5) score += 15;
          break;

        case 'creative':
          if (brandName.includes('apple') || gpu.includes('rtx') || gpu.includes('nvidia')) {
            score += 20;
            reasons.push('High graphics bandwidth for video render & photo editing');
          }
          if (ram >= 16) score += 10;
          if (storage >= 512) score += 5;
          break;
      }

      // 3. Screen Size Fit (Max 15 pts)
      if (answers.screen === 'compact' && displaySize <= 14) {
        score += 15;
        reasons.push(`Compact ${displaySize}" form-factor matches your portability preference`);
      } else if (answers.screen === 'standard' && displaySize >= 15 && displaySize <= 15.9) {
        score += 15;
        reasons.push(`15.6" screen provides spacious multitasking space`);
      } else if (answers.screen === 'large' && displaySize >= 16) {
        score += 15;
        reasons.push(`Large ${displaySize}" display for maximum visual immersion`);
      } else if (answers.screen === 'any') {
        score += 10;
      }

      // 4. Preferred Brand (Max 15 pts)
      if (answers.brand !== 'Any Brand') {
        if (brandName.includes(answers.brand.toLowerCase())) {
          score += 15;
          reasons.push(`Matches your preferred brand choice (${answers.brand})`);
        }
      }

      const matchPercent = Math.min(99, Math.max(50, score));

      return {
        ...laptop,
        matchScore: matchPercent,
        matchReasons: reasons.slice(0, 3),
      };
    });

    return scored.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 6);
  }, [laptops, answers]);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0,
      image: getProductImage(product),
      quantity: 1,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToCompare = (product: any) => {
    if (comparisonProducts.length >= 4) {
      toast.error('You can compare a maximum of 4 laptops');
      return;
    }
    addProduct(product);
    toast.success('Added to comparison table');
  };

  return (
    <>
      <Helmet>
        <title>Laptop Finder - AI & Rule-Based Matcher | Apexbyte Kenya</title>
        <meta
          name="description"
          content="Find the exact laptop that fits your budget, coursework, programming, or gaming needs with our transparent hardware recommendation scoring engine."
        />
      </Helmet>

      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[80vh]">
        {/* Header Banner */}
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800">
            Interactive Hardware Matcher
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mt-3 mb-2 tracking-tight">
            Find Your Ideal Laptop in 60 Seconds
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Answer 4 quick questions. Our transparent scoring engine scans available inventory at Mocha Place to rank your top machine matches.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === i
                    ? 'w-8 bg-primary-600'
                    : step > i
                    ? 'w-3 bg-emerald-500'
                    : 'w-3 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Usage */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">
                Step 1: What is your primary day-to-day use?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {USAGE_OPTIONS.map((opt) => {
                  const isSelected = answers.usage === opt.id;
                  return (
                    <Card
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, usage: opt.id as any })}
                      className={`p-6 cursor-pointer border-2 transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{opt.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            {opt.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {opt.desc}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {opt.priorities.map((p) => (
                              <span
                                key={p}
                                className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button size="lg" onClick={() => setStep(2)} className="flex items-center gap-2">
                  Next: Budget Range <FiArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Budget */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">
                Step 2: What is your preferred budget range?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BUDGET_OPTIONS.map((b) => {
                  const isSelected = answers.budget === b.id;
                  return (
                    <Card
                      key={b.id}
                      onClick={() => setAnswers({ ...answers, budget: b.id as any })}
                      className={`p-6 cursor-pointer border-2 transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-1">
                            {b.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{b.sub}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
                            <FiCheck />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex items-center gap-2">
                  <FiArrowLeft /> Back
                </Button>
                <Button size="lg" onClick={() => setStep(3)} className="flex items-center gap-2">
                  Next: Screen & Size <FiArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Screen Size */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">
                Step 3: What size and portability do you need?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SCREEN_OPTIONS.map((s) => {
                  const isSelected = answers.screen === s.id;
                  return (
                    <Card
                      key={s.id}
                      onClick={() => setAnswers({ ...answers, screen: s.id as any })}
                      className={`p-6 cursor-pointer border-2 transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                        {s.label}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{s.desc}</p>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex items-center gap-2">
                  <FiArrowLeft /> Back
                </Button>
                <Button size="lg" onClick={() => setStep(4)} className="flex items-center gap-2">
                  Next: Brand Preferences <FiArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Brand */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">
                Step 4: Do you have a preferred brand?
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BRAND_OPTIONS.map((brand) => {
                  const isSelected = answers.brand === brand;
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setAnswers({ ...answers, brand })}
                      className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(3)} className="flex items-center gap-2">
                  <FiArrowLeft /> Back
                </Button>
                <Button
                  size="lg"
                  onClick={() => setStep(5)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                  Calculate My Matches <FiAward />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Results */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    Top Recommendations For You
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Scored based on {answers.usage.toUpperCase()} usage, budget fit, and hardware benchmarks.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 shrink-0"
                >
                  <FiRefreshCw /> Retake Quiz
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <LoadingSkeleton key={i} className="h-96 rounded-2xl" />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="text-center py-12">
                  <h3 className="text-xl font-bold mb-2">No direct match found</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Try loosening your brand or budget filter to see more laptops.
                  </p>
                  <Button onClick={() => setStep(1)}>Restart Finder</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((laptop: any, index: number) => (
                    <motion.div
                      key={laptop.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card className="h-full flex flex-col justify-between overflow-hidden group hover:shadow-premium transition-all border-2 border-transparent hover:border-primary-500/40">
                        <div>
                          {/* Image & Match Score Badge */}
                          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <img
                              src={getProductImage(laptop)}
                              alt={laptop.name}
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Match Percent Ribbon */}
                            <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <FiAward /> {laptop.matchScore}% Match
                            </div>
                            <div className="absolute top-2.5 left-2.5 bg-gray-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                              {laptop.brand?.name || 'LAPTOP'}
                            </div>
                          </div>

                          <div className="p-5">
                            <Link to={`/products/${laptop.id}`}>
                              <h3 className="font-bold text-gray-900 dark:text-white text-base hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                                {laptop.name}
                              </h3>
                            </Link>

                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-3 line-clamp-1">
                              {laptop.processor || ''} {laptop.ram ? `• ${laptop.ram}GB RAM` : ''}{' '}
                              {laptop.storage ? `• ${laptop.storage}GB SSD` : ''}
                            </p>

                            <p className="text-xl font-black text-primary-600 dark:text-primary-400 mb-4">
                              {formatCurrency(Number(laptop.price) || 0)}
                            </p>

                            {/* Why this matches you */}
                            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
                                Why This Matches You:
                              </span>
                              {laptop.matchReasons?.map((r: string, rIdx: number) => (
                                <p key={rIdx} className="flex items-start gap-1.5">
                                  <FiCheck className="text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{r}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToCompare(laptop)}
                            className="flex items-center justify-center gap-1 text-xs"
                          >
                            <FiLayers /> Compare
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(laptop)}
                            className="flex items-center justify-center gap-1 text-xs"
                          >
                            <FiShoppingCart /> Add to Cart
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LaptopFinder;
