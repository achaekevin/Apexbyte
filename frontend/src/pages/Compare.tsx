import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatCurrency } from '../utils/helpers';
import { useComparisonStore } from '../store/comparisonStore';
import { useCartStore } from '../store/cartStore';

const Compare = () => {
  const { products, removeProduct, clearAll } = useComparisonStore();
  const { addItem } = useCartStore();

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

  if (products.length === 0) {
    return (
      <>
        <Helmet>
          <title>Compare Laptops - Premium Laptop Store</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <div className="text-8xl mb-6">🔄</div>
              <h2 className="text-3xl font-bold mb-4">No Products to Compare</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Add products from the shop to compare their specifications
              </p>
              <Link to="/shop">
                <Button size="lg">Browse Products</Button>
              </Link>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const specs = [
    { key: 'processor', label: 'Processor' },
    { key: 'ram', label: 'RAM' },
    { key: 'storage', label: 'Storage' },
    { key: 'gpu', label: 'Graphics' },
    { key: 'display', label: 'Display' },
    { key: 'battery', label: 'Battery' },
    { key: 'weight', label: 'Weight' },
    { key: 'warranty', label: 'Warranty' },
  ];

  return (
    <>
      <Helmet>
        <title>Compare {products.length} Laptops - Premium Laptop Store</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Compare Laptops</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comparing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-flex gap-4 pb-4">
              {/* Product Cards */}
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-80 flex-shrink-0"
                >
                  <Card className="h-full">
                    <div className="relative">
                      <Link to={`/products/${product.id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-xl">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="text-red-600">×</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-bold text-lg mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
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
                      <p className="text-3xl font-bold text-primary-600 mb-4">
                        {formatCurrency(product.price)}
                      </p>
                      {product.stock > 0 ? (
                        <Badge variant="success" className="mb-4">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="error" className="mb-4">
                          Out of Stock
                        </Badge>
                      )}
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

              {/* Add More Slot */}
              {products.length < 4 && (
                <div className="w-80 flex-shrink-0">
                  <Link to="/shop">
                    <Card className="h-full flex items-center justify-center min-h-[400px] hover:shadow-premium transition-all cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-center p-6">
                        <div className="text-6xl mb-4">➕</div>
                        <h3 className="font-bold text-lg mb-2">Add Product</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Compare up to 4 products
                        </p>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Comparison Table */}
          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">Specifications</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-bold">Feature</th>
                    {products.map((product) => (
                      <th key={product.id} className="text-left py-3 px-4 w-80">
                        <div className="text-sm font-normal text-gray-600 dark:text-gray-400 line-clamp-1">
                          {product.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec, index) => (
                    <tr
                      key={spec.key}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">{spec.label}</td>
                      {products.map((product) => (
                        <td key={product.id} className="py-3 px-4">
                          {product.specifications?.[spec.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Brand</td>
                    {products.map((product) => (
                      <td key={product.id} className="py-3 px-4">
                        {product.brand?.name || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <td className="py-3 px-4 font-medium">Category</td>
                    {products.map((product) => (
                      <td key={product.id} className="py-3 px-4">
                        {product.category?.name || '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Compare;
