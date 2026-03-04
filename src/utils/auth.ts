import CryptoJS from "crypto-js"

/**
 * 使用MD5和盐值生成哈希密码
 * @param password 原始密码
 * @param salt 盐值
 * @returns 带盐的MD5哈希值
 */
export const getMd5HashWithSalt = (password: string, salt: string): string => {
  // 将密码和盐值拼接
  const passwordWithSalt = password + salt
  // 生成MD5哈希
  const hash = CryptoJS.MD5(passwordWithSalt).toString()
  return hash
}

/**
 * 验证密码是否匹配预定义的哈希值
 * @param password 用户输入的密码
 * @param expectedHash 预期哈希值
 * @returns 密码是否正确
 */
export const verifyPassword = (password: string): boolean => {
  // 固定的盐值和目标哈希值
  const salt = "1dAc"
  const targetHash = "dc355429abbd77f3bea0da4bbaac2124"

  // 计算输入密码的哈希值
  const inputHash = getMd5HashWithSalt(password, salt)

  // 比较哈希值
  return inputHash === targetHash
}

/**
 * 生成并存储身份验证令牌
 * @returns 生成的令牌
 */
export const generateAndStoreToken = (password: string): string => {
  // 生成令牌
  const token = getMd5HashWithSalt(password, "009989")

  // 存储令牌到localStorage
  localStorage.setItem("auth_token", token)

  return token
}

/**
 * 检查用户是否已经认证
 * @returns 用户是否已认证
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem("auth_token") !== null
}

/**
 * 清除认证状态
 */
export const clearAuthentication = (): void => {
  localStorage.removeItem("auth_token")
}
