import Notes from '@/components/notes/Notes';
import { UserContext } from '@/providers/user-provider';
import { useContext } from 'react';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  // Mask email helper (show first 2 chars, mask rest before @)
  const maskEmail = (email: string) => {
    return email.replace(/(.{2}).+(@.+)/, "$1*****$2");
  };

  return (
    <div className="p-6 space-y-4">
      {user ? (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Welcome, {user.name}</h2>
          <p className="text-gray-400">
            Email: {user.email ? maskEmail(user.email) : "N/A"}
          </p>
        </div>
      ) : (
        <div className="text-gray-500">Loading...</div>
      )}

      <Notes />
    </div>
  );
};

export default Dashboard;
