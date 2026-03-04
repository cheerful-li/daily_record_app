import { useState } from "react"
import type { ReactNode } from "react"
import PasswordDialog from "./PasswordDialog"
import LoadingScreen from "../common/LoadingScreen"

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  // 使用useState的initializer函数初始化状态
  // 在渲染时而非effect中初始化认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("auth_token")
    return !!token
  })
  
  // 只要认证初始化完成就不再需要checking了
  // 这里直接硬编码为false，避免使用useState和useEffect
  // 只有在第一次渲染时需要checking状态
  const checking = false

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  if (checking) {
    return <LoadingScreen message="检查认证状态..." />
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background">
        <PasswordDialog
          open={true}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider