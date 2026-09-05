import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiAward, FiArrowRight } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE, getInitials } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';

import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

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

      {/* Hero Section - Fully Responsive to Light & Dark Modes */}
      <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 text-slate-900 border-b border-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white dark:border-gray-800 py-16 sm:py-20 overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 dark:bg-white/10 dark:text-white dark:border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 transition-colors">
                <span>🏬</span> Showroom Pickup at Mocha Place, Hospital Road, Kisii CBD
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
                Genuine Laptops, <br />
                Zero Guesswork.
              </h1>
              <p className="text-base sm:text-lg mb-8 text-slate-700 dark:text-slate-200 leading-relaxed max-w-xl">
                Every machine is thoroughly benchmarked with a 7-point diagnostic inspection. Backed by 1-year local warranty, with same-day Kisii courier dispatch or walk-in testing at our Hospital Road shop.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/shop')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg"
                >
                  Explore Laptops in Stock
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('store-guarantees');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/about');
                    }
                  }}
                  className="border-gray-300 text-slate-800 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 cursor-pointer transition-all duration-200"
                >
                  Our 7-Point Inspection
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
                  alt="Apexbyte Premium Laptops Kisii"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-primary-500/10 dark:bg-slate-800 rounded-2xl transform rotate-6 opacity-40 transition-colors" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Human Retail Trust Strip - Fully Responsive to Light & Dark Modes */}
      <section className="bg-gray-100 text-slate-900 border-b border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm sm:text-base">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏬</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">Mocha Place Showroom</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Test before you pay</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛡️</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">1-Year Local Warranty</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Authorized service centers</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚚</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">Same-Day Kisii Delivery</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Dispatched in 2-3 hours</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚡</span>
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm sm:text-base">Free RAM/SSD Installation</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Free labor with purchase</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">Featured Laptops</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Hand-picked certified laptops for every workload
            </p>
          </motion.div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.data.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-premium transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <Link to={`/products/${product.id}`}>
                      <div className="relative overflow-hidden rounded-t-xl aspect-square bg-gray-100 dark:bg-gray-800">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.isFeatured && (
                          <Badge className="absolute top-2 right-2" variant="primary">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <div className="p-5">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-bold text-base sm:text-lg mb-2 text-slate-900 dark:text-white hover:underline transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-base ${
                                star <= product.averageRating
                                  ? 'text-amber-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(product.price)}
                        </span>
                        {product.stock < 10 && product.stock > 0 && (
                          <Badge variant="warning" size="sm">
                            Only {product.stock} left
                          </Badge>
                        )}
                      </div>
                      <Button
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base py-2.5 shadow-sm"
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

      {/* Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">Shop by Category</h2>
            <p className="text-slate-600 dark:text-slate-400">Find the perfect laptop for your specific usage</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(categories || []).slice(0, 4).map((category: any, index: number) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Link to={`/shop?category=${category.id}`}>
                  <Card className="text-center hover:shadow-premium cursor-pointer transition-all p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="text-4xl mb-4">💻</div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{category.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                      Explore {category.name.toLowerCase()} laptops
                    </p>
                    <span className="font-bold text-sm text-primary-600 dark:text-primary-400 hover:underline">
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
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Shop by Brand</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">100% genuine laptops with authorized distributor warranty</p>
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">New Arrivals</h2>
            <p className="text-slate-600 dark:text-slate-400">
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
              {newArrivals?.data.slice(0, 4).map((product: any, index: number) => (
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
                    <div className="p-5">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-bold text-base sm:text-lg mb-2 text-slate-900 dark:text-white hover:underline transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-base ${
                                star <= product.averageRating
                                  ? 'text-amber-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <Button
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base py-2.5 shadow-sm"
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
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 dark:bg-white/10 dark:text-white dark:border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-3 transition-colors">
              <span>★</span> 100% Verified Buyer Reviews
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Verified Customer Feedback</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
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
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Why Kenyan & South Nyanza Professionals Choose Apexbyte
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg">
              Certified retail store with a physical showroom and bench-tested inventory in Kisii
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Showroom Testing',
                desc: 'Walk into Mocha Place, Kisii CBD. Test battery health, thermals, and keyboards before paying.',
                icon: '🏬',
              },
              {
                title: '1-Year Local Warranty',
                desc: '12 months comprehensive hardware coverage backed by local authorized technicians in Kisii.',
                icon: '🛡️',
              },
              {
                title: 'Same-Day Dispatch',
                desc: 'Direct rider delivery within Kisii in 2-3 hours. Countrywide insured courier within 24 hours.',
                icon: '🚚',
              },
              {
                title: 'Trade-Ins & Upgrades',
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
