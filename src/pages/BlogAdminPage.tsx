import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  User,
  Tag,
  Image,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle, 
  generateSlug 
} from '../services/blog';
import { BlogArticle, CreateBlogArticleData } from '../types/blog';

function BlogAdminPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBlogArticleData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Weekly Diet Planner Team',
    published_date: new Date().toISOString().split('T')[0],
    read_time: '5 min read',
    category: 'General',
    tags: [],
    image_url: '',
    is_published: false
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Weekly Diet Planner Team',
      published_date: new Date().toISOString().split('T')[0],
      read_time: '5 min read',
      category: 'General',
      tags: [],
      image_url: '',
      is_published: false
    });
    setNewTag('');
    setEditingArticle(null);
    setShowForm(false);
    setError(null);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingArticle) {
        await updateArticle({ ...formData, id: editingArticle.id });
      } else {
        await createArticle(formData);
      }
      
      await fetchArticles();
      resetForm();
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (article: BlogArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content,
      author: article.author,
      published_date: article.published_date,
      read_time: article.read_time || '5 min read',
      category: article.category,
      tags: article.tags || [],
      image_url: article.image_url || '',
      is_published: article.is_published
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle(id);
      await fetchArticles();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article');
    }
  };

  const categories = [
    'General',
    'Food Allergies',
    'Gluten-Free',
    'Keto',
    'Family Planning',
    'Seasonal Cooking',
    'Nutrition',
    'Recipe Tips',
    'Kitchen Safety'
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog Admin - Weekly Diet Planner App</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/blog')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-primary-500" />
            Blog Admin
          </h1>
          
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-4">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-600 mb-2">No Articles Yet</h2>
              <p className="text-gray-500 mb-6">Create your first blog article to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Article
              </button>
            </div>
          ) : (
            articles.map((article, index) => (
              <motion.div
                key={article.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-800">{article.title}</h3>
                      <div className="flex items-center gap-2">
                        {article.is_published ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(article.published_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{article.read_time}</span>
                      </div>
                    </div>
                    
                    {article.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{article.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {article.is_published && (
                      <button
                        onClick={() => navigate(`/blog/${article.slug}`)}
                        className="btn-secondary text-sm"
                        title="View article"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(article)}
                      className="btn-secondary text-sm"
                      title="Edit article"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(article.id)}
                      className="btn-secondary text-sm text-red-600 hover:bg-red-50 border-red-200"
                      title="Delete article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Article Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !saving && resetForm()}
              />
              
              <motion.div
                className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
              >
                <form onSubmit={handleSubmit}>
                  {/* Form Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingArticle ? 'Edit Article' : 'Create New Article'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => !saving && resetForm()}
                      disabled={saving}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter article title"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            URL Slug *
                          </label>
                          <input
                            id="slug"
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="url-friendly-slug"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            URL: /blog/{formData.slug}
                          </p>
                        </div>

                        <div>
                          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                            Author *
                          </label>
                          <input
                            id="author"
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="published_date" className="block text-sm font-medium text-gray-700 mb-1">
                              Published Date *
                            </label>
                            <input
                              id="published_date"
                              type="date"
                              value={formData.published_date}
                              onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="read_time" className="block text-sm font-medium text-gray-700 mb-1">
                              Read Time
                            </label>
                            <input
                              id="read_time"
                              type="text"
                              value={formData.read_time}
                              onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="5 min read"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            required
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                          </label>
                          <input
                            id="image_url"
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://images.pexels.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Add tag"
                            />
                            <button
                              type="button"
                              onClick={handleAddTag}
                              className="btn-secondary"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="hover:text-primary-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id="is_published"
                            type="checkbox"
                            checked={formData.is_published}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                            Publish immediately
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                      </label>
                      <textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Brief description for the blog list page..."
                        rows={3}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content (Markdown) *
                      </label>
                      <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                        placeholder="Write your article content in Markdown..."
                        rows={20}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use Markdown syntax for formatting. Images, links, headers, lists, etc. are supported.
                      </p>
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between">
                    <button
                      type="button"
                      onClick={() => !saving && resetForm()}
                      disabled={saving}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !formData.title.trim() || !formData.content.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingArticle ? 'Update Article' : 'Create Article'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirm(null)}
              />
              
              <motion.div
                className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Article</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this article? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default BlogAdminPage;