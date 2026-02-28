import type { Habit, CheckIn, Task, LifeMoment, Idea, Relationship } from './database';
import { add } from './enhancedDatabase';

/**
 * 添加示例数据
 */
export async function addSampleData() {
  try {
    console.log('Adding sample data...');
    await addSampleHabits();
    await addSampleTasks();
    await addSampleLifeMoments();
    await addSampleRelationships();
    await addSampleIdeas();
    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

/**
 * 添加示例习惯数据
 */
async function addSampleHabits() {
  const habits: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: '每日阅读',
      description: '每天阅读至少30分钟，培养阅读习惯',
      frequency: 'daily',
      active: true,
    },
    {
      name: '冥想',
      description: '每天冥想10分钟，保持心灵平静',
      frequency: 'daily',
      active: true,
    },
    {
      name: '运动',
      description: '每周至少锻炼3次，每次30分钟以上',
      frequency: 'weekly',
      active: true,
    },
    {
      name: '写周记',
      description: '每周末记录本周的收获与反思',
      frequency: 'weekly',
      active: true,
    },
    {
      name: '月度复盘',
      description: '每月底对这个月的目标完成情况进行复盘',
      frequency: 'monthly',
      active: true,
    }
  ];

  for (const habit of habits) {
    const id = await add('habits', habit);
    // 为一些习惯添加打卡记录
    if (habit.name === '每日阅读' || habit.name === '冥想') {
      const checkIns: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      // 添加过去几天的打卡记录
      for (let i = 1; i <= 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        checkIns.push({
          habitId: id,
          date,
          status: i % 3 === 0 ? 'half-completed' : 'completed',
          note: `第${i}天的${habit.name}记录`
        });
      }
      
      for (const checkIn of checkIns) {
        await add('checkIns', checkIn);
      }
    }
  }
}

/**
 * 添加示例任务数据
 */
async function addSampleTasks() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: '完成项目报告',
      description: '完成本季度项目进展报告，包括目标达成情况与未来计划',
      type: 'work',
      status: 'in-progress',
      dueDate: tomorrow,
      priority: 'high',
    },
    {
      title: '团队周会',
      description: '讨论本周工作进展与下周计划',
      type: 'work',
      status: 'pending',
      dueDate: nextWeek,
      priority: 'medium',
    },
    {
      title: '学习React新特性',
      description: '学习React 19的新特性与用法',
      type: 'growth',
      status: 'pending',
      dueDate: nextWeek,
      priority: 'medium',
    },
    {
      title: '读完《深入理解TypeScript》',
      description: '阅读并完成书中的练习',
      type: 'growth',
      status: 'in-progress',
      priority: 'medium',
    },
    {
      title: '整理工作文档',
      description: '整理并归档过期文档，更新现有文档',
      type: 'work',
      status: 'completed',
      priority: 'low',
    }
  ];

  for (const task of tasks) {
    await add('tasks', task);
  }
}

/**
 * 添加示例生活点滴数据
 */
async function addSampleLifeMoments() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  
  const moments: Omit<LifeMoment, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: '公园野餐',
      description: '今天和朋友们一起去公园野餐，天气很好，我们玩得很开心。分享了很多生活故事，也交流了最近的工作情况。希望以后能多组织这样的活动。',
      date: yesterday,
      tags: ['朋友', '户外', '休闲'],
      attachments: [],
    },
    {
      title: '完成了第一个React项目',
      description: '经过两周的努力，终于完成了第一个React项目！虽然过程中遇到了很多困难，但最终成功克服了。这次经历让我对前端开发有了更深的理解。',
      date: lastWeek,
      tags: ['工作', '成就', '编程'],
      attachments: [],
    },
    {
      title: '家庭聚餐',
      description: '难得的家庭聚餐，全家人都到齐了。妈妈做了很多我喜欢吃的菜，我们聊了很多家常，也分享了各自的近况。这样的时刻真的很珍贵。',
      date: lastMonth,
      tags: ['家庭', '美食'],
      attachments: [],
    },
    {
      title: '晨跑开始',
      description: '今天开始尝试晨跑，虽然只跑了2公里，但感觉很好。希望能坚持下去，养成良好的运动习惯。',
      date: today,
      tags: ['运动', '健康'],
      attachments: [],
    }
  ];

  for (const moment of moments) {
    await add('lifeMoments', moment);
  }
}

/**
 * 添加示例社交关系数据
 */
async function addSampleRelationships() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const relationships: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: '张三',
      category: '朋友',
      lastContact: lastWeek,
      nextContact: nextWeek,
      notes: '大学同学，现在在上海工作。喜欢旅游和摄影。',
    },
    {
      name: '李四',
      category: '同事',
      lastContact: today,
      nextContact: nextMonth,
      notes: '项目组长，有技术问题可以向他请教。',
    },
    {
      name: '王五',
      category: '家人',
      lastContact: today,
      notes: '表弟，刚上大学，对编程很感兴趣。',
    },
    {
      name: '赵六',
      category: '朋友',
      nextContact: nextWeek,
      notes: '高中好友，很久没联系了，应该约出来聚聚。',
    }
  ];

  for (const relationship of relationships) {
    await add('relationships', relationship);
  }
}

/**
 * 添加示例灵感想法数据
 */
async function addSampleIdeas() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const ideas: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      content: '开发一个帮助记录日常灵感的移动应用，支持快速记录文字、语音和图片',
      date: today,
      category: '项目想法',
    },
    {
      content: '学习一门新的编程语言，比如Rust或Go，拓展技术栈',
      date: yesterday,
      category: '学习计划',
    },
    {
      content: '为现有的项目添加数据可视化功能，使用ECharts或D3.js',
      date: lastWeek,
      category: '工作改进',
    },
    {
      content: '尝试每天冥想10分钟，观察对注意力和压力水平的影响',
      date: today,
      category: '生活习惯',
    },
    {
      content: '写一篇关于个人知识管理系统构建的博客文章，分享自己的经验',
      date: yesterday,
      category: '内容创作',
    }
  ];

  for (const idea of ideas) {
    await add('ideas', idea);
  }
}