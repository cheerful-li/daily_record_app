import { useState, useEffect, ReactNode } from "react";
import PasswordDialog from "./PasswordDialog";
import LoadingScreen from "../common/LoadingScreen";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 检查本地存储中是否有认证令牌
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
    setChecking(false);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (checking) {
    return <LoadingScreen message="检查认证状态..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background">
        <PasswordDialog
          open={true}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthProvider;