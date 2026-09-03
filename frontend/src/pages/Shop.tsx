import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../services/productService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCartStore();

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ram: searchParams.get('ram') || '',
    storage: searchParams.get('storage') || '',
    processor: searchParams.get('processor') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(true);

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () =>
      fetch('http://localhost:3000/api/brands')
        .then((res) => res.json())
        .then((data) => data.data),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      fetch('http://localhost:3000/api/categories')
        .then((res) => res.json())
        .then((data) => data.data),
  });

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
  });

  // Update URL params when filters change
  useEffect(() => {
    const params: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params[key] = value.toString();
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 when filter changes
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      ram: '',
      storage: '',
      processor: '',
      sort: 'createdAt',
      order: 'desc',
      page: 1,
      limit: 12,
    });
  };

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

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ramOptions = ['4', '8', '16', '32', '64'];
  const storageOptions = ['128', '256', '512', '1024', '2048'];
  const processorOptions = [
    'Intel Core i3',
    'Intel Core i5',
    'Intel Core i7',
    'Intel Core i9',
    'AMD Ryzen 3',
    'AMD Ryzen 5',
    'AMD Ryzen 7',
    'AMD Ryzen 9',
    'Apple M1',
    'Apple M2',
    'Apple M3',
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'averageRating-desc', label: 'Highest Rated' },
    { value: 'salesCount-desc', label: 'Best Selling' },
  ];

  const activeFiltersCount = [
    filters.brand,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.ram,
    filters.storage,
    filters.processor,
  ].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>Shop Laptops - Premium Laptop Store</title>
        <meta
          name="description"
          content="Browse our extensive collection of premium laptops. Filter by brand, price, specs, and more. Free shipping on orders over $500."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Shop Laptops</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {productsData?.pagination.total || 0} products available
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && (
                <motion.aside
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-1"
                >
                  <Card className="sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Filters</h2>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetFilters}
                        >
                          Reset All
                        </Button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Search
                        </label>
                        <Input
                          type="text"
                          placeholder="Search laptops..."
                          value={filters.search}
                          onChange={(e) =>
                            handleFilterChange('search', e.target.value)
                          }
                        />
                      </div>

                      {/* Brand */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Brand
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={filters.brand}
                          onChange={(e) =>
                            handleFilterChange('brand', e.target.value)
                          }
                        >
                          <option value="">All Brands</option>
                          {brands?.map((brand: any) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Category
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={filters.category}
                          onChange={(e) =>
                            handleFilterChange('category', e.target.value)
                          }
                        >
                          <option value="">All Categories</option>
                          {categories?.map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Price Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) =>
                              handleFilterChange('minPrice', e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) =>
                              handleFilterChange('maxPrice', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* RAM */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          RAM (GB)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ramOptions.map((ram) => (
                            <button
                              key={ram}
                              onClick={() =>
                                handleFilterChange(
                                  'ram',
                                  filters.ram === ram ? '' : ram
                                )
                              }
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                filters.ram === ram
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {ram}GB
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Storage */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Storage (GB)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {storageOptions.map((storage) => (
                            <button
                              key={storage}
                              onClick={() =>
                                handleFilterChange(
                                  'storage',
                                  filters.storage === storage ? '' : storage
                                )
                              }
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                filters.storage === storage
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {parseInt(storage) >= 1024
                                ? `${parseInt(storage) / 1024}TB`
                                : `${storage}GB`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Processor */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Processor
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          value={filters.processor}
                          onChange={(e) =>
                            handleFilterChange('processor', e.target.value)
                          }
                        >
                          <option value="">All Processors</option>
                          {processorOptions.map((processor) => (
                            <option key={processor} value={processor}>
                              {processor}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Sort and View Options */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Sort by:</label>
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    value={`${filters.sort}-${filters.order}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setFilters((prev) => ({ ...prev, sort, order, page: 1 }));
                    }}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}{' '}
                      active
                    </span>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <LoadingSkeleton key={i} />
                  ))}
                </div>
              ) : productsData?.data.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button onClick={handleResetFilters}>Reset Filters</Button>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsData?.data.map((product: any, index: number) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group hover:shadow-premium transition-all duration-300 h-full flex flex-col">
                          <Link to={`/products/${product.id}`}>
                            <div className="relative overflow-hidden rounded-t-xl aspect-square">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 flex flex-col gap-2">
                                {product.isFeatured && (
                                  <Badge variant="primary">Featured</Badge>
                                )}
                                {product.isNewArrival && (
                                  <Badge variant="success">New</Badge>
                                )}
                              </div>
                            </div>
                          </Link>
                          <div className="p-4 flex-1 flex flex-col">
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

                            {/* Specs */}
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 space-y-1">
                              {product.specifications?.processor && (
                                <div className="line-clamp-1">
                                  {product.specifications.processor}
                                </div>
                              )}
                              {product.specifications?.ram &&
                                product.specifications?.storage && (
                                  <div>
                                    {product.specifications.ram}GB RAM |{' '}
                                    {parseInt(product.specifications.storage) >= 1024
                                      ? `${parseInt(product.specifications.storage) / 1024}TB`
                                      : `${product.specifications.storage}GB`}{' '}
                                    SSD
                                  </div>
                                )}
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-primary-600">
                                  {formatCurrency(product.price)}
                                </span>
                                {product.stock < 10 && product.stock > 0 && (
                                  <Badge variant="warning" size="sm">
                                    Only {product.stock} left
                                  </Badge>
                                )}
                                {product.stock === 0 && (
                                  <Badge variant="error" size="sm">
                                    Out of Stock
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
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {productsData?.pagination && productsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        disabled={filters.page === 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-2">
                        {Array.from(
                          { length: productsData.pagination.totalPages },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            // Show first, last, current, and adjacent pages
                            return (
                              page === 1 ||
                              page === productsData.pagination.totalPages ||
                              Math.abs(page - filters.page) <= 1
                            );
                          })
                          .map((page, index, array) => (
                            <>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span key={`ellipsis-${page}`} className="px-2">
                                  ...
                                </span>
                              )}
                              <Button
                                key={page}
                                variant={filters.page === page ? 'primary' : 'outline'}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            </>
                          ))}
                      </div>

                      <Button
                        variant="outline"
                        disabled={
                          filters.page === productsData.pagination.totalPages
                        }
                        onClick={() => handlePageChange(filters.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
