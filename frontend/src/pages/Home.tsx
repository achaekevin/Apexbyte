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
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>Added <strong>{product.name}</strong> to cart!</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/cart');
            }}
            className="px-3 py-1 bg-amber-500 text-gray-950 font-bold rounded-lg hover:bg-amber-400 text-xs shadow-sm whitespace-nowrap"
          >
            View Cart
          </button>
        </div>
      ),
      { duration: 4000 }
    );
  };

  return (
    <>
      <Helmet>
        <title>Home - Premium Laptop Store</title>
        <meta name="description" content="Find the perfect laptop for gaming, business, student, or professional use. Best deals on top brands." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Find Your Perfect Laptop
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Discover premium laptops from top brands. Gaming, business, or everyday use - we have it all.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => window.location.href = '/shop'}>
                  Shop Now
                </Button>
                <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-primary-600">
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
                  alt="Premium Laptop"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl transform rotate-6 opacity-20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Featured Laptops</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Hand-picked premium laptops for every need
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
                  <Card className="group hover:shadow-premium transition-all duration-300">
                    <Link to={`/products/${product.id}`}>
                      <div className="relative overflow-hidden rounded-t-xl aspect-square bg-gray-100 dark:bg-gray-800">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.isFeatured && (
                          <Badge className="absolute top-2 right-2" variant="primary">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= product.averageRating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary-600">
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
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-600 dark:text-gray-400">Find the perfect laptop for your needs</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(categories || []).slice(0, 4).map((category: any, index: number) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/shop?category=${category.id}`}>
                  <Card className="text-center hover:shadow-premium cursor-pointer transition-all p-6">
                    <div className="text-4xl mb-4">💻</div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Explore {category.name.toLowerCase()} laptops
                    </p>
                    <span className="text-primary-600 font-medium hover:underline">
                      View Collection →
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Laptop Brand Stores (Jumia Style) */}
      <section className="py-14 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 mb-2">
                <FiAward size={14} /> Official Stores
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Shop by Brand</h2>
              <p className="text-sm text-gray-500 mt-1">100% genuine laptops with authorized distributor warranty</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Explore All Brands <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {(brands || []).map((brand: any) => (
              <Link
                key={brand.id}
                to={`/shop?brand=${brand.slug || brand.id}`}
                className="group block p-4 bg-gray-50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-amber-500 rounded-2xl text-center transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2 mb-3 shadow-inner group-hover:border-amber-500">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-xs text-gray-700 dark:text-gray-200">{brand.name.substring(0, 3)}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">{brand.name}</h3>
                <span className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">Official Store</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check out the latest additions to our collection
            </p>
          </motion.div>

          {loadingNew ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals?.data.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-premium transition-all duration-300">
                    <Link to={`/products/${product.id}`}>
                      <div className="relative overflow-hidden rounded-t-xl aspect-square bg-gray-100 dark:bg-gray-800">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.isNewArrival && (
                          <Badge className="absolute top-2 right-2" variant="success">
                            New
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= product.averageRating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <Button
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
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

      {/* Real Customer Reviews */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-3 border border-white/20">
              <span className="text-yellow-400">★</span> Real Verified Buyers
            </div>
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Authentic reviews from verified buyers who upgraded their setup with our premium laptops
            </p>
          </motion.div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 bg-white/10 animate-pulse rounded-2xl" />
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
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full flex flex-col justify-between p-6 hover:bg-white/15 transition-all duration-300">
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
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center ring-2 ring-white/30 text-sm">
                                {review.user ? getInitials(review.user.firstName, review.user.lastName) : 'VC'}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-white leading-tight">{authorName}</h4>
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-medium">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified Purchase
                              </span>
                            </div>
                          </div>
                          <div className="flex text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-400'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        {review.title && (
                          <h5 className="font-bold text-white mb-2 text-base line-clamp-1">
                            "{review.title}"
                          </h5>
                        )}

                        <p className="text-blue-50 text-sm leading-relaxed mb-4 line-clamp-4">
                          {review.comment}
                        </p>
                      </div>

                      {review.product && (
                        <Link
                          to={`/products/${review.product.id}`}
                          className="pt-3 border-t border-white/10 flex items-center gap-2 group text-xs text-blue-200 hover:text-white transition-colors"
                        >
                          <span className="text-blue-300">Reviewed:</span>
                          <span className="font-medium underline underline-offset-2 truncate">
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
            <div className="text-center py-8 text-blue-100">
              No customer reviews submitted yet. Be the first to review your purchase!
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Free Shipping', desc: 'On orders over KSh 50,000', icon: '🚚' },
              { title: '24/7 Support', desc: 'Expert assistance anytime', icon: '💬' },
              { title: 'Secure Payment', desc: 'Safe & encrypted checkout', icon: '🔒' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
