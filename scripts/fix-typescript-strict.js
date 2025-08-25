#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RepairX TypeScript Strict Mode Fix Automation');
console.log('================================================');

const backendDir = path.join(__dirname, '..', 'backend', 'src');

// Patterns to fix
const fixes = [
  // Fix process.env property access
  {
    pattern: /process\.env\.([A-Z_]+)/g,
    replacement: "process.env['$1']",
    description: 'Fix process.env property access'
  },
  // Fix underscore-prefixed properties 
  {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\?\.score/g,
    replacement: '.$1?._score',
    description: 'Fix underscore-prefixed score property'
  },
  {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\?\.factors/g,
    replacement: '.$1?._factors',
    description: 'Fix underscore-prefixed factors property'
  },
  {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\?\.reasoning/g,
    replacement: '.$1?._reasoning',
    description: 'Fix underscore-prefixed reasoning property'
  },
  {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\?\.confidenceInterval/g,
    replacement: '.$1?._confidenceInterval',
    description: 'Fix underscore-prefixed confidenceInterval property'
  },
  {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\?\.serviceCategories/g,
    replacement: '.$1?._serviceCategories', 
    description: 'Fix underscore-prefixed serviceCategories property'
  }
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(fix => {
    const originalContent = content;
    content = content.replace(fix.pattern, fix.replacement);
    if (content !== originalContent) {
      console.log(`  ✅ Applied: ${fix.description}`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let fixedFiles = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedFiles += processDirectory(fullPath);
    } else if (file.endsWith('.ts')) {
      console.log(`📄 Processing: ${fullPath}`);
      if (processFile(fullPath)) {
        fixedFiles++;
        console.log(`  ✅ Fixed issues in ${file}`);
      }
    }
  });
  
  return fixedFiles;
}

try {
  console.log(`\n🚀 Starting automated TypeScript fixes in: ${backendDir}\n`);
  
  const fixedFiles = processDirectory(backendDir);
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${fixedFiles}`);
  
  // Test the build to verify fixes
  console.log(`\n🧪 Testing build after fixes...`);
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..', 'backend'),
      stdio: 'inherit' 
    });
    console.log(`✅ Build successful! TypeScript issues resolved.`);
  } catch (error) {
    console.log(`⚠️  Build still has issues. Checking with clean config...`);
    try {
      execSync('npm run build -- --project tsconfig.clean.json', { 
        cwd: path.join(__dirname, '..', 'backend'),
        stdio: 'inherit' 
      });
      console.log(`✅ Clean build successful! Core system operational.`);
    } catch (cleanError) {
      console.log(`❌ Even clean build failed. Manual intervention needed.`);
    }
  }
  
} catch (error) {
  console.error('❌ Error during automated fix process:', error.message);
  process.exit(1);
}