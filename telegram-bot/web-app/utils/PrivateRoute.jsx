import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

<Route
  path="/tournament"
  element={
    <PrivateRoute user={currentUser}>
      <TournamentScreen userId={currentUser._id} />
    </PrivateRoute>
  }
/>
