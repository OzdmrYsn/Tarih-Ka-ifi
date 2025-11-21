import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-sepia-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-sepia-600 rounded-full border-t-transparent animate-spin"></div>
        <i className="fas fa-hourglass-half absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sepia-600 text-xl"></i>
      </div>
      <p className="mt-4 font-serif text-sepia-700 animate-pulse">Tarihsel veriler derleniyor...</p>
    </div>
  );
};
