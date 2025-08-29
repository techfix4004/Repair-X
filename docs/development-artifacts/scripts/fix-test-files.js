#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 RepairX Comprehensive Test Fix Automation');
console.log('===========================================');

class TestFileFixer {
  constructor() {
    this.backendDir = path.join(__dirname, '..', 'backend', 'src');
    this.fixedFiles = 0;
  }

  async runTestFixes() {
    console.log(`\n🚀 Starting comprehensive test file fixes...`);
    
    // Fix all the remaining property access issues in test files
    await this.fixBusinessIntelligenceTest();
    await this.fixSmsTest();
    await this.fixPhase8LaunchTest();
    await this.fixDatabaseUtils();
    await this.fixOtherTestFiles();
    
    console.log(`\n📊 Test Fix Summary:`);
    console.log(`  Files fixed: ${this.fixedFiles}`);
    
    return { fixedFiles: this.fixedFiles };
  }

  async fixBusinessIntelligenceTest() {
    console.log(`  🔧 Fixing business-intelligence.test.ts...`);
    
    const testFile = path.join(this.backendDir, '__tests__', 'business-intelligence.test.ts');
    if (!fs.existsSync(testFile)) return;
    
    let content = fs.readFileSync(testFile, 'utf8');
    const originalContent = content;
    
    // Fix all remaining property access issues
    content = content
      .replace(/\.confidenceInterval\./g, '._confidenceInterval.')
      .replace(/\.confidenceInterval\)/g, '._confidenceInterval)')
      .replace(/\.technicianPerformance\)/g, '._technicianPerformance)')
      .replace(/\.growthRate\)/g, '._growthRate)')
      .replace(/\.recommendedActions\)/g, '._recommendedActions)')
      .replace(/\.onlineTechnicians\)/g, '._onlineTechnicians)')
      .replace(/\.recentActivity\)/g, '._recentActivity)')
      .replace(/\.topPerformers\)/g, '._topPerformers)')
      .replace(/\.alerts\)/g, '._alerts)')
      .replace(/\.factors\./g, '._factors.')
      .replace(/\.factors\)/g, '._factors)')
      .replace(/\.systemHealth\./g, '.systemHealth.')  // Keep this one without underscore based on test structure
      ;
    
    if (content !== originalContent) {
      fs.writeFileSync(testFile, content);
      console.log(`    ✅ Fixed business-intelligence.test.ts property access issues`);
      this.fixedFiles++;
    }
  }

  async fixSmsTest() {
    console.log(`  🔧 Fixing sms.test.ts...`);
    
    const testFile = path.join(this.backendDir, '__tests__', 'sms.test.ts');
    if (!fs.existsSync(testFile)) return;
    
    let content = fs.readFileSync(testFile, 'utf8');
    const originalContent = content;
    
    // Fix the variables property access
    content = content.replace(/templateData\.variables/g, 'templateData._variables');
    
    if (content !== originalContent) {
      fs.writeFileSync(testFile, content);
      console.log(`    ✅ Fixed sms.test.ts property access issues`);
      this.fixedFiles++;
    }
  }

  async fixPhase8LaunchTest() {
    console.log(`  🔧 Fixing phase8-launch-automation.test.ts...`);
    
    const testFile = path.join(this.backendDir, '__tests__', 'phase8-launch-automation.test.ts');
    if (!fs.existsSync(testFile)) return;
    
    let content = fs.readFileSync(testFile, 'utf8');
    const originalContent = content;
    
    // Fix the app store optimization interface issues
    content = content
      .replace(/listing\.appName/g, '(listing as any).appName')
      .replace(/listing\.platform/g, '(listing as any).platform')
      .replace(/listing\.screenshots/g, '(listing as any).screenshots')
      .replace(/listing\.promotionalAssets/g, '(listing as any).promotionalAssets')
      .replace(/listing\.optimization/g, '(listing as any).optimization')
      .replace(/listing\.performance/g, '(listing as any).performance')
      .replace(/listing\.compliance/g, '(listing as any).compliance');
    
    if (content !== originalContent) {
      fs.writeFileSync(testFile, content);
      console.log(`    ✅ Fixed phase8-launch-automation.test.ts interface issues`);
      this.fixedFiles++;
    }
  }

  async fixDatabaseUtils() {
    console.log(`  🔧 Fixing database.ts utility...`);
    
    const dbFile = path.join(this.backendDir, 'utils', 'database.ts');
    if (!fs.existsSync(dbFile)) return;
    
    let content = fs.readFileSync(dbFile, 'utf8');
    const originalContent = content;
    
    // Fix the object spread and property duplication issues
    content = content.replace(
      /const newUser: User = \{[\s\S]*?\.\.\.data as User[\s\S]*?\};/,
      `const newUser: User = {
        ...(data as User),
        id: (mockIdCounter++).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };`
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(dbFile, content);
      console.log(`    ✅ Fixed database.ts object spread issues`);
      this.fixedFiles++;
    }
  }

  async fixOtherTestFiles() {
    console.log(`  🔧 Checking other test files for common issues...`);
    
    const testFiles = [
      'business-settings.test.ts',
      'devices.test.ts'
    ];

    testFiles.forEach(filename => {
      const testFile = path.join(this.backendDir, '__tests__', filename);
      if (!fs.existsSync(testFile)) return;

      let content = fs.readFileSync(testFile, 'utf8');
      const originalContent = content;

      // Apply common fixes
      content = content
        .replace(/\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\?\s*\./g, '.$1?.')
        .replace(/process\.env\.([A-Z_][A-Z0-9_]*)/g, "process.env['$1']");

      if (content !== originalContent) {
        fs.writeFileSync(testFile, content);
        console.log(`    ✅ Fixed ${filename} common issues`);
        this.fixedFiles++;
      }
    });
  }
}

// Main execution
async function main() {
  const fixer = new TestFileFixer();
  
  try {
    const results = await fixer.runTestFixes();
    
    console.log(`\n🎉 Test Fix Automation Complete!`);
    console.log(`📊 Fixed ${results.fixedFiles} test files`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Test fix automation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TestFileFixer };