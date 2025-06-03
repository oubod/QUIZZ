import React from 'react';

const DailyChallenge: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Daily Challenge</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Today's Challenge</h2>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-lg mb-4">Complete a quiz with a perfect score!</p>
            <div className="flex items-center justify-between">
              <span className="text-primary-400">Reward: 100 points</span>
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">
                Start Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
