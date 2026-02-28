import { useState, useEffect } from "react";
import { initDatabase } from "./services/database";
import { addSampleData } from "./services/sampleData";
import { fetchCloudData } from "./services/cloudSync";
import { importData } from "./services/enhancedDatabase";
import { StoreProvider } from "./stores/StoreContext";
import Layout from "./components/layout/Layout";
import ModuleRenderer from "./components/modules";
import { Toaster } from "./components/ui/sonner";
import { showSuccess, showError } from "./lib/toast";
import PasswordDialog from "./components/auth/PasswordDialog";
import { isAuthenticated } from "./utils/auth";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // 检查用户是否已认证
  useEffect(() => {
    // 检查本地存储中是否有认证令牌
    const authenticated = localStorage.getItem("auth_token") !== null;
    setIsAuthenticated(authenticated);

    // 如果未认证，则显示密码对话框
    if (!authenticated) {
      setShowPasswordDialog(true);
    }
  }, []);

  useEffect(() => {
    // 只有在已认证的情况下才初始化数据库
    if (!isAuthenticated) return;

    // 初始化数据库并加载数据
    const initialize = async () => {
      try {
        // 初始化数据库
        const db = await initDatabase();

        // 检查是否已有本地数据
        const habits = await db.getAll("habits");
        const hasExistingData = habits.length > 0;
        setHasData(hasExistingData);

        // 尝试从云端加载数据
        try {
          const cloudData = await fetchCloudData();

          // 如果云端有数据，则导入
          if (cloudData && cloudData.habits && cloudData.habits.length > 0) {
            await importData(cloudData);
            setHasData(true);
            showSuccess("云端数据已成功同步！");
            return;
          }
        } catch (cloudError) {
          console.error("从云端加载数据失败:", cloudError);
          // 如果云端加载失败，回退到本地数据
        }

        // // 如果云端没有数据且本地也没有，添加示例数据
        // if (!hasExistingData) {
        //   await addSampleData();
        //   showSuccess('示例数据已成功加载！');
        // } else {
        //   showSuccess('数据库已成功加载！');
        // }
      } catch (error) {
        console.error("Failed to initialize:", error);
        showError("数据库初始化失败，请刷新页面重试");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [isAuthenticated]);

  // 处理认证成功
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowPasswordDialog(false);
  };

  // 显示密码对话框
  if (showPasswordDialog) {
    return (
      <div className="bg-background">
        <PasswordDialog
          open={showPasswordDialog}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    );
  }

  // 显示加载状态
  if (isLoading && isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center p-8 glass-effect rounded-lg shadow-lg max-w-sm animate-fade-in">
          <h1 className="text-3xl font-bold mb-6 gradient-text">
            Daily Record
          </h1>
          <p className="text-muted-foreground mb-4 text-lg">
            应用正在加载中...
          </p>
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 首次加载时显示欢迎信息
  if (!hasData) {
    return (
      <StoreProvider>
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
          <div className="text-center max-w-lg p-8 glass-effect rounded-xl shadow-xl animate-fade-in space-y-5">
            <h1 className="text-3xl font-bold mb-6 gradient-text animate-float">
              Daily Record
            </h1>
            <p className="mb-4 text-lg">欢迎使用个人管理网站！</p>
            <p className="mb-2 text-muted-foreground">
              我们添加了一些示例数据，帮助您快速了解应用的功能。
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
              onClick={() => {
                setHasData(true);
                showSuccess("欢迎使用Daily Record个人管理系统！");
              }}
            >
              开始使用
            </button>
          </div>
        </div>
      </StoreProvider>
    );
  }

  // 正常显示应用
  return (
    <StoreProvider>
      <Layout>
        <ModuleRenderer />
      </Layout>
      <Toaster position="top-right" closeButton richColors />
    </StoreProvider>
  );
}

export default App;
