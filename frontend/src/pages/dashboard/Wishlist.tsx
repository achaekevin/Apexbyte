import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import wishlistService from '../../services/wishlistService';
import { formatCurrency } from '../../utils/helpers';
import { useCartStore } from '../../store/cartStore';

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
  });

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
      price: product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
  };

  const handleRemove = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
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
            {wishlistData?.length || 0} items
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-80" />
            ))}
          </div>
        ) : wishlistData?.length === 0 ? (
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
            {wishlistData?.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-premium transition-all">
                  <div className="relative">
                    <Link to={`/products/${item.product.id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-xl">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove from wishlist"
                    >
                      <span className="text-red-600">×</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/products/${item.product.id}`}>
                      <h3 className="font-semibold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= item.product.averageRating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({item.product.reviewCount})
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600 mb-4">
                      {formatCurrency(item.product.price)}
                    </p>
                    <Button
                      fullWidth
                      onClick={() => handleAddToCart(item.product)}
                      disabled={item.product.stock === 0}
                    >
                      {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
