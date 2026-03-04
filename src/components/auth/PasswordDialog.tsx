import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { LockKeyhole } from "lucide-react"
import { verifyPassword, generateAndStoreToken } from "../../utils/auth"
import { showSuccess, showError } from "../../lib/toast"

interface PasswordDialogProps {
  open: boolean;
  onAuthenticated: () => void;
}

const PasswordDialog = ({ open, onAuthenticated }: PasswordDialogProps) => {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 验证密码
      if (verifyPassword(password)) {
        // 生成并存储令牌
        generateAndStoreToken(password)
        showSuccess("验证成功！")
        onAuthenticated()
      } else {
        setError("密码不正确，请重试")
        showError("密码验证失败")
      }
    } catch (err) {
      console.error("验证过程中发生错误:", err)
      setError("验证过程中发生错误，请重试")
      showError("验证过程中发生错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LockKeyhole className="h-5 w-5" />
            <span>密码验证</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div>
              <p className="text-sm mb-4">
                这是一个私人网站，请输入密码继续访问。
              </p>

              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="pr-10"
                  autoFocus
                  required
                  disabled={loading}
                />
                <LockKeyhole className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>

              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password.trim()}
            >
              {loading ? "验证中..." : "确认"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordDialog
