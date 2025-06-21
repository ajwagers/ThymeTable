import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Calendar, Clock, Shield, Filter, Heart, ChevronRight, Mail, ExternalLink, Users } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-terra-500" />,
      title: "Allergy-Consious Planning",
      description: "Plan meals safely around food allergies and intolerances"
    },
    {
      icon: <Filter className="w-6 h-6 text-primary-500" />,
      title: "Dietary Compliance",
      description: "Strict filtering for keto, gluten-free, vegan, and more"
    },
    {
      icon: <Users className="w-6 h-6 text-terra-500" />,
      title: "Family-Friendly",
      description: "Manage multiple dietary needs in one household"
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-500" />,
      title: "Save Research Time",
      description: "Stop spending hours searching for compliant recipes"
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

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Title and Features */}
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-charcoal sm:text-5xl">
                <span className="text-terra-500">Safe</span> Meal Planning for{' '}
                <span className="text-primary-500 inline-block hover:scale-105 transition-transform duration-200">
                  Restrictive Diets
                </span>
              </h1>
              <p className="mt-4 text-xl text-charcoal leading-relaxed">
                Finally, a meal planner that <strong>understands your dietary challenges</strong>. 
                Whether you're managing celiac disease, multiple food allergies, keto, or other strict diets, 
                ThymeTable makes safe meal planning simple for your family.
              </p>
            </div>

            {/* Features grid - 2x2 layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`p-6 bg-white rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 ${
                    activeFeature === index 
                      ? 'scale-105 shadow-md border-primary-300' 
                      : 'border-primary-100'
                  }`}
                >
                  {feature.icon}
                  <h3 className="font-medium text-charcoal mt-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Login and Built for Families */}
          <div className="space-y-8">
            {/* Login form */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-primary-200">
              {emailConfirmationRequired ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal mb-3">Check Your Email</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    We've sent a confirmation link to <strong>{email}</strong>. Please check your email (including spam folder) and click the link to verify your account.
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
                    <h2 className="text-xl font-semibold text-charcoal">
                      {isSignUp ? 'Start Planning Safely' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">
                      {isSignUp 
                        ? 'Join thousands of families managing restrictive diets with confidence' 
                        : 'Continue planning safe, compliant meals for your family'
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
                          View Plans & Pricing
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-300"
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
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {isSignUp ? 'Start Safe Meal Planning' : 'Sign In'}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary-600 text-sm font-medium hover:underline"
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Built for Families section */}
            <div className="p-8 bg-sage rounded-lg border border-primary-200">
              <h2 className="text-2xl font-semibold text-charcoal mb-6 flex items-center gap-3">
                <Heart className="w-6 h-6 text-terra-500" />
                Built for Families Like Yours
              </h2>
              <div className="space-y-4">
                <div className="flex items-start text-charcoal cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                  <Shield className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-primary-500" />
                  <div>
                    <span className="font-medium">Recipes verified safe</span>
                    <p className="text-sm text-gray-600 mt-1">for your specific restrictions</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                </div>
                <div className="flex items-start text-charcoal cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                  <Filter className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-primary-500" />
                  <div>
                    <span className="font-medium">Advanced filtering</span>
                    <p className="text-sm text-gray-600 mt-1">for allergies, intolerances & diets</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                </div>
                <div className="flex items-start text-charcoal cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                  <Calendar className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-primary-500" />
                  <div>
                    <span className="font-medium">Family meal planning</span>
                    <p className="text-sm text-gray-600 mt-1">that accommodates everyone</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;