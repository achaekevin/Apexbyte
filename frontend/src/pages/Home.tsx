import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import productService from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';

import api from '../services/api';

const Home = () => {
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

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Graphic Designer',
      image: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      text: 'Amazing experience! Found the perfect laptop for my design work. Fast shipping and excellent customer service.',
    },
    {
      name: 'Michael Chen',
      role: 'Software Developer',
      image: 'https://i.pravatar.cc/150?img=2',
      rating: 5,
      text: 'Best prices and great selection. The product descriptions were accurate and helpful in making my decision.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      image: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      text: 'Affordable options for students. The laptop I bought has been perfect for all my coursework and projects.',
    },
  ];

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
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
                      <div className="relative overflow-hidden rounded-t-xl aspect-square">
                        <img
                          src={product.images[0]}
                          alt={product.name}
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
                      <div className="relative overflow-hidden rounded-t-xl aspect-square">
                        <img
                          src={product.images[0]}
                          alt={product.name}
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

      {/* Testimonials */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-blue-100">
              Join thousands of satisfied customers worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-blue-100">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= testimonial.rating
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-blue-50">{testimonial.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
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
