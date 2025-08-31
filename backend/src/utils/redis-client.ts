/**
 * Redis Client for Production Caching, Sessions, and Queues
 * 
 * Production-ready Redis implementation for RepairX platform with
 * comprehensive error handling, connection pooling, and monitoring.
 */

import Redis from 'ioredis';
import { logger } from './logger';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  enableReadyCheck?: boolean;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

class RedisService {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;
  private isConnected: boolean = false;

  constructor(config: RedisConfig) {
    const defaultConfig = {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      ...config
    };

    // Main Redis client for general operations
    this.client = new Redis(defaultConfig);
    
    // Dedicated client for pub/sub operations
    this.subscriber = new Redis(defaultConfig);
    this.publisher = new Redis(defaultConfig);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Main client events
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('🔴 Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('🔴 Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('🔄 Redis client reconnecting...');
    });

    // Subscriber events
    this.subscriber.on('error', (error) => {
      logger.error('❌ Redis subscriber error:', error);
    });

    // Publisher events
    this.publisher.on('error', (error) => {
      logger.error('❌ Redis publisher error:', error);
    });
  }

  async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect()
      ]);
      logger.info('🚀 All Redis connections established');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.quit(),
        this.subscriber.quit(),
        this.publisher.quit()
      ]);
      this.isConnected = false;
      logger.info('🔴 Redis connections closed');
    } catch (error) {
      logger.error('❌ Error disconnecting from Redis:', error);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('❌ Redis ping failed:', error);
      return false;
    }
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error(`❌ Redis SET failed for key ${key}:`, error);
      return false;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`❌ Redis GET failed for key ${key}:`, error);
      return null;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`❌ Redis DEL failed for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`❌ Redis EXISTS failed for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`❌ Redis EXPIRE failed for key ${key}:`, error);
      return false;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hset(key, field, serializedValue);
      return true;
    } catch (error) {
      logger.error(`❌ Redis HSET failed for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`❌ Redis HGET failed for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hgetall<T = Record<string, any>>(key: string): Promise<T | null> {
    try {
      const hash = await this.client.hgetall(key);
      if (Object.keys(hash).length === 0) return null;
      
      const result: Record<string, any> = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value; // Keep as string if not JSON
        }
      }
      return result as T;
    } catch (error) {
      logger.error(`❌ Redis HGETALL failed for key ${key}:`, error);
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hdel(key, field);
      return result > 0;
    } catch (error) {
      logger.error(`❌ Redis HDEL failed for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.client.lpush(key, ...serializedValues);
    } catch (error) {
      logger.error(`❌ Redis LPUSH failed for key ${key}:`, error);
      return 0;
    }
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.rpop(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`❌ Redis RPOP failed for key ${key}:`, error);
      return null;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(key);
    } catch (error) {
      logger.error(`❌ Redis LLEN failed for key ${key}:`, error);
      return 0;
    }
  }

  // Set operations
  async sadd(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map(m => JSON.stringify(m));
      return await this.client.sadd(key, ...serializedMembers);
    } catch (error) {
      logger.error(`❌ Redis SADD failed for key ${key}:`, error);
      return 0;
    }
  }

  async smembers<T = any>(key: string): Promise<T[]> {
    try {
      const members = await this.client.smembers(key);
      return members.map(m => JSON.parse(m)) as T[];
    } catch (error) {
      logger.error(`❌ Redis SMEMBERS failed for key ${key}:`, error);
      return [];
    }
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map(m => JSON.stringify(m));
      return await this.client.srem(key, ...serializedMembers);
    } catch (error) {
      logger.error(`❌ Redis SREM failed for key ${key}:`, error);
      return 0;
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<number> {
    try {
      const serializedMessage = JSON.stringify(message);
      return await this.publisher.publish(channel, serializedMessage);
    } catch (error) {
      logger.error(`❌ Redis PUBLISH failed for channel ${channel}:`, error);
      return 0;
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch (error) {
            logger.error(`❌ Failed to parse message from channel ${channel}:`, error);
          }
        }
      });
    } catch (error) {
      logger.error(`❌ Redis SUBSCRIBE failed for channel ${channel}:`, error);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      logger.error(`❌ Redis UNSUBSCRIBE failed for channel ${channel}:`, error);
    }
  }

  // Session management helpers
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<boolean> {
    return await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.del(`session:${sessionId}`);
  }

  async extendSession(sessionId: string, ttl: number = 3600): Promise<boolean> {
    return await this.expire(`session:${sessionId}`, ttl);
  }

  // Rate limiting helpers
  async incrementRateLimit(key: string, ttl: number = 60): Promise<number> {
    try {
      const current = await this.client.incr(`ratelimit:${key}`);
      if (current === 1) {
        await this.client.expire(`ratelimit:${key}`, ttl);
      }
      return current;
    } catch (error) {
      logger.error(`❌ Rate limit increment failed for key ${key}:`, error);
      return 0;
    }
  }

  async getRateLimit(key: string): Promise<number> {
    try {
      const result = await this.client.get(`ratelimit:${key}`);
      return result ? parseInt(result, 10) : 0;
    } catch (error) {
      logger.error(`❌ Rate limit get failed for key ${key}:`, error);
      return 0;
    }
  }

  // Queue operations
  async enqueue(queueName: string, job: any): Promise<boolean> {
    return await this.lpush(`queue:${queueName}`, job) > 0;
  }

  async dequeue<T = any>(queueName: string): Promise<T | null> {
    return await this.rpop<T>(`queue:${queueName}`);
  }

  async getQueueLength(queueName: string): Promise<number> {
    return await this.llen(`queue:${queueName}`);
  }

  // Pattern-based deletion
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.client.del(...keys);
    } catch (error) {
      logger.error(`❌ Redis delete pattern failed for ${pattern}:`, error);
      return 0;
    }
  }

  // Health check with extended metrics
  async healthCheck(): Promise<{ status: string; latency?: number; hitRate?: number }> {
    try {
      const start = Date.now();
      const pingResult = await this.ping();
      const latency = Date.now() - start;
      
      // Get Redis info for hit rate calculation
      let hitRate: number | undefined;
      try {
        const info = await this.client.info('stats');
        const lines = info.split('\r\n');
        const keyspaceHits = lines.find(line => line.startsWith('keyspace_hits:'));
        const keyspaceMisses = lines.find(line => line.startsWith('keyspace_misses:'));
        
        if (keyspaceHits && keyspaceMisses) {
          const hits = parseInt(keyspaceHits.split(':')[1]);
          const misses = parseInt(keyspaceMisses.split(':')[1]);
          if (hits + misses > 0) {
            hitRate = (hits / (hits + misses)) * 100;
          }
        }
      } catch (error) {
        logger.warn('Could not calculate Redis hit rate:', error);
      }
      
      return {
        status: pingResult ? 'healthy' : 'unhealthy',
        latency: pingResult ? latency : undefined,
        hitRate
      };
    } catch (error) {
      return { status: 'error' };
    }
  }

  // Health check - maintain original method  
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Redis client configuration
const getRedisConfig = (): RedisConfig => {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    // Parse Redis URL if provided
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      db: parseInt(url.pathname.slice(1)) || 0
    };
  }
  
  // Use individual environment variables
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0')
  };
};

// Create and export Redis service instance
const redisConfig = getRedisConfig();
export const redisService = new RedisService(redisConfig);

// Export Redis client for direct access if needed
export const redisClient = redisService;

// Graceful shutdown handling
const gracefulShutdown = async () => {
  logger.info('🔴 Shutting down Redis connections...');
  await redisService.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default redisService;