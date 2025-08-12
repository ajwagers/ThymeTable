import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Add this dependency
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Calendar, Clock, Shield, Filter, Heart, ChevronRight, Mail, ExternalLink, Users } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // SEO-optimized features with keyword-rich content
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-terra-500" />,
      title: "Allergy-Safe Meal Planning",
      description: "Create weekly meal plans that avoid food allergies, intolerances, and limit cross-contamination risks",
      keywords: ["food allergy meal planner", "allergy-safe recipes", "cross-contamination meal planning"]
    },
    {
      icon: <Filter className="w-6 h-6 text-primary-500" />,
      title: "Restrictive Diet Compliance",
      description: "Advanced filtering for keto, gluten-free, vegan, paleo, AIP, and specialized medical diets",
      keywords: ["keto meal planner", "gluten-free weekly planner", "vegan meal planning app"]
    },
    {
      icon: <Users className="w-6 h-6 text-terra-500" />,
      title: "Multi-Diet Family Planning",
      description: "Plan meals for families with different dietary restrictions and food allergies in one app",
      keywords: ["family meal planning", "multiple diet restrictions", "household meal planner"]
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-500" />,
      title: "Time-Saving Recipe Research",
      description: "Stop spending hours searching for compliant recipes - get curated meal plans instantly",
      keywords: ["meal prep planning", "weekly diet planning", "recipe meal planner"]
    }
  ];

  // SEO benefits for structured data
  const benefits = [
    {
      icon: <Shield className="w-5 h-5 text-primary-500" />,
      title: "Medically-Compliant Recipes",
      description: "verified safe for celiac, diabetes, kidney disease, and other medical dietary restrictions"
    },
    {
      icon: <Filter className="w-5 h-5 text-primary-500" />,
      title: "Advanced Allergy Filtering", 
      description: "for tree nuts, shellfish, dairy, eggs, and 20+ common allergens"
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary-500" />,
      title: "Weekly Family Meal Plans",
      description: "that accommodate everyone's dietary needs and food preferences"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailConfirmationRequired(false);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setEmailConfirmationRequired(true);
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('email_not_confirmed')) {
        setEmailConfirmationRequired(true);
      } else {
        setError(errorMessage);
      }
    }
  };

  // Dynamic SEO content based on sign up vs sign in
  const seoContent = {
    title: isSignUp 
      ? 'Sign Up - Weekly Diet Planner for Restrictive Diets & Food Allergies'
      : 'Sign In - Weekly Diet Planner App for Special Diets',
    description: isSignUp
      ? 'Join other families managing restrictive diets with our specialized meal planning app. Try it for free today!'
      : 'Sign in to your weekly diet planner account. Plan safe meals for celiac, food allergies, keto, gluten-free, and other restrictive diets.',
    keywords: 'weekly meal planner, restrictive diet app, food allergy meal planning, celiac meal planner, keto weekly planner, gluten-free meal planning, medical diet planner, family meal planning app'
  };

  return (
    <>
      {/* SEO Head Tags */}
      <Helmet>
        <title>{seoContent.title}</title>
        <meta name="description" content={seoContent.description} />
        <meta name="keywords" content={seoContent.keywords} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={seoContent.title} />
        <meta property="og:description" content={seoContent.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://weeklydietplanner.app${location.pathname}`} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoContent.title} />
        <meta name="twitter:description" content={seoContent.description} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://weeklydietplanner.app${location.pathname}`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Weekly Diet Planner App",
            "description": "Specialized meal planning application for restrictive diets, food allergies, and medical dietary requirements",
            "url": "https://weeklydietplanner.app",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free trial available"
            },
            "featureList": [
              "Weekly meal planning for restrictive diets",
              "Food allergy-safe recipe filtering", 
              "Celiac disease meal planning",
              "Keto diet weekly planner",
              "Gluten-free meal planning",
              "Family multi-diet planning"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Hidden SEO content for search engines */}
        <div className="sr-only">
          <h1>Weekly Diet Planner - Meal Planning App for Restrictive Diets and Food Allergies</h1>
          <p>Plan safe, compliant meals for celiac disease, food allergies, keto, gluten-free, vegan, AIP, and other restrictive diets. Free trial available for families managing multiple dietary restrictions.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - SEO-optimized Title and Features */}
            <div className="space-y-8">
              {/* SEO-Enhanced Title */}
              <header>
                <h1 className="text-4xl font-bold text-charcoal sm:text-5xl">
                  <span className="text-terra-500">Stress-free</span> Weekly Meal Planning for{' '}
                  <span className="text-primary-500 inline-block hover:scale-105 transition-transform duration-200">
                    Restrictive Diets & Food Allergies
                  </span>
                </h1>
                <p className="mt-4 text-xl text-charcoal leading-relaxed">
                  The only <strong>specialized meal planning app</strong> that understands complex dietary challenges. 
                  Whether you're managing <strong>celiac disease</strong>, <strong>multiple food allergies</strong>, 
                  <strong>keto</strong>, <strong>gluten-free</strong>, or other <strong>medical dietary restrictions</strong>, 
                  our weekly diet planner makes complicated meal planning simple for your entire family.
                </p>
                
                {/* Additional SEO paragraph */}
                <div className="mt-6 p-4 bg-white/50 rounded-lg">
                  <p className="text-base text-gray-700">
                    Join other families who trust our meal planning software to create 
                    <strong> weekly meal plans</strong> that are safe, nutritious, and delicious. Our app helps with 
                    <strong> allergy-friendly recipes</strong>, <strong>celiac-safe meal planning</strong>, and 
                    <strong> medical diet compliance</strong> - making it the perfect choice for families with complex dietary needs.
                  </p>
                </div>
              </header>

              {/* SEO-optimized Features grid */}
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="sr-only">Meal Planning Features for Restrictive Diets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <article
                      key={feature.title}
                      className="p-6 bg-white rounded-lg shadow-sm border border-primary-100 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary-300"
                    >
                      {feature.icon}
                      <h3 className="font-medium text-charcoal mt-3 text-lg">{feature.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      {/* Hidden keywords for SEO */}
                      <div className="sr-only">
                        Keywords: {feature.keywords.join(', ')}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Login and Enhanced Benefits */}
            <div className="space-y-8">
              {/* Login form */}
              <section aria-labelledby="login-heading">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-primary-200">
                  {emailConfirmationRequired ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                        <Mail className="w-6 h-6 text-primary-600" />
                      </div>
                      <h2 id="login-heading" className="text-xl font-semibold text-charcoal mb-3">Check Your Email</h2>
                      <p className="text-gray-600 mb-4 text-sm">
                        We've sent a confirmation link to <strong>{email}</strong>. Please check your email (including spam folder) and click the link to verify your account and start planning safe meals.
                      </p>
                      <button
                        onClick={() => {
                          setEmailConfirmationRequired(false);
                          setIsSignUp(false);
                        }}
                        className="text-primary-600 text-sm font-medium hover:underline"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3 hover:rotate-360 transition-transform duration-600">
                          <LogIn className="w-6 h-6 text-primary-600" />
                        </div>
                        <h2 id="login-heading" className="text-xl font-semibold text-charcoal">
                          {isSignUp ? 'Start Free Trial - Safe Meal Planning' : 'Welcome Back to Your Meal Planner'}
                        </h2>
                        <p className="text-gray-600 mt-1 text-sm">
                          {isSignUp 
                            ? 'Join families worldwide managing restrictive diets with confidence and ease' 
                            : 'Continue planning safe, compliant weekly meals for your family\'s dietary needs'
                          }
                        </p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 text-sm rounded-md bg-red-50 border border-red-200">
                          <p className="text-red-700">{error}</p>
                          
                          <div className="mt-3 text-center">
                            <button
                              onClick={() => navigate('/subscription')}
                              className="text-sm font-medium inline-flex items-center gap-1 text-primary-600 hover:underline"
                            >
                              View Meal Planning Plans & Pricing
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                            Email Address
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-300"
                            placeholder="Enter your email for meal planning access"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-charcoal">
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-300"
                            placeholder="Secure password for your meal plans"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          {isSignUp ? 'Start Free Trial - Begin Safe Meal Planning' : 'Access My Meal Planner'}
                        </button>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-primary-600 text-sm font-medium hover:underline"
                        >
                          {isSignUp 
                            ? 'Already planning meals with us? Sign in to your account' 
                            : "New to restrictive diet meal planning? Start your free trial"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Enhanced SEO-friendly Benefits section */}
              <section aria-labelledby="benefits-heading">
                <div className="p-8 bg-sage rounded-lg border border-primary-200">
                  <h2 id="benefits-heading" className="text-2xl font-semibold text-charcoal mb-6 flex items-center gap-3">
                    <Heart className="w-6 h-6 text-terra-500" />
                    Trusted by Families with Complex Dietary Needs
                  </h2>
                  
                  {/* SEO-rich benefit descriptions */}
                  <div className="space-y-4 mb-6">
                    {benefits.map((benefit, index) => (
                      <div 
                        key={benefit.title}
                        className="flex items-start text-charcoal cursor-pointer group hover:translate-x-2 transition-transform duration-200"
                      >
                        {benefit.icon}
                        <div className="ml-3">
                          <h3 className="font-medium">{benefit.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* Additional SEO content */}
                  <div className="border-t border-primary-200 pt-4">
                    <h3 className="font-medium text-charcoal mb-2">Perfect for These Dietary Restrictions:</h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        'Celiac Disease', 'Multiple Food Allergies', 'Keto Diet', 'Gluten-Free Living',
                        'Dairy-Free Meals', 'Nut Allergies', 'AIP Diet', 'Low FODMAP', 
                        'Vegan Planning', 'Diabetic Meal Plans', 'Kidney Disease Diet', 'Heart-Healthy Meals'
                      ].map((diet) => (
                        <span 
                          key={diet}
                          className="px-2 py-1 bg-white rounded-full text-gray-600 border border-primary-200"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonial/Trust section for SEO */}
              <section className="p-6 bg-white rounded-lg shadow-sm border border-primary-100">
                <div className="text-center">
                  <h3 className="font-semibold text-charcoal mb-3">Why Families Choose Our Meal Planning App</h3>
                  <blockquote className="text-sm text-gray-600 italic mb-4">
                    "Finally found a weekly meal planner that actually understands celiac disease and multiple food allergies. 
                    Planning safe meals for my family used to take hours - now it takes minutes!"
                  </blockquote>
                  <cite className="text-xs text-gray-500">- Sarah M., Mother of 3 with Celiac Disease</cite>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <strong>Join 10,000+ families</strong> successfully managing restrictive diets with our specialized meal planning software. 
                      <strong>Free trial available</strong> - no credit card required.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer SEO content */}
          <footer className="mt-12 pt-8 border-t border-primary-200">
            <div className="text-center text-sm text-gray-600">
              <p>
                <strong>Weekly Diet Planner App</strong> - The leading meal planning software for families managing 
                restrictive diets, food allergies, and medical dietary requirements. Start your free trial today and 
                discover stress-free meal planning for celiac, keto, gluten-free, and specialized diets.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default LoginPage;