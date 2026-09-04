import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Input from '../components/ui/Input';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useComparisonStore } from '../store/comparisonStore';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const productId = id || slug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { addProduct, products: comparisonProducts } = useComparisonStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);

  // Instant scroll-to-top and reset on product navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedImage(0);
    setQuantity(1);
  }, [productId]);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getProduct(productId!),
    enabled: !!productId,
    staleTime: 0,
  });

  // Fetch product reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?.id || productId],
    queryFn: () => reviewService.getProductReviews(product?.id || productId!),
    enabled: !!(product?.id || productId),
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.id || productId],
    queryFn: () => productService.getRelatedProducts(product?.id || productId!),
    enabled: !!(product?.id || productId),
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (formData: FormData) => reviewService.createReview(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id || productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'featured'] });
      setReviewRating(5);
      setReviewText('');
      setReviewImages([]);
      toast.success('Thank you! Your verified review has been submitted successfully.');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    },
  });

  // Mark review as helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.markAsHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id || productId] });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      quantity,
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

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleAddToComparison = () => {
    if (!product) return;
    addProduct(product);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('productId', product?.id || productId!);
    formData.append('rating', reviewRating.toString());
    formData.append('comment', reviewText);
    formData.append('title', reviewRating >= 4 ? 'Great Experience' : 'Customer Review');
    reviewImages.forEach((image) => {
      formData.append('images', image);
    });

    submitReviewMutation.mutate(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReviewImages((prev) => [...prev, ...files].slice(0, 5));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-96" />
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isInComparison = comparisonProducts.some((p) => p.id === product.id);
  const canAddToComparison = comparisonProducts.length < 4;

  return (
    <>
      <Helmet>
        <title>{`${product.name} - Apexbyte Laptops`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={getProductImage(product)} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              to="/shop"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
            >
              Shop
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {product.name}
            </span>
          </nav>

          {/* Product Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div>
              <Card className="p-4">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={getProductImage(product, selectedImage)}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <div className="grid grid-cols-4 gap-2">
                  {(product.images || [product]).map((_imgItem: any, index: number) => {
                    const imgUrl = getProductImage(product, index);
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all bg-gray-100 dark:bg-gray-800 ${
                          selectedImage === index
                            ? 'border-primary-600'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} ${index + 1}`}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Product Info */}
            <div>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {product.brand && (
                      <Link
                        to={`/shop?brand=${product.brand.slug || product.brand.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {product.brand.name}
                      </Link>
                    )}
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  </div>
                  <div className="flex flex-col gap-2">
                    {product.isFeatured && <Badge variant="primary">Featured</Badge>}
                    {product.isNewArrival && <Badge variant="success">New</Badge>}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xl ${
                          star <= product.averageRating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.stock > 0 ? (
                      <>
                        <Badge variant="success">In Stock</Badge>
                        {product.stock < 10 && (
                          <span className="text-sm text-orange-600">
                            Only {product.stock} left!
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="error">Out of Stock</Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {product.description}
                </p>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              product.stock,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        disabled={quantity >= product.stock}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    fullWidth
                    size="lg"
                    variant="outline"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    Buy Now
                  </Button>
                  <Button
                    fullWidth
                    variant="ghost"
                    onClick={handleAddToComparison}
                    disabled={isInComparison || !canAddToComparison}
                  >
                    {isInComparison
                      ? 'Already in Comparison'
                      : !canAddToComparison
                      ? 'Comparison Full (Max 4)'
                      : 'Add to Comparison'}
                  </Button>
                </div>

                {/* Key Features */}
                {product.specifications && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="font-bold mb-3">Key Specifications</h3>
                    <div className="space-y-2 text-sm">
                      {product.specifications.processor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Processor:
                          </span>
                          <span className="font-medium">
                            {product.specifications.processor}
                          </span>
                        </div>
                      )}
                      {product.specifications.ram && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            RAM:
                          </span>
                          <span className="font-medium">
                            {product.specifications.ram}GB
                          </span>
                        </div>
                      )}
                      {product.specifications.storage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Storage:
                          </span>
                          <span className="font-medium">
                            {parseInt(product.specifications.storage) >= 1024
                              ? `${parseInt(product.specifications.storage) / 1024}TB`
                              : `${product.specifications.storage}GB`}{' '}
                            SSD
                          </span>
                        </div>
                      )}
                      {product.specifications.gpu && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Graphics:
                          </span>
                          <span className="font-medium">
                            {product.specifications.gpu}
                          </span>
                        </div>
                      )}
                      {product.specifications.display && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Display:
                          </span>
                          <span className="font-medium">
                            {product.specifications.display}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-12">
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'specs'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Reviews ({product.reviewCount})
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'specs' ? (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                      Technical Specifications
                    </h2>
                    {product.specifications ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(Object.entries(product.specifications) as [string, any][]).map(
                          ([key, value]) =>
                            value ? (
                              <div
                                key={key}
                                className="border-b border-gray-200 dark:border-gray-700 pb-3"
                              >
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  {key.charAt(0).toUpperCase() +
                                    key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </div>
                                <div className="font-medium">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </div>
                              </div>
                            ) : null
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No specifications available.
                      </p>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                    {/* Review Form */}
                    {user && (
                      <form onSubmit={handleSubmitReview} className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold mb-4">Write a Review</h3>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">
                            Rating
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className={`text-3xl ${
                                  star <= reviewRating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={4}
                            required
                            minLength={10}
                            maxLength={500}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">
                            Photos (Optional, max 5)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="w-full"
                          />
                          {reviewImages.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {reviewImages.map((img, i) => (
                                <div key={i} className="relative">
                                  <img
                                    src={URL.createObjectURL(img)}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReviewImages((prev) =>
                                        prev.filter((_, idx) => idx !== i)
                                      )
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={submitReviewMutation.isPending}
                        >
                          {submitReviewMutation.isPending
                            ? 'Submitting...'
                            : 'Submit Review'}
                        </Button>
                      </form>
                    )}

                    {/* Reviews List                    {/* Reviews List */}
                    <div className="space-y-6">
                      {(() => {
                        const reviewsList: any[] = Array.isArray(reviewsData?.reviews)
                          ? reviewsData.reviews
                          : Array.isArray(reviewsData?.data)
                          ? reviewsData.data
                          : Array.isArray(reviewsData)
                          ? reviewsData
                          : [];

                        if (reviewsList.length === 0) {
                          return (
                            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                              No reviews yet. Be the first to review this product!
                            </p>
                          );
                        }

                        return reviewsList.map((review: any) => (
                          <div
                            key={review.id}
                            className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                  <span className="font-bold text-primary-600">
                                    {review.user?.firstName?.[0] || 'U'}
                                    {review.user?.lastName?.[0] || 'C'}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {review.user?.firstName} {review.user?.lastName}
                                    {(review.isVerifiedPurchase || review.isVerified) && (
                                      <Badge
                                        variant="success"
                                        size="sm"
                                        className="ml-2"
                                      >
                                        Verified Purchase
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-sm ${
                                            star <= review.rating
                                              ? 'text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {review.title}
                              </h4>
                            )}
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                              {review.comment}
                            </p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mb-3">
                                {review.images.map((img: any, i: number) => {
                                  const imgUrl = typeof img === 'string' ? img : img.url;
                                  return (
                                    <img
                                      key={i}
                                      src={imgUrl}
                                      alt=""
                                      className="w-20 h-20 object-cover rounded"
                                    />
                                  );
                                })}
                              </div>
                            )}
                            <button
                              onClick={() => markHelpfulMutation.mutate(review.id)}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
                            >
                              Helpful ({review.helpfulCount || 0})
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct: any) => (
                  <Link key={relatedProduct.id} to={`/products/${relatedProduct.id}`}>
                    <Card className="group hover:shadow-premium transition-all duration-300 h-full">
                      <div className="relative overflow-hidden rounded-t-xl aspect-square bg-gray-100 dark:bg-gray-800">
                        <img
                          src={getProductImage(relatedProduct)}
                          alt={relatedProduct.name}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= relatedProduct.averageRating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xl font-bold text-primary-600">
                          {formatCurrency(relatedProduct.price)}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
