import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import wishlistService from '../../services/wishlistService';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../../utils/helpers';
import { useCartStore } from '../../store/cartStore';

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();

  const { data: rawWishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
  });

  const wishlistItems: any[] = Array.isArray(rawWishlistData)
    ? rawWishlistData
    : (rawWishlistData as any)?.items && Array.isArray((rawWishlistData as any).items)
    ? (rawWishlistData as any).items
    : [];

  const removeFromWishlistMutation = useMutation({
    mutationFn: wishlistService.removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0,
      image: getProductImage(product),
      quantity: 1,
      stock: product.stock,
    });
  };

  const handleRemove = (item: any) => {
    const idToRemove = item.id || item.productId || item.product?.id;
    if (idToRemove) {
      removeFromWishlistMutation.mutate(idToRemove);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Wishlist - Premium Laptop Store</title>
      </Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-80" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Save items you love for later
            </p>
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item: any, index: number) => {
              const product = item.product || item;
              if (!product || !product.id) return null;

              return (
                <motion.div
                  key={item.id || product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-premium transition-all">
                    <div className="relative">
                      <Link to={`/products/${product.id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-800">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemove(item)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove from wishlist"
                      >
                        <span className="text-red-600 font-bold text-lg leading-none">×</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= Math.round(product.averageRating || 5)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-primary-600 mb-4">
                        {formatCurrency(Number(product.price) || 0)}
                      </p>
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
