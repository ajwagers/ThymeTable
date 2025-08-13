import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Heart, ExternalLink } from 'lucide-react';

// Import the markdown content
import foodAllergyArticle from '../content/articles/food_allergy_meal_planning.md?raw';

function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<{
    title: string;
    content: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    tags: string[];
    excerpt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Map slugs to article data
    const articleMap: Record<string, any> = {
      'food-allergy-meal-planning': {
        title: "10 Essential Tips for Meal Planning with Food Allergies",
        content: foodAllergyArticle,
        author: "Weekly Diet Planner Team",
        date: "2025-01-15",
        readTime: "8 min read",
        category: "Food Allergies",
        tags: ["food allergies", "meal planning", "safety", "tips", "family nutrition"],
        excerpt: "Managing food allergies doesn't have to make meal planning overwhelming. Learn our top strategies for creating safe, delicious weekly meal plans that work for your family."
      }
    };

    if (slug && articleMap[slug]) {
      setArticle(articleMap[slug]);
    } else {
      // Article not found
      setArticle(null);
    }
    setLoading(false);
  }, [slug]);

  const getCategoryColor = (category: string) => {
    const colors = {
      "Food Allergies": "bg-red-100 text-red-700 border-red-200",
      "Gluten-Free": "bg-amber-100 text-amber-700 border-amber-200",
      "Keto": "bg-purple-100 text-purple-700 border-purple-200",
      "Family Planning": "bg-green-100 text-green-700 border-green-200",
      "Seasonal Cooking": "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been moved.</p>
          <button 
            onClick={() => navigate('/blog')}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - Weekly Diet Planner App Blog</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.tags.join(', ')} />
        <link rel="canonical" href={`https://weeklydietplanner.app/blog/${slug}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://weeklydietplanner.app/blog/${slug}`} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        
        {/* Article structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.excerpt,
            "author": {
              "@type": "Organization",
              "name": article.author
            },
            "datePublished": article.date,
            "dateModified": article.date,
            "publisher": {
              "@type": "Organization",
              "name": "Weekly Diet Planner App"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://weeklydietplanner.app/blog/${slug}`
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/blog')}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="btn-secondary"
                title="Share this article"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                className="btn-secondary"
                title="Save to favorites"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(article.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {article.readTime}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>By {article.author}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-800 mb-6 mt-8 first:mt-0">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8 border-b border-gray-200 pb-2">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h3>,
                p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
                li: ({children}) => <li className="ml-4">{children}</li>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-6 bg-primary-50 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                code: ({children}) => (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                    {children}
                  </code>
                ),
                pre: ({children}) => (
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                a: ({href, children}) => (
                  <a 
                    href={href} 
                    className="text-primary-600 hover:text-primary-700 underline inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ),
                strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-700">{children}</em>,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Article Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Found this helpful?</h3>
              <p className="text-sm text-gray-600">
                Share this article with others who might benefit from these meal planning tips.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="btn-primary"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </button>
              <button
                onClick={() => navigate('/blog')}
                className="btn-secondary"
              >
                More Articles
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles CTA */}
        <div className="bg-gradient-to-r from-primary-500 to-terra-500 p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to Start Planning?</h3>
          <p className="mb-4 opacity-90">
            Put these tips into practice with our specialized meal planning app for restrictive diets.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Meal Planning
          </button>
        </div>
      </div>
    </>
  );
}

export default ArticlePage;