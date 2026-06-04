import { Navigate } from "react-router-dom";

// change this logic based on your auth system
// example: token stored in localStorage
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

const AuthWrapper = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default AuthWrapper;