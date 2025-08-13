import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, User, Tag, ChevronRight, Utensils, Heart, Filter, Sparkles } from 'lucide-react';

function BlogPage() {
  const navigate = useNavigate();

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Tips for Meal Planning with Food Allergies",
      excerpt: "Managing food allergies doesn't have to make meal planning overwhelming. Learn our top strategies for creating safe, delicious weekly meal plans that work for your family.",
      content: "Meal planning with food allergies requires extra attention to detail, but it doesn't have to be stressful. Here are our top 10 tips to help you create safe, nutritious, and delicious meal plans...",
      author: "Weekly Diet Planner Team",
      date: "2025-08-13",
      readTime: "5 min read",
      category: "Food Allergies",
      tags: ["food allergies", "meal planning", "safety", "tips"],
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  const categories = ["All", "Food Allergies", "Gluten-Free", "Keto", "Family Planning", "Seasonal Cooking"];
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      "Food Allergies": "bg-red-100 text-red-700",
      "Gluten-Free": "bg-amber-100 text-amber-700",
      "Keto": "bg-purple-100 text-purple-700",
      "Family Planning": "bg-green-100 text-green-700",
      "Seasonal Cooking": "bg-blue-100 text-blue-700"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <>
      <Helmet>
        <title>Table Thyme: The Meal Planning Blog - Weekly Diet Planner App</title>
        <meta name="description" content="Expert tips, guides, and strategies for meal planning with restrictive diets, food allergies, and special dietary needs. Learn from nutrition professionals." />
        <meta name="keywords" content="meal planning blog, food allergy tips, gluten-free recipes, keto meal planning, family nutrition, dietary restrictions" />
        <link rel="canonical" href="https://weeklydietplanner.app/blog" />
      </Helmet>

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Planner
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Table Thyme: The Meal Planning Blog</h1>
            <p className="text-gray-600">Expert tips and guides for successful meal planning</p>
          </div>
          <div></div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Article</h2>
            <div className="bg-gradient-to-r from-primary-50 to-terra-50 rounded-xl p-8 border border-primary-200">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(filteredPosts[0].category)}`}>
                      {filteredPosts[0].category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(filteredPosts[0].date).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{filteredPosts[0].title}</h3>
                  <p className="text-gray-600 mb-6">{filteredPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      {filteredPosts[0].author}
                      <Clock className="w-4 h-4 ml-4 mr-1" />
                      {filteredPosts[0].readTime}
                    </div>
                    <button className="btn-primary">
                      Read More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                <div>
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(1).map((post) => (
              <article
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                    <Clock className="w-4 h-4 ml-4 mr-1" />
                    {post.readTime}
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                      Read More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
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
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary-500 to-terra-500 rounded-xl p-8 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Stay Updated with Meal Planning Tips</h3>
            <p className="mb-6 opacity-90">
              Get the latest meal planning strategies, recipes, and tips for managing restrictive diets delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Explore More</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <Utensils className="w-8 h-8 mx-auto mb-3 text-primary-500" />
              <h4 className="font-medium text-gray-800 mb-2">Recipe Collection</h4>
              <p className="text-sm text-gray-600">Browse our curated recipes for special diets</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <Heart className="w-8 h-8 mx-auto mb-3 text-red-500" />
              <h4 className="font-medium text-gray-800 mb-2">Success Stories</h4>
              <p className="text-sm text-gray-600">Read how others transformed their meal planning</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <Filter className="w-8 h-8 mx-auto mb-3 text-terra-500" />
              <h4 className="font-medium text-gray-800 mb-2">Diet Guides</h4>
              <p className="text-sm text-gray-600">Comprehensive guides for specific dietary needs</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BlogPage;