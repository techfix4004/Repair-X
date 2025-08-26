// @ts-nocheck
/**
 * Local Storage Service - Secure File Storage Implementation
 * Replaces AWS S3 with enterprise-grade local storage solution
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/config';

interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  userId?: string;
  tags?: string[];
}

interface UploadResult {
  id: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

interface StorageConfig {
  basePath: string;
  baseUrl: string;
  maxFileSize: number;
  allowedTypes: string[];
  encryption: {
    algorithm: string;
    key: string;
  };
}

class LocalStorageService {
  private config: StorageConfig;
  private auditLogger: any; // Would be proper logger in production

  constructor() {
    this.config = {
      basePath: config._LOCAL_STORAGE_PATH || '/app/data/uploads',
      baseUrl: config._LOCAL_STORAGE_BASE_URL || 'http://localhost:3001/uploads',
      maxFileSize: config._LOCAL_STORAGE_MAX_SIZE || 104857600, // 100MB
      allowedTypes: (config._LOCAL_STORAGE_ALLOWED_TYPES || 'image/*,application/pdf,text/*').split(','),
      encryption: {
        algorithm: 'aes-256-gcm',
        key: process.env.STORAGE_ENCRYPTION_KEY || 'default-key-change-in-production'
      }
    };

    this.auditLogger = {
      log: (operation: string, data: any) => {
        console.log(`[STORAGE_AUDIT] ${operation}:`, JSON.stringify(data));
      }
    };

    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Create base directory structure
      const dirs = [
        this.config.basePath,
        path.join(this.config.basePath, 'images'),
        path.join(this.config.basePath, 'documents'),
        path.join(this.config.basePath, 'job-photos'),
        path.join(this.config.basePath, 'attachments'),
        path.join(this.config.basePath, '../backups'),
        path.join(this.config.basePath, '../temp')
      ];

      for (const dir of dirs) {
        try {
          await fs.access(dir);
        } catch {
          await fs.mkdir(dir, { recursive: true, mode: 0o755 });
          console.log(`Created storage directory: ${dir}`);
        }
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  async uploadFile(fileBuffer: Buffer, metadata: FileMetadata): Promise<UploadResult> {
    try {
      // Validate file size
      if (fileBuffer.length > this.config.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
      }

      // Validate file type
      if (!this.isAllowedFileType(metadata.mimeType)) {
        throw new Error(`File type ${metadata.mimeType} is not allowed`);
      }

      // Generate secure file name
      const fileName = this.generateSecureFileName(metadata);
      const category = this.categorizeFile(metadata.mimeType);
      const filePath = path.join(this.config.basePath, category, fileName);

      // Encrypt file content if enabled
      const finalContent = this.shouldEncrypt(metadata.mimeType) 
        ? this.encryptFile(fileBuffer) 
        : fileBuffer;

      // Save file atomically
      await this.atomicWrite(filePath, finalContent);

      // Create metadata file
      await this.saveMetadata(filePath, metadata);

      // Log operation for audit
      this.auditLogger.log('FILE_UPLOAD', {
        fileName,
        originalName: metadata.originalName,
        size: fileBuffer.length,
        mimeType: metadata.mimeType,
        userId: metadata.userId,
        category,
        encrypted: this.shouldEncrypt(metadata.mimeType),
        timestamp: new Date().toISOString()
      });

      const result: UploadResult = {
        id: fileName,
        url: `${this.config.baseUrl}/${category}/${fileName}`,
        size: fileBuffer.length,
        uploadedAt: new Date()
      };

      return result;
    } catch (error) {
      this.auditLogger.log('FILE_UPLOAD_ERROR', {
        error: error.message,
        metadata,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async downloadFile(fileId: string, userId?: string): Promise<Buffer> {
    try {
      // Find file across categories
      const filePath = await this.findFile(fileId);
      if (!filePath) {
        throw new Error('File not found');
      }

      // Check permissions
      if (userId && !await this.hasFileAccess(filePath, userId)) {
        throw new Error('Access denied');
      }

      // Read file
      const fileContent = await fs.readFile(filePath);

      // Decrypt if necessary
      const finalContent = await this.isEncrypted(filePath)
        ? this.decryptFile(fileContent)
        : fileContent;

      // Log access
      this.auditLogger.log('FILE_ACCESS', {
        fileId,
        userId,
        timestamp: new Date().toISOString()
      });

      return finalContent;
    } catch (error) {
      this.auditLogger.log('FILE_ACCESS_ERROR', {
        fileId,
        userId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async deleteFile(fileId: string, userId?: string): Promise<boolean> {
    try {
      const filePath = await this.findFile(fileId);
      if (!filePath) {
        return false;
      }

      // Check permissions for deletion
      if (userId && !await this.hasFileAccess(filePath, userId)) {
        throw new Error('Access denied');
      }

      // Secure deletion
      await this.secureDelete(filePath);
      
      // Delete metadata
      await this.deleteMetadata(filePath);

      this.auditLogger.log('FILE_DELETE', {
        fileId,
        userId,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      this.auditLogger.log('FILE_DELETE_ERROR', {
        fileId,
        userId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const filePath = await this.findFile(fileId);
      if (!filePath) {
        return null;
      }

      const metadataPath = `${filePath}.meta`;
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        return JSON.parse(metadataContent);
      } catch {
        // Fallback to basic metadata
        const stats = await fs.stat(filePath);
        return {
          originalName: fileId,
          mimeType: 'application/octet-stream',
          size: stats.size
        };
      }
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }

  private generateSecureFileName(metadata: FileMetadata): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(metadata.originalName);
    return `${timestamp}_${random}${extension}`;
  }

  private categorizeFile(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType === 'application/pdf') return 'documents';
    if (mimeType.startsWith('text/')) return 'documents';
    return 'attachments';
  }

  private isAllowedFileType(mimeType: string): boolean {
    return this.config.allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const prefix = allowedType.slice(0, -2);
        return mimeType.startsWith(prefix);
      }
      return mimeType === allowedType;
    });
  }

  private shouldEncrypt(mimeType: string): boolean {
    // Encrypt sensitive document types
    const sensitiveTypes = ['application/pdf', 'text/plain', 'application/msword'];
    return sensitiveTypes.includes(mimeType);
  }

  private encryptFile(content: Buffer): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.config.encryption.key);
    const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private decryptFile(encryptedContent: Buffer): Buffer {
    const iv = encryptedContent.slice(0, 16);
    const authTag = encryptedContent.slice(16, 32);
    const encrypted = encryptedContent.slice(32);
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.config.encryption.key);
    decipher.setAuthTag(authTag);
    
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  private async atomicWrite(filePath: string, content: Buffer): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    try {
      await fs.writeFile(tempPath, content, { mode: 0o644 });
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Cleanup temp file if exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  private async saveMetadata(filePath: string, metadata: FileMetadata): Promise<void> {
    const metadataPath = `${filePath}.meta`;
    const metadataContent = JSON.stringify({
      ...metadata,
      uploadedAt: new Date().toISOString(),
      checksum: crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex')
    }, null, 2);
    
    await fs.writeFile(metadataPath, metadataContent, { mode: 0o644 });
  }

  private async deleteMetadata(filePath: string): Promise<void> {
    const metadataPath = `${filePath}.meta`;
    try {
      await fs.unlink(metadataPath);
    } catch {
      // Ignore if metadata file doesn't exist
    }
  }

  private async findFile(fileId: string): Promise<string | null> {
    const categories = ['images', 'documents', 'job-photos', 'attachments'];
    
    for (const category of categories) {
      const filePath = path.join(this.config.basePath, category, fileId);
      try {
        await fs.access(filePath);
        return filePath;
      } catch {
        // Continue searching
      }
    }
    
    return null;
  }

  private async hasFileAccess(filePath: string, userId: string): Promise<boolean> {
    // Basic access control - in production, this would check against a database
    try {
      const metadata = await this.getFileMetadata(path.basename(filePath));
      return !metadata?.userId || metadata.userId === userId;
    } catch {
      return false;
    }
  }

  private async isEncrypted(filePath: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(path.basename(filePath));
      return metadata ? this.shouldEncrypt(metadata.mimeType) : false;
    } catch {
      return false;
    }
  }

  private async secureDelete(filePath: string): Promise<void> {
    try {
      // Get file size for secure overwrite
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      // Overwrite with random data (3 passes)
      for (let pass = 0; pass < 3; pass++) {
        const randomData = crypto.randomBytes(fileSize);
        await fs.writeFile(filePath, randomData);
        await fs.fsync(await fs.open(filePath, 'r+'));
      }

      // Final deletion
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Secure delete failed, falling back to regular delete:', error);
      await fs.unlink(filePath);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      await fs.access(this.config.basePath);
      const stats = await fs.stat(this.config.basePath);
      
      return {
        status: 'healthy',
        details: {
          basePath: this.config.basePath,
          accessible: true,
          permissions: stats.mode.toString(8),
          maxFileSize: this.config.maxFileSize,
          allowedTypes: this.config.allowedTypes.length
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          basePath: this.config.basePath
        }
      };
    }
  }
}

export { LocalStorageService, FileMetadata, UploadResult };
export default LocalStorageService;