import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import blogService from '../services/blogService';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', selectedCategory, page],
    queryFn: () =>
      blogService.getPosts({
        categoryId: selectedCategory || undefined,
        status: 'PUBLISHED',
        page,
        limit: 9,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogService.getCategories,
  });

  return (
    <>
      <Helmet>
        <title>Blog - Premium Laptop Store</title>
        <meta
          name="description"
          content="Latest news, reviews, and guides about laptops and technology"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero */}
        <div className="bg-gradient-hero text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-blue-100">
              Latest news, reviews, and guides about laptops
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="font-bold text-lg mb-4">Categories</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === ''
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    All Posts
                  </button>
                  {categories?.map((category: any) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 font-medium'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {category.name}
                      {category._count && (
                        <span className="float-right text-sm text-gray-600 dark:text-gray-400">
                          {category._count.posts}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            </aside>

            {/* Posts Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <LoadingSkeleton key={i} className="h-80" />
                  ))}
                </div>
              ) : postsData?.data.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for new content
                  </p>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postsData?.data.map((post: any, index: number) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link to={`/blog/${post.slug}`}>
                          <Card className="group hover:shadow-premium transition-all h-full">
                            {post.featuredImage && (
                              <div className="aspect-video overflow-hidden rounded-t-xl">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              {post.category && (
                                <Badge variant="primary" size="sm" className="mb-2">
                                  {post.category.name}
                                </Badge>
                              )}
                              <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                  {post.author &&
                                    `${post.author.firstName} ${post.author.lastName}`}
                                </span>
                                <span>
                                  {new Date(post.publishedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {postsData?.pagination &&
                    postsData.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {page} of {postsData.pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          disabled={page === postsData.pagination.totalPages}
                          onClick={() => setPage((p) => p + 1)}
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

export default Blog;
