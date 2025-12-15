import React from 'react';

const TestHome = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Test Home Page</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Website is Working!</h2>
          <p className="text-gray-600 mb-4">
            If you can see this page, the React app is running correctly.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded">
              <h3 className="font-semibold">Search Test</h3>
              <input 
                type="text" 
                placeholder="Type here..." 
                className="w-full mt-2 p-2 border rounded"
              />
            </div>
            <div className="bg-green-100 p-4 rounded">
              <h3 className="font-semibold">Button Test</h3>
              <button 
                onClick={() => alert('Button works!')}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Click Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHome;