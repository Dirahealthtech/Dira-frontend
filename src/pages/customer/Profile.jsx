import { useAuth } from "../../auth/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <div className="mt-4">
        <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Verified:</strong> {user?.is_verified ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default Profile;