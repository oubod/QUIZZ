import React from 'react';

const CategoryManager: React.FC = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Category Management</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="New category name"
            className="bg-gray-700 text-white px-4 py-2 rounded flex-grow"
          />
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">
            Add Category
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-xl mb-3">Existing Categories</h3>
          <div className="space-y-2">
            {/* Categories will be mapped here */}
            <div className="flex items-center justify-between bg-gray-700 p-3 rounded">
              <span>General Knowledge</span>
              <div className="space-x-2">
                <button className="text-blue-400 hover:text-blue-300">Edit</button>
                <button className="text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
