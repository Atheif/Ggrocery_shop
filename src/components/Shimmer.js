import React from 'react';

const shimmerStyles = `
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`;

export const ProductCardShimmer = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <style>{shimmerStyles}</style>
    <div className="shimmer w-full h-32"></div>
    <div className="p-3">
      <div className="shimmer h-4 w-3/4 mb-2 rounded"></div>
      <div className="shimmer h-3 w-full mb-2 rounded"></div>
      <div className="flex justify-between items-center">
        <div className="shimmer h-5 w-16 rounded"></div>
        <div className="shimmer h-8 w-20 rounded"></div>
      </div>
    </div>
  </div>
);

export const CategoryShimmer = () => (
  <div className="min-w-[200px]">
    <style>{shimmerStyles}</style>
    <div className="shimmer w-full h-32 rounded-lg"></div>
  </div>
);

export const ProductDetailsShimmer = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <style>{shimmerStyles}</style>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="p-8">
        <div className="shimmer w-full h-96 rounded-lg"></div>
      </div>
      <div className="p-8">
        <div className="shimmer h-6 w-20 mb-4 rounded"></div>
        <div className="shimmer h-10 w-3/4 mb-4 rounded"></div>
        <div className="shimmer h-4 w-full mb-2 rounded"></div>
        <div className="shimmer h-4 w-5/6 mb-6 rounded"></div>
        <div className="shimmer h-12 w-32 mb-8 rounded"></div>
        <div className="shimmer h-16 w-full rounded"></div>
      </div>
    </div>
  </div>
);