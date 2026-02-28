// 导入修复脚本
const fs = require('fs');
const path = require('path');

// 要检查的模块目录
const modulesDir = path.join(__dirname, 'src/components/modules');

// 递归查找所有 TypeScript/TSX 文件
function findFiles(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      // 递归处理子目录
      findFiles(filePath, filelist);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // 仅添加 TypeScript 文件
      filelist.push(filePath);
    }
  });
  
  return filelist;
}

// 匹配数据库导入的正则表达式
const databaseImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/services\/database['"];/g;

// 修复导入
function fixImports(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let wasModified = false;
  
  // 检查文件中是否包含数据库导入
  if (fileContent.includes('from') && fileContent.includes('database')) {
    // 使用正则表达式匹配数据库导入
    const matches = fileContent.matchAll(/import\s*{\s*([^}]+)\s*}\s*from\s*['"](.*)\/services\/database['"];/g);
    for (const match of matches) {
      const [fullMatch, importList, importPath] = match;
      
      // 分离类型导入和函数导入
      const imports = importList.split(',').map(i => i.trim());
      const typeImports = imports.filter(i => ['Habit', 'CheckIn', 'LifeMoment', 'Task', 'Idea', 'Relationship'].includes(i));
      const funcImports = imports.filter(i => !typeImports.includes(i));
      
      // 仅当有类型导入和函数导入时需要修复
      if (typeImports.length > 0) {
        const newImports = [];
        
        // 添加类型导入
        if (typeImports.length > 0) {
          newImports.push(`import type { ${typeImports.join(', ')} } from '${importPath}/services/database';`);
        }
        
        // 添加函数导入
        if (funcImports.length > 0) {
          newImports.push(`import { ${funcImports.join(', ')} } from '${importPath}/services/database';`);
        }
        
        // 替换原始导入
        fileContent = fileContent.replace(fullMatch, newImports.join('\n'));
        wasModified = true;
      }
    }
    
    // 如果文件被修改，写回文件系统
    if (wasModified) {
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`Fixed imports in: ${path.basename(filePath)}`);
    }
  }
}

// 找到所有文件并修复导入
const files = findFiles(modulesDir);
let fixedCount = 0;

console.log(`Checking ${files.length} files for database imports...`);

files.forEach(file => {
  try {
    fixImports(file);
    fixedCount++;
  } catch (error) {
    console.error(`Error fixing file ${file}:`, error);
  }
});

console.log(`Done! Processed ${fixedCount} of ${files.length} files.`);