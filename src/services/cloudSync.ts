/**
 * 云同步服务 - 管理应用数据的云存储同步
 *
 * 功能:
 * 1. 从远程服务器加载数据
 * 2. 将本地数据保存到远程服务器
 */

import { showSuccess, showError } from "../lib/toast"
import { getAll } from "./database"

// 固定的OSS路径
const OSS_PATH = "llm_oss/test/daily_record_app.json"

// 获取基于日期的OSS路径
const getDateBasedOSSPath = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `llm_oss/test/daily_record_backup/${year}${month}${day}_daily_record_backup.json`
}

// 获取API认证令牌
const getAuthToken = (): string => {
  const token = localStorage.getItem("auth_token")
  if (!token) {
    throw new Error("未找到认证令牌，请先登录")
  }
  return token
}

/**
 * 将本地数据导出为JSON
 * @returns 包含所有本地数据的JSON字符串
 */
export const exportDataToJson = async (): Promise<string> => {
  try {
    // 收集所有存储库中的数据
    const [habits, checkIns, lifeMoments, tasks, ideas, relationships] =
      await Promise.all([
        getAll("habits"),
        getAll("checkIns"),
        getAll("lifeMoments"),
        getAll("tasks"),
        getAll("ideas"),
        getAll("relationships"),
      ])

    // 创建数据对象
    const exportData = {
      habits,
      checkIns,
      lifeMoments,
      tasks,
      ideas,
      relationships,
      exportedAt: new Date().toISOString(),
    }

    // 转换为JSON
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error("导出数据失败:", error)
    throw new Error("导出数据失败")
  }
}

/**
 * 从远程服务器加载数据
 * @returns 远程存储的应用数据
 */
export const fetchCloudData = async () => {
  try {
    const token = getAuthToken()

    const response = await fetch(
      "https://hbmouz.faas.xiaoduoai.com/temp/oss/file_content_read",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ossPath: OSS_PATH,
          token,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`服务器响应错误: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return JSON.parse(data.data)
  } catch (error) {
    console.error("从云端获取数据失败:", error)
    // 这里我们不显示错误通知，因为如果是首次使用，云端可能还没有数据
    return null
  }
}

/**
 * 将本地数据上传到云端
 */
export const uploadDataToCloud = async (
  customPath?: string
): Promise<boolean> => {
  try {
    const token = getAuthToken()
    const jsonData = await exportDataToJson()

    // 确定使用的路径
    const ossPath = customPath || OSS_PATH
    const filename = ossPath.split("/").pop() || "daily_record_app.json"

    // 创建文件对象
    const file = new File([jsonData], filename, {
      type: "application/json",
    })

    // 创建FormData
    const formData = new FormData()
    formData.append("file", file)
    formData.append("token", token)
    formData.append("ossPath", ossPath)

    const response = await fetch(
      "https://hbmouz.faas.xiaoduoai.com/temp/oss/file_upload",
      {
        method: "POST",
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`服务器响应错误: ${response.status} ${errorText}`)
    }

    return true
  } catch (error) {
    console.error("上传数据到云端失败:", error)
    showError("数据同步失败，请稍后再试")
    return false
  }
}

/**
 * 同步事件发生器 - 当数据变更时，自动触发云同步
 */
let syncTimeout: number | null = null

export const triggerCloudSync = () => {
  // 防抖：取消之前未执行的同步操作
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // 延迟1秒后执行同步
  syncTimeout = window.setTimeout(async () => {
    try {
      await uploadDataToCloud()
      console.log("数据已成功同步到云端")
    } catch (error) {
      console.error("自动同步失败:", error)
    }
  }, 1000)
}

/**
 * 将数据备份到按日期命名的文件中
 * @returns 备份是否成功
 */
export const backupDataDaily = async (): Promise<boolean> => {
  try {
    // 获取基于当前日期的路径
    const backupPath = getDateBasedOSSPath()

    // 上传数据到备份路径
    const success = await uploadDataToCloud(backupPath)

    if (success) {
      // 记录最后备份的日期
      localStorage.setItem(
        "last_backup_date",
        new Date().toISOString().split("T")[0]
      )
      console.log("数据已成功备份到:", backupPath)
      showSuccess("数据已成功备份")
    }

    return success
  } catch (error) {
    console.error("数据备份失败:", error)
    showError("数据备份失败，请稍后再试")
    return false
  }
}

/**
 * 检查今天是否已经进行了备份
 * @returns 今天是否已备份
 */
export const hasBackupToday = (): boolean => {
  const lastBackupDate = localStorage.getItem("last_backup_date")
  const today = new Date().toISOString().split("T")[0]
  return lastBackupDate === today
}
