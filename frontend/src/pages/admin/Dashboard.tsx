import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiTag,
  FiDollarSign,
  FiPlus,
  FiAlertTriangle,
  FiArrowRight,
  FiEye,
} from 'react-icons/fi';
import productService from '../../services/productService';
import brandService from '../../services/brandService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatCurrency, getProductImage } from '../../utils/helpers';

const AdminDashboard = () => {
  // Fetch products summary
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-dashboard-products'],
    queryFn: () => productService.getProducts({ limit: 8, sortBy: 'createdAt', order: 'desc' }),
  });

  // Fetch brands summary
  const { data: brands, isLoading: loadingBrands } = useQuery({
    queryKey: ['admin-dashboard-brands'],
    queryFn: () => brandService.getBrands(),
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.pagination?.total || products.length;
  const totalBrands = brands?.length || 0;

  // Calculate low stock / out of stock
  const lowStockCount = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p: any) => p.stock === 0).length;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Store Owner & Executive Control Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to Apexbyte Admin
          </h1>
          <p className="text-blue-100 mt-2 max-w-xl text-sm sm:text-base">
            Manage your entire laptop catalog, update prices in Kenyan Shillings, and upload new laptop brands seamlessly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/products">
            <Button className="bg-white text-primary-700 hover:bg-blue-50 shadow-md font-bold" leftIcon={<FiPlus />}>
              Add Laptop
            </Button>
          </Link>
          <Link to="/admin/brands">
            <Button variant="outline" className="border-white text-white hover:bg-white/10" leftIcon={<FiTag />}>
              Add Brand
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Laptops */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Laptops</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {loadingProducts ? '...' : totalProducts}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Active in Storefront
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FiPackage size={24} />
            </div>
          </Card>
        </motion.div>

        {/* Laptop Brands */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Laptop Brands</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {loadingBrands ? '...' : totalBrands}
              </h3>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                Dell, Apple, HP & custom
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FiTag size={24} />
            </div>
          </Card>
        </motion.div>

        {/* Inventory Health */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Alerts</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {outOfStockCount > 0 ? `${outOfStockCount} Out` : `${lowStockCount} Low`}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                Requires restocking
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FiAlertTriangle size={24} />
            </div>
          </Card>
        </motion.div>

        {/* Store Currency */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Currency</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                KES (KSh)
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Kenyan Shillings Enabled
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FiDollarSign size={24} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/products" className="block group">
          <Card className="p-6 border-l-4 border-l-primary-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  Edit Laptop Prices & Stock
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Adjust selling prices in KSh, compare-at prices, stock levels, or specifications.
                </p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </Card>
        </Link>

        <Link to="/admin/brands" className="block group">
          <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  Upload & Manage Brands
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Add new laptop manufacturers, logos, descriptions, and official links.
                </p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </Card>
        </Link>

        <Link to="/" target="_blank" className="block group">
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  View Customer Storefront
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Browse the live shop with real verified customer reviews and natural laptop photos.
                </p>
              </div>
              <FiEye className="text-gray-400 group-hover:text-emerald-500 transition-all" size={20} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Laptops in Catalog */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Laptops in Catalog
            </h3>
            <p className="text-sm text-gray-500">
              Quickly preview and edit recent models added to your inventory
            </p>
          </div>
          <Link to="/admin/products">
            <Button variant="outline" size="sm" rightIcon={<FiArrowRight />}>
              Manage All Laptops
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.slice(0, 6).map((product: any) => (
            <div
              key={product.id}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-900 border flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/laptops/dell-vostro-natural.png';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {product.brand?.name} • {product.ram}GB RAM • {product.storage}GB SSD
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {formatCurrency(product.price)}
                  </div>
                  <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </Badge>
                </div>

                <Link to="/admin/products">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
