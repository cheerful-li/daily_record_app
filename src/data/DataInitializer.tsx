import { useState, useEffect, ReactNode } from "react";
import { initDatabase } from "../services/database";
import { fetchCloudData, backupDataDaily, hasBackupToday } from "../services/cloudSync";
import { importData } from "../services/enhancedDatabase";
import { showSuccess, showError } from "../lib/toast";
import LoadingScreen from "../components/common/LoadingScreen";

// 使用闭包变量来跟踪初始化状态，避免StrictMode下的重复初始化
let isInitializing = false;
let hasInitialized = false;

interface DataInitializerProps {
  children: ReactNode;
}

function DataInitializer({ children }: DataInitializerProps) {
  const [initialized, setInitialized] = useState(hasInitialized);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // 如果已经初始化过或正在初始化中，则跳过
    if (hasInitialized || isInitializing) {
      return;
    }

    const initialize = async () => {
      // 设置初始化标志，防止重复执行
      isInitializing = true;

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

          // 如果云端有数据，则导入（但不再次同步回云端）
          if (cloudData && cloudData.habits && cloudData.habits.length > 0) {
            // 第二个参数false表示导入后不要同步回云端
            await importData(cloudData, false);
            setHasData(true);
            showSuccess("云端数据已成功同步！");
          }
        } catch (cloudError) {
          console.error("从云端加载数据失败:", cloudError);
          // 如果云端加载失败，回退到本地数据
        }

        // 尝试创建今日备份（如果今天还没有备份）
        if (!hasBackupToday() && hasExistingData) {
          try {
            await backupDataDaily();
          } catch (backupError) {
            console.error("自动备份失败:", backupError);
            // 备份失败不影响应用继续使用
          }
        }

        // 设置组件状态和全局状态
        setInitialized(true);
        hasInitialized = true;
      } catch (error) {
        console.error("数据初始化失败:", error);
        showError("数据库初始化失败，请刷新页面重试");
      } finally {
        isInitializing = false;
      }
    };

    initialize();
  }, []);

  if (!initialized) {
    return <LoadingScreen message="正在同步数据..." />;
  }

  // 首次加载无数据时仍然显示子组件
  // 移除这里的欢迎页面判断，因为欢迎页面现在由路由控制

  return <>{children}</>;
}

export default DataInitializer;
