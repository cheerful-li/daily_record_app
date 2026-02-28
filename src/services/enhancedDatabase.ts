/**
 * 增强版数据库服务 - 支持云同步的数据库操作
 *
 * 这个模块扩展了基本的数据库操作，添加了自动云同步功能。
 * 每当数据被修改时，变更也会自动同步到云端。
 */

import * as db from "./database";
import { triggerCloudSync } from "./cloudSync";
import type { DailyRecordDB } from "./database";

/**
 * 向存储库添加项目并同步到云端
 * @param storeName 存储库名称
 * @param item 要添加的项目
 * @returns 新添加项目的ID
 */
export async function add<T extends keyof DailyRecordDB>(
  storeName: T,
  item: Omit<DailyRecordDB[T]["value"], "id">
): Promise<number> {
  // 使用基础数据库添加项目
  const id = await db.add(storeName, item);

  // 触发云同步
  triggerCloudSync();

  return id;
}

/**
 * 更新存储库中的项目并同步到云端
 * @param storeName 存储库名称
 * @param id 项目ID
 * @param item 更新的项目数据
 * @returns 更新项目的ID
 */
export async function update<T extends keyof DailyRecordDB>(
  storeName: T,
  id: number,
  item: Partial<DailyRecordDB[T]["value"]>
): Promise<number> {
  // 使用基础数据库更新项目
  const updatedId = await db.update(storeName, id, item);

  // 触发云同步
  triggerCloudSync();

  return updatedId;
}

/**
 * 从存储库中删除项目并同步到云端
 * @param storeName 存储库名称
 * @param id 要删除的项目ID
 */
export async function remove<T extends keyof DailyRecordDB>(
  storeName: T,
  id: number
): Promise<void> {
  // 使用基础数据库删除项目
  await db.remove(storeName, id);

  // 触发云同步
  triggerCloudSync();
}

/**
 * 批量导入数据并同步到云端
 * @param data 要导入的数据对象
 */
export async function importData(data: {
  habits?: db.Habit[];
  checkIns?: db.CheckIn[];
  lifeMoments?: db.LifeMoment[];
  tasks?: db.Task[];
  ideas?: db.Idea[];
  relationships?: db.Relationship[];
}): Promise<void> {
  // 首先清除现有数据
  await db.clearAllData();

  // 创建一个事务来批量添加数据
  const database = await db.initDatabase();
  const tx = database.transaction(
    ["habits", "checkIns", "lifeMoments", "tasks", "ideas", "relationships"],
    "readwrite"
  );

  // 添加习惯数据
  if (data.habits && data.habits.length > 0) {
    const habitsStore = tx.objectStore("habits");
    for (const habit of data.habits) {
      await habitsStore.add(habit);
    }
  }

  // 添加打卡数据
  if (data.checkIns && data.checkIns.length > 0) {
    const checkInsStore = tx.objectStore("checkIns");
    for (const checkIn of data.checkIns) {
      await checkInsStore.add(checkIn);
    }
  }

  // 添加生活点滴数据
  if (data.lifeMoments && data.lifeMoments.length > 0) {
    const lifeMomentsStore = tx.objectStore("lifeMoments");
    for (const moment of data.lifeMoments) {
      await lifeMomentsStore.add(moment);
    }
  }

  // 添加任务数据
  if (data.tasks && data.tasks.length > 0) {
    const tasksStore = tx.objectStore("tasks");
    for (const task of data.tasks) {
      await tasksStore.add(task);
    }
  }

  // 添加想法数据
  if (data.ideas && data.ideas.length > 0) {
    const ideasStore = tx.objectStore("ideas");
    for (const idea of data.ideas) {
      await ideasStore.add(idea);
    }
  }

  // 添加关系数据
  if (data.relationships && data.relationships.length > 0) {
    const relationshipsStore = tx.objectStore("relationships");
    for (const relationship of data.relationships) {
      await relationshipsStore.add(relationship);
    }
  }

  // 提交事务
  await tx.done;

  // 触发云同步
  triggerCloudSync();
}

// 导出原始数据库功能
export {
  initDatabase,
  getAll,
  getById,
  queryByIndex,
  clearAllData,
} from "./database";
export type {
  Habit,
  CheckIn,
  LifeMoment,
  Task,
  Idea,
  Relationship,
} from "./database";
