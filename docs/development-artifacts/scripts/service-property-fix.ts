#!/usr/bin/env tsx
/**
 * Service Return Object Fix
 * Fixes service methods to return properly named properties
 */

import * as fs from 'fs/promises';
import * as path from 'path';

class ServicePropertyFix {
  private rootDir: string;

  constructor() {
    this.rootDir = process.cwd();
  }

  async run(): Promise<void> {
    console.log('🔧 Fixing service return object properties...\n');
    
    try {
      // Get all service files
      const serviceFiles = await this.getServiceFiles();
      
      let fixedCount = 0;
      for (const file of serviceFiles) {
        const fixed = await this.fixServiceFile(file);
        if (fixed) fixedCount++;
      }
      
      console.log(`✅ Fixed ${fixedCount} service files`);
      
    } catch (error) {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    }
  }

  private async fixServiceFile(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let updatedContent = content;
      let hasChanges = false;

      // Fix return object properties - remove underscores from property names
      // Pattern: _propertyName: value -> propertyName: value
      updatedContent = updatedContent.replace(/(\s+)_(\w+):/g, '$1$2:');
      
      // Fix interface definitions - remove underscores
      updatedContent = updatedContent.replace(/(\s+)_(\w+)(\s*:\s*[^;]+;)/g, '$1$2$3');
      
      // Fix variable declarations with underscores
      updatedContent = updatedContent.replace(/\b_(\w+)\s*:/g, '$1:');
      
      // Fix property access patterns
      updatedContent = updatedContent.replace(/\.(_\w+)\b/g, (match, prop) => {
        const cleanProp = prop.substring(1);
        return `.${cleanProp}`;
      });

      if (updatedContent !== content) {
        await fs.writeFile(filePath, updatedContent);
        hasChanges = true;
        console.log(`   ✓ Fixed ${path.basename(filePath)}`);
      }

      return hasChanges;
    } catch (error) {
      console.log(`   ⚠ Could not fix ${path.basename(filePath)}: ${error}`);
      return false;
    }
  }

  private async getServiceFiles(): Promise<string[]> {
    const serviceDir = path.join(this.rootDir, 'backend/src/services');
    return this.getFilesRecursive(serviceDir, '.ts');
  }

  private async getFilesRecursive(dir: string, extension: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getFilesRecursive(fullPath, extension);
          files.push(...subFiles);
        } else if (entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
    
    return files;
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new ServicePropertyFix();
  fixer.run().catch(console.error);
}