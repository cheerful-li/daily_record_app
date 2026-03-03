import { openDB } from "idb";
import type { IDBPDatabase } from "idb";

// Define database types according to the design document
export interface Habit {
  id?: number;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckIn {
  id?: number;
  habitId: number;
  date: Date;
  status: "completed" | "half-completed" | "skipped";
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LifeMoment {
  id?: number;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  type: "work" | "growth";
  status: "pending" | "in-progress" | "completed";
  // 移除截止日期
  // dueDate?: Date;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea {
  id?: number;
  content: string;
  date: Date;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id?: number;
  name: string;
  category: string;
  lastContact?: Date;
  nextContact?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the database schema
export interface DailyRecordDB {
  habits: {
    key: number;
    value: Habit;
    indexes: {
      "by-name": string;
      "by-frequency": string;
      "by-active": boolean;
    };
  };
  checkIns: {
    key: number;
    value: CheckIn;
    indexes: { "by-habitId": number; "by-date": Date; "by-status": string };
  };
  lifeMoments: {
    key: number;
    value: LifeMoment;
    indexes: { "by-date": Date; "by-tags": string[] };
  };
  tasks: {
    key: number;
    value: Task;
    indexes: {
      "by-type": string;
      "by-status": string;
      "by-dueDate": Date;
      "by-priority": string;
    };
  };
  ideas: {
    key: number;
    value: Idea;
    indexes: { "by-date": Date; "by-category": string };
  };
  relationships: {
    key: number;
    value: Relationship;
    indexes: {
      "by-name": string;
      "by-category": string;
      "by-nextContact": Date;
    };
  };
}

// Database version
const DB_VERSION = 1;
const DB_NAME = "daily-record-db";

// Singleton instance of the database
let dbInstance: IDBPDatabase<DailyRecordDB> | null = null;

// Initialize the database
export async function initDatabase(): Promise<IDBPDatabase<DailyRecordDB>> {
  if (dbInstance) return dbInstance;

  const db = await openDB<DailyRecordDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains("habits")) {
        const habitsStore = db.createObjectStore("habits", {
          keyPath: "id",
          autoIncrement: true,
        });
        habitsStore.createIndex("by-name", "name");
        habitsStore.createIndex("by-frequency", "frequency");
        habitsStore.createIndex("by-active", "active");
      }

      if (!db.objectStoreNames.contains("checkIns")) {
        const checkInsStore = db.createObjectStore("checkIns", {
          keyPath: "id",
          autoIncrement: true,
        });
        checkInsStore.createIndex("by-habitId", "habitId");
        checkInsStore.createIndex("by-date", "date");
        checkInsStore.createIndex("by-status", "status");
      }

      if (!db.objectStoreNames.contains("lifeMoments")) {
        const lifeMomentsStore = db.createObjectStore("lifeMoments", {
          keyPath: "id",
          autoIncrement: true,
        });
        lifeMomentsStore.createIndex("by-date", "date");
        lifeMomentsStore.createIndex("by-tags", "tags", { multiEntry: true });
      }

      if (!db.objectStoreNames.contains("tasks")) {
        const tasksStore = db.createObjectStore("tasks", {
          keyPath: "id",
          autoIncrement: true,
        });
        tasksStore.createIndex("by-type", "type");
        tasksStore.createIndex("by-status", "status");
        tasksStore.createIndex("by-dueDate", "dueDate");
        tasksStore.createIndex("by-priority", "priority");
      }

      if (!db.objectStoreNames.contains("ideas")) {
        const ideasStore = db.createObjectStore("ideas", {
          keyPath: "id",
          autoIncrement: true,
        });
        ideasStore.createIndex("by-date", "date");
        ideasStore.createIndex("by-category", "category");
        ideasStore.createIndex("by-tags", "tags", { multiEntry: true });
      }

      if (!db.objectStoreNames.contains("relationships")) {
        const relationshipsStore = db.createObjectStore("relationships", {
          keyPath: "id",
          autoIncrement: true,
        });
        relationshipsStore.createIndex("by-name", "name");
        relationshipsStore.createIndex("by-category", "category");
        relationshipsStore.createIndex("by-nextContact", "nextContact");
      }
    },
  });

  dbInstance = db;
  return db;
}

// Generic CRUD operations for database entities
export async function getAll<T extends keyof DailyRecordDB>(
  storeName: T
): Promise<DailyRecordDB[T]["value"][]> {
  const db = await initDatabase();
  return db.getAll(storeName);
}

export async function getById<T extends keyof DailyRecordDB>(
  storeName: T,
  id: number
): Promise<DailyRecordDB[T]["value"] | undefined> {
  const db = await initDatabase();
  return db.get(storeName, id);
}

export async function add<T extends keyof DailyRecordDB>(
  storeName: T,
  item: Omit<DailyRecordDB[T]["value"], "id">
): Promise<number> {
  const db = await initDatabase();
  const now = new Date();
  const itemWithTimestamps = {
    ...item,
    createdAt: now,
    updatedAt: now,
  } as DailyRecordDB[T]["value"];
  return db.add(storeName, itemWithTimestamps);
}

export async function update<T extends keyof DailyRecordDB>(
  storeName: T,
  id: number,
  item: Partial<DailyRecordDB[T]["value"]>
): Promise<number> {
  const db = await initDatabase();
  const existingItem = await db.get(storeName, id);

  if (!existingItem) {
    throw new Error(`Item with id ${id} not found in ${String(storeName)}`);
  }

  const updatedItem = {
    ...existingItem,
    ...item,
    updatedAt: new Date(),
  };

  await db.put(storeName, updatedItem);
  return id;
}

export async function remove<T extends keyof DailyRecordDB>(
  storeName: T,
  id: number
): Promise<void> {
  const db = await initDatabase();
  await db.delete(storeName, id);
}

// Helper function to query by index
export async function queryByIndex<
  T extends keyof DailyRecordDB,
  I extends keyof DailyRecordDB[T]["indexes"]
>(
  storeName: T,
  indexName: I,
  value: DailyRecordDB[T]["indexes"][I]
): Promise<DailyRecordDB[T]["value"][]> {
  const db = await initDatabase();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const index = store.index(indexName as string);
  return index.getAll(value);
}

// Helper function to clear all data
export async function clearAllData(): Promise<void> {
  const db = await initDatabase();
  const storeNames: Array<keyof DailyRecordDB> = [
    "habits",
    "checkIns",
    "lifeMoments",
    "tasks",
    "ideas",
    "relationships",
  ];
  const transaction = db.transaction(storeNames, "readwrite");

  await Promise.all([
    transaction.objectStore("habits").clear(),
    transaction.objectStore("checkIns").clear(),
    transaction.objectStore("lifeMoments").clear(),
    transaction.objectStore("tasks").clear(),
    transaction.objectStore("ideas").clear(),
    transaction.objectStore("relationships").clear(),
    transaction.done,
  ]);
}
