import React from 'react';

const MultiplayerHub: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Create Game</h2>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">
            Create New Game
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Join Game</h2>
          <input
            type="text"
            placeholder="Enter game code"
            className="bg-gray-700 text-white px-4 py-2 rounded mb-4 w-full"
          />
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerHub;
