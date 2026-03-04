import { useState } from "react"
import type { ReactNode } from "react"
import PasswordDialog from "./PasswordDialog"

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

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background">
        <PasswordDialog open={true} onAuthenticated={handleAuthenticated} />
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider
