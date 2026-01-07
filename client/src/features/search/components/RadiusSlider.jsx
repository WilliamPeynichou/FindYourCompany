import React from 'react';

export const RadiusSlider = ({ value, onChange }) => {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-baseline mb-6">
        <label className="text-xl font-medium text-zinc-900">Dans un rayon de</label>
        <span className="text-xl font-bold text-[#004a7c]">{value} km</span>
      </div>
      
      <div className="relative px-1">
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-[#004a7c] custom-slider"
        />
        
        <div className="flex justify-between mt-4 text-sm text-zinc-400 font-medium">
          <span>0 km</span>
          <span>200 km</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #004a7c ${value/2}%, #e5e7eb ${value/2}%);
          height: 6px;
          border-radius: 3px;
        }
        .custom-slider::-webkit-slider-thumb {
          margin-top: -10px;
          width: 24px;
          height: 24px;
          background: #004a7c;
          border-radius: 50%;
          cursor: pointer;
          appearance: none;
        }
      `}} />
    </div>
  );
};
