import React, { useState } from 'react';
import { LogIn, Calendar, Clock, Shield, Filter, Heart, ChevronRight, Mail, ExternalLink, Users } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: "Allergy-Safe Planning",
      description: "Plan meals safely around food allergies and intolerances"
    },
    {
      icon: <Filter className="w-6 h-6 text-sage-600" />,
      title: "Dietary Compliance",
      description: "Strict filtering for keto, gluten-free, vegan, and more"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: "Family-Friendly",
      description: "Manage multiple dietary needs in one household"
    },
    {
      icon: <Clock className="w-6 h-6 text-sage-500" />,
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
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3F0' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with title and login */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              <span style={{ color: '#B85C57' }}>Safe</span> Meal Planning for{' '}
              <span style={{ color: '#A4B5A0' }} className="inline-block hover:scale-105 transition-transform duration-200">
                Restrictive Diets
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-700 leading-relaxed">
              Finally, a meal planner that <strong>understands your dietary challenges</strong>. 
              Whether you're managing celiac disease, multiple food allergies, keto, or other strict diets, 
              ThymeTable makes safe meal planning simple for your family.
            </p>
          </div>

          {/* Login form */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            {emailConfirmationRequired ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#A4B5A0' }}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Check Your Email</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  We've sent a confirmation link to <strong>{email}</strong>. Please check your email (including spam folder) and click the link to verify your account.
                </p>
                <button
                  onClick={() => {
                    setEmailConfirmationRequired(false);
                    setIsSignUp(false);
                  }}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#A4B5A0' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 hover:rotate-360 transition-transform duration-600" style={{ backgroundColor: '#A4B5A0' }}>
                    <LogIn className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
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
                  <div className="mb-4 p-3 text-sm rounded-md" style={{ backgroundColor: '#F5E6E6', color: '#B85C57' }}>
                    {error}
                    
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => console.log('Navigate to subscription')}
                        className="text-sm font-medium inline-flex items-center gap-1 hover:underline"
                        style={{ color: '#A4B5A0' }}
                      >
                        View Plans & Pricing
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 transition-all duration-300"
                      style={{ focusRingColor: '#A4B5A0' }}
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 transition-all duration-300"
                      style={{ focusRingColor: '#A4B5A0' }}
                      required
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full text-white font-medium py-2.5 px-4 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#A4B5A0' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#95A691'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#A4B5A0'}
                  >
                    {isSignUp ? 'Start Safe Meal Planning' : 'Sign In'}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#A4B5A0' }}
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Features grid */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 bg-white rounded-lg shadow-sm border transition-all duration-300 hover:scale-105 ${
                  activeFeature === index ? 'scale-105 shadow-md' : ''
                }`}
                style={{ 
                  borderColor: activeFeature === index ? '#A4B5A0' : '#E5E7EB'
                }}
              >
                {feature.icon}
                <h3 className="font-medium text-gray-900 mt-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Built for Families section */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-lg border" style={{ backgroundColor: '#F0F4EF', borderColor: '#D1D9CC' }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6" style={{ color: '#B85C57' }} />
              Built for Families Like Yours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start text-gray-700 cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                <Shield className="w-5 h-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#A4B5A0' }} />
                <div>
                  <span className="font-medium">Recipes verified safe</span>
                  <p className="text-sm text-gray-600 mt-1">for your specific restrictions</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </div>
              <div className="flex items-start text-gray-700 cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                <Filter className="w-5 h-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#A4B5A0' }} />
                <div>
                  <span className="font-medium">Advanced filtering</span>
                  <p className="text-sm text-gray-600 mt-1">for allergies, intolerances & diets</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </div>
              <div className="flex items-start text-gray-700 cursor-pointer group hover:translate-x-2 transition-transform duration-200">
                <Calendar className="w-5 h-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#A4B5A0' }} />
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
  );
}

export default LoginPage;