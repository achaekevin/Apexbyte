import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiClock, FiEye, FiUser, FiCalendar, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import blogService from '../services/blogService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useAuthStore } from '../store/authStore';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getPost(slug!),
    enabled: !!slug,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['blog-recent'],
    queryFn: () => blogService.getPosts({ limit: 4, status: 'PUBLISHED' }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      blogService.createComment({ postId: post?.id || '', content }),
    onSuccess: () => {
      toast.success('Your comment has been submitted for review!');
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['blog-post', slug] });
    },
    onError: () => {
      toast.error('Failed to submit comment. Please try again.');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
    if (!user) {
      toast.error('Please log in to leave a comment.');
      return;
    }
    commentMutation.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSkeleton className="h-8 w-48 mb-6" />
        <LoadingSkeleton className="h-12 w-full mb-4" />
        <LoadingSkeleton className="h-6 w-96 mb-8" />
        <LoadingSkeleton className="h-96 w-full rounded-2xl mb-8" />
        <LoadingSkeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <Card className="text-center p-10 max-w-md">
          <div className="text-6xl mb-4">📰</div>
          <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            The article you are looking for does not exist or may have been moved.
          </p>
          <Link to="/blog">
            <Button>
              <FiArrowLeft className="mr-2 inline" /> Back to Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const wordCount = post.content ? post.content.split(/\s+/).length : 250;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <>
      <Helmet>
        <title>{`${post.title} - Apexbyte Blog`}</title>
        <meta name="description" content={post.excerpt || post.metaDescription || post.title} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-6"
          >
            <FiArrowLeft /> Back to all articles
          </Link>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {post.category && (
              <Badge variant="primary" size="md" className="mb-4">
                {post.category.name}
              </Badge>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-3 tracking-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author & Meta Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center font-bold text-xs">
                  {post.author?.firstName ? post.author.firstName.charAt(0) : 'A'}
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Apexbyte Team'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <FiCalendar size={14} />
                <span>
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <FiClock size={14} />
                <span>{readTime} min read</span>
              </div>

              <div className="flex items-center gap-1.5">
                <FiEye size={14} />
                <span>{post.views || 1} views</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="my-8 rounded-2xl overflow-hidden shadow-xl aspect-video bg-gray-100 dark:bg-gray-800">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Body Content */}
            <Card className="p-6 sm:p-10 mb-12 prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed space-y-4">
              {post.content.split('\n\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-2xl font-bold text-gray-900 dark:text-white pt-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-xl font-bold text-gray-900 dark:text-white pt-3 pb-1">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-1 pl-2">
                      {items.map((item, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">
                          {item.replace(/^[-*]\s+/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (/^\d+\.\s/.test(paragraph)) {
                  const items = paragraph.split('\n');
                  return (
                    <ol key={idx} className="list-decimal list-inside space-y-1.5 pl-2">
                      {items.map((item, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">
                          {item.replace(/^\d+\.\s+/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={idx} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </Card>

            {/* Comments Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FiMessageSquare /> Comments ({post.comments?.length || 0})
              </h3>

              {/* Add Comment Form */}
              <Card className="p-6 mb-8">
                <h4 className="font-semibold text-sm mb-3">Leave your thoughts</h4>
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      user
                        ? 'Share your experience or ask a question...'
                        : 'Please log in to submit a comment'
                    }
                    disabled={!user || commentMutation.isPending}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <div className="flex justify-between items-center">
                    {!user ? (
                      <Link to="/login" className="text-xs text-primary-600 font-medium hover:underline">
                        Sign in to post
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">Posting as {user.firstName}</span>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!user || !commentText.trim() || commentMutation.isPending}
                    >
                      {commentMutation.isPending ? 'Submitting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Comments List */}
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((comment: any) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs">
                          <FiUser size={12} />
                        </div>
                        <span className="font-semibold text-sm">
                          {comment.name || comment.user?.firstName || 'Customer'}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 pl-9">
                        {comment.comment || comment.content}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No comments yet. Be the first to share your opinion!</p>
              )}
            </div>

            {/* More Articles */}
            {recentPosts?.data && recentPosts.data.length > 0 && (
              <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-2xl font-bold mb-6">More Guides & Reviews</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recentPosts.data
                    .filter((p: any) => p.slug !== post.slug)
                    .slice(0, 2)
                    .map((item: any) => (
                      <Link key={item.id} to={`/blog/${item.slug}`}>
                        <Card className="p-4 group hover:shadow-lg transition-all h-full flex flex-col justify-between">
                          <div>
                            {item.featuredImage && (
                              <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={item.featuredImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <h4 className="font-bold text-base group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{item.excerpt}</p>
                          </div>
                          <span className="text-xs font-semibold text-primary-600 mt-3 flex items-center gap-1">
                            Read article →
                          </span>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
