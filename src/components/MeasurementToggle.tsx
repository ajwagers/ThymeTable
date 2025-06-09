import React from 'react';
import { Scale } from 'lucide-react';
import { useMeasurement, MeasurementSystem } from '../contexts/MeasurementContext';

interface MeasurementToggleProps {
  className?: string;
}

const MeasurementToggle: React.FC<MeasurementToggleProps> = ({ className = '' }) => {
  const { system, setSystem } = useMeasurement();

  const handleToggle = () => {
    setSystem(system === 'us' ? 'metric' : 'us');
  };

  return (
    <div className={`flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20 ${className}`}>
      <Scale className="w-4 h-4 text-white" />
      <div className="flex items-center">
        <button
          onClick={handleToggle}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            system === 'us' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          US
        </button>
        <span className="text-white/50 mx-1">|</span>
        <button
          onClick={handleToggle}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            system === 'metric' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          Metric
        </button>
      </div>
    </div>
  );
};

export default MeasurementToggle;