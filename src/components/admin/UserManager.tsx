import React from 'react';

const UserManager: React.FC = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search users..."
            className="bg-gray-700 text-white px-4 py-2 rounded flex-grow"
          />
          <select className="bg-gray-700 text-white px-4 py-2 rounded">
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="user">Regular Users</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Username</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="py-2">
                <td className="py-3">JohnDoe</td>
                <td>john@example.com</td>
                <td>User</td>
                <td>
                  <button className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
