import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { checkIsAuthorized } from "../authrize";
import { Box, CircularProgress } from "@mui/material";
function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  useEffect(() => {
  const verifyAuthorization = async () => {
    const tempIsAuthorized = await checkIsAuthorized();
    setIsAuthorized(tempIsAuthorized);
  };
  
  verifyAuthorization();
}, []);

  if (isAuthorized === null) {
    return (
      <Box sx={{ display: "flex", alignSelf: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthorized ? children : <Navigate to="/login"></Navigate>;
}

export default ProtectedRoute;
