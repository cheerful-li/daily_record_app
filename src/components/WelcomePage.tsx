import { useNavigate } from "react-router-dom"
import { StoreProvider } from "../stores/StoreContext"
import { Toaster } from "../components/ui/sonner"
import { showSuccess } from "../lib/toast"

function WelcomePage() {
  const navigate = useNavigate()

  const handleStart = async () => {
    // 直接导航到主应用，不添加示例数据
    navigate("/app/habits")
    showSuccess("欢迎使用Daily Record个人管理系统！")
  }

  return (
    <StoreProvider>
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center max-w-lg p-8 glass-effect rounded-xl shadow-xl animate-fade-in space-y-5">
          <h1 className="text-3xl font-bold mb-6 gradient-text animate-float">
            Daily Record
          </h1>
          <p className="mb-4 text-lg">欢迎使用个人管理网站！</p>
          <p className="mb-2 text-muted-foreground">
            这是您的个人数据管理空间，从现在开始记录您的生活点滴。
          </p>
          <Toaster position="top-right" closeButton richColors />

          <div className="pt-4 space-y-2">
            <h2 className="text-lg font-semibold">主要功能：</h2>
            <ul className="text-left text-sm space-y-2 pl-4">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>微习惯培养 - 跟踪并坚持您的日常习惯</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>生活点滴 - 记录生活中的美好时刻</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>待办事项 - 管理您的工作和成长任务</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>关系维护 - 不要忘记与重要的人保持联系</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>灵感收集 - 捕捉闪现的创意和想法</span>
              </li>
            </ul>
          </div>

          <button
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-6 py-3 text-md font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleStart}
          >
            开始使用
          </button>
        </div>
      </div>
    </StoreProvider>
  )
}

export default WelcomePage