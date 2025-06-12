import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Utensils, Clock, Filter, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDietary } from '../contexts/DietaryContext';
import ServingsControl from './ServingsControl';
import MeasurementToggle from './MeasurementToggle';
import DietaryFiltersModal from './DietaryFiltersModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { activeDiets } = useDietary();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDietaryModal, setShowDietaryModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-primary-500 border-b border-primary-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="mr-2 p-2 bg-white/10 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Thyme<span className="text-lemon">Table</span>
              </h1>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <ServingsControl variant="header" />
                
                <MeasurementToggle />
                
                <button 
                  onClick={() => navigate('/grocery-list')}
                  className={`btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white ${
                    location.pathname === '/grocery-list' ? 'bg-white/20' : ''
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  <span>Grocery List</span>
                </button>

                <button className="btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Meal History</span>
                </button>
                
                <button 
                  onClick={() => setShowDietaryModal(true)}
                  className={`btn-primary bg-terra-500 hover:bg-terra-600 relative ${
                    activeDiets.length > 0 ? 'ring-2 ring-lemon ring-offset-2 ring-offset-primary-500' : ''
                  }`}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  <span>Dietary Filters</span>
                  {activeDiets.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-lemon text-charcoal text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {activeDiets.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleSignOut}
                  className="btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <DietaryFiltersModal 
        isOpen={showDietaryModal} 
        onClose={() => setShowDietaryModal(false)} 
      />
    </>
  );
};

export default Header;