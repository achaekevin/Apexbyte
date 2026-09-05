import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiSearch, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import { useComparisonStore } from '../store/comparisonStore';
import { useCartStore } from '../store/cartStore';
import productService from '../services/productService';
import toast from 'react-hot-toast';

const Compare = () => {
  const { products, addProduct, removeProduct, clearAll, isInComparison } = useComparisonStore();
  const { addItem } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load products catalog for the interactive compare picker
  const { data: catalogData } = useQuery({
    queryKey: ['compare-catalog', searchTerm],
    queryFn: () => productService.getProducts({ search: searchTerm || undefined, limit: 16 }),
  });

  const availableLaptops = catalogData?.data || [];

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      quantity: 1,
      stock: product.stock,
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  const handleAddLaptop = (laptop: any) => {
    if (products.length >= 4) {
      toast.error('You can compare up to 4 laptops at once.');
      return;
    }
    addProduct(laptop);
    toast.success(`Added ${laptop.name} to comparison!`);
  };

  return (
    <>
      <Helmet>
        <title>{`Compare ${products.length} Laptops - Apexbyte Store`}</title>
        <meta
          name="description"
          content="Compare laptop technical specifications, processors, RAM, GPU, displays, and prices side-by-side."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Compare Laptops Side-by-Side
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {products.length === 0
                  ? 'Select any 2 to 4 laptops below to analyze their specs and pricing.'
                  : `Comparing ${products.length} of 4 maximum laptops.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-2"
              >
                <FiPlus size={16} />
                <span>{isSearchOpen ? 'Hide Laptop Selector' : 'Add Laptop to Compare'}</span>
              </Button>

              {products.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500 hover:text-red-600">
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Laptop Search & Select Drawer */}
          {(isSearchOpen || products.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-900 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiSearch className="text-primary-600" /> Choose Laptops to Compare
                    </h3>
                    <p className="text-xs text-gray-500">
                      Search by brand (Apple, HP, Dell, Lenovo, ASUS, Samsung) or model name:
                    </p>
                  </div>
                  {products.length > 0 && (
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
                    >
                      Close Selector ✕
                    </button>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <Input
                    type="text"
                    placeholder="Search laptops (e.g. ThinkPad, XPS, MacBook, Pavilion, ROG)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Grid of Selectable Laptops */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-1">
                  {availableLaptops.map((laptop: any) => {
                    const alreadySelected = isInComparison(laptop.id);
                    return (
                      <div
                        key={laptop.id}
                        className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                          alreadySelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 bg-gray-50 dark:bg-gray-900/50'
                        }`}
                      >
                        <img
                          src={getProductImage(laptop)}
                          alt={laptop.name}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-14 h-14 object-cover rounded-lg bg-white dark:bg-gray-800 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-1">
                            {laptop.name}
                          </h4>
                          <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">
                            {formatCurrency(laptop.price)}
                          </p>
                          <button
                            type="button"
                            onClick={() => (alreadySelected ? removeProduct(laptop.id) : handleAddLaptop(laptop))}
                            className={`mt-1.5 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                              alreadySelected
                                ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-red-100 hover:text-red-700'
                                : 'text-primary-700 bg-primary-100 dark:bg-primary-900/50 hover:bg-primary-200'
                            }`}
                          >
                            {alreadySelected ? (
                              <>
                                <FiCheck size={13} /> Selected (Remove)
                              </>
                            ) : (
                              <>
                                <FiPlus size={13} /> Add to Compare
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Comparison Content */}
          {products.length === 0 ? (
            <Card className="text-center py-16 px-4">
              <div className="text-6xl mb-4">⚖️</div>
              <h2 className="text-2xl font-bold mb-2">No Laptops Selected Yet</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                Use the selector above or browse our store to pick any 2 or more laptops to compare specs, performance, and prices.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setIsSearchOpen(true)}>Choose from Catalog</Button>
                <Link to="/shop">
                  <Button variant="outline">Browse Shop</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Product Cards Row */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-72 sm:w-80 flex-shrink-0"
                    >
                      <Card className="h-full flex flex-col justify-between p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
                        {/* Remove Button */}
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute top-3 right-3 z-10 w-7 h-7 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 shadow transition-colors"
                          title="Remove from comparison"
                        >
                          <FiX size={14} />
                        </button>

                        <div>
                          {/* Image */}
                          <Link to={`/products/${product.id}`} className="block">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 mb-3 relative group">
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {product.brand?.name && (
                                <span className="absolute bottom-2 left-2 bg-black/75 text-white text-xs font-black px-2.5 py-1 rounded backdrop-blur-sm uppercase tracking-wide">
                                  {product.brand.name}
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* Title */}
                          <Link to={`/products/${product.id}`}>
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 hover:text-primary-600 transition-colors mb-2">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Price */}
                          <p className="text-2xl font-black text-primary-600 dark:text-primary-400 mb-3">
                            {formatCurrency(product.price)}
                          </p>
                        </div>

                        {/* Cart Button */}
                        <Button
                          fullWidth
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="flex items-center justify-center gap-2 mt-3"
                        >
                          <FiShoppingCart size={14} />
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Add More Slot */}
                  {products.length < 4 && (
                    <div className="w-72 sm:w-80 flex-shrink-0">
                      <div
                        onClick={() => setIsSearchOpen(true)}
                        className="h-full min-h-[350px] border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-white/50 dark:bg-gray-800/50 hover:bg-primary-50/20 transition-all text-center group"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <FiPlus size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                          Add Another Laptop
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Compare up to 4 models side-by-side
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Side-by-Side Detailed Specs Matrix */}
              <Card className="p-6 overflow-hidden">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Technical Specifications Comparison
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="py-3.5 px-4 w-48 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs sm:text-sm tracking-wider">
                          Specification
                        </th>
                        {products.map((product) => (
                          <th key={product.id} className="py-3.5 px-4 w-72 sm:w-80 font-bold text-gray-900 dark:text-white">
                            <span className="line-clamp-1">{product.name}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {/* Price */}
                      <tr className="bg-primary-50/30 dark:bg-primary-950/20 font-bold">
                        <td className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-bold">Price</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 text-primary-600 dark:text-primary-400 text-lg font-black">
                            {formatCurrency(p.price)}
                          </td>
                        ))}
                      </tr>

                      {/* Brand */}
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">Brand</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {p.brand?.name || 'LAPTOP'}
                          </td>
                        ))}
                      </tr>

                      {/* Processor */}
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">Processor</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium">
                            {p.processor || p.specifications?.processor || '-'}
                            {p.processorGen ? ` (${p.processorGen})` : ''}
                          </td>
                        ))}
                      </tr>

                      {/* RAM */}
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">RAM (Memory)</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {p.ram ? `${p.ram} GB ${p.ramType || 'DDR4'}` : p.specifications?.ram || '-'}
                          </td>
                        ))}
                      </tr>

                      {/* Storage */}
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">Storage</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {p.storage ? `${p.storage} GB ${p.storageType || 'SSD'}` : p.specifications?.storage || '-'}
                          </td>
                        ))}
                      </tr>

                      {/* Graphics (GPU) */}
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">Graphics</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium">
                            {p.gpu || (p.gpuBrand ? `${p.gpuBrand} ${p.gpuMemory ? `${p.gpuMemory}GB` : ''}` : 'Integrated Graphics')}
                          </td>
                        ))}
                      </tr>

                      {/* Display */}
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">Display</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium">
                            {p.displaySize ? `${p.displaySize}"` : ''} {p.displayResolution || ''} {p.displayType || ''}{' '}
                            {p.refreshRate ? `(${p.refreshRate}Hz)` : ''}
                            {p.touchscreen ? ' • Touchscreen' : ''}
                          </td>
                        ))}
                      </tr>

                      {/* Operating System */}
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">OS</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium">
                            {p.operatingSystem ? p.operatingSystem.replace(/_/g, ' ') : 'Windows 11'}
                          </td>
                        ))}
                      </tr>

                      {/* Weight */}
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">Weight</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium">
                            {p.weight ? `${p.weight} kg` : 'Approx. 1.6 kg'}
                          </td>
                        ))}
                      </tr>

                      {/* Stock Status */}
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-500">Availability</td>
                        {products.map((p) => (
                          <td key={p.id} className="py-3 px-4">
                            {p.stock > 0 ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {p.stock} units in stock
                              </span>
                            ) : (
                              <span className="text-red-500 font-semibold">Out of Stock</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Compare;
