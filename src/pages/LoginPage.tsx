import React, { useState } from 'react';
import { LogIn, Calendar, Clock, Shield, Filter, Heart, ChevronRight, Mail, ExternalLink, AlertTriangle, Users } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: "Allergy-Safe Planning",
      description: "Plan meals safely around food allergies and intolerances"
    },
    {
      icon: <Filter className="w-6 h-6 text-blue-500" />,
      title: "Dietary Compliance",
      description: "Strict filtering for keto, gluten-free, vegan, and more"
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "Family-Friendly",
      description: "Manage multiple dietary needs in one household"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: "Save Research Time",
      description: "Stop spending hours searching for compliant recipes"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailConfirmationRequired(false);
    // Form submission logic would go here
    console.log('Form submitted:', { email, password, isSignUp });
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-red-50 via-blue-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div>
              {/* Attention-grabbing callout */}
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4 hover:scale-105 transition-transform duration-200 cursor-pointer">
                <AlertTriangle className="w-4 h-4" />
                For Families with Dietary Restrictions & Allergies
              </div>

              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                <span className="text-red-600">Safe</span> Meal Planning for{' '}
                <span className="text-blue-600 inline-block hover:scale-105 transition-transform duration-200">
                  Restrictive Diets
                </span>
              </h1>
              <p className="mt-4 text-xl text-gray-700 leading-relaxed">
                Finally, a meal planner that <strong>understands your dietary challenges</strong>. 
                Whether you're managing celiac disease, multiple food allergies, keto, or other strict diets, 
                ThymeTable makes safe meal planning simple for your family.
              </p>
            </div>

            {/* Pain points addressed */}
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Tired of These Meal Planning Struggles?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  Reading every ingredient label and nutrition panel
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  Worrying about cross-contamination in recipes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  Spending hours finding compliant recipes online
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  Managing different dietary needs in one household
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`p-4 bg-white rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 ${
                    activeFeature === index ? 'border-blue-500 scale-105 shadow-md' : 'border-gray-200'
                  }`}
                >
                  {feature.icon}
                  <h3 className="font-medium text-gray-900 mt-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Built for Families Like Yours
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700 cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                  <Shield className="w-4 h-4 text-green-600 mr-2" />
                  Recipes verified safe for your specific restrictions
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </li>
                <li className="flex items-center text-gray-700 cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                  <Filter className="w-4 h-4 text-green-600 mr-2" />
                  Advanced filtering for allergies, intolerances & diets
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </li>
                <li className="flex items-center text-gray-700 cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                  <Calendar className="w-4 h-4 text-green-600 mr-2" />
                  Family meal planning that accommodates everyone
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            {emailConfirmationRequired ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Check Your Email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation link to <strong>{email}</strong>. Please check your email (including spam folder) and click the link to verify your account.
                </p>
                <button
                  onClick={() => {
                    setEmailConfirmationRequired(false);
                    setIsSignUp(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 hover:rotate-360 transition-transform duration-600">
                    <LogIn className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {isSignUp ? 'Start Planning Safely' : 'Welcome Back'}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isSignUp 
                      ? 'Join thousands of families managing restrictive diets with confidence' 
                      : 'Continue planning safe, compliant meals for your family'
                    }
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                    
                    {/* Subscription Link */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => console.log('Navigate to subscription')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        View Plans & Pricing
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {isSignUp ? 'Start Safe Meal Planning' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;