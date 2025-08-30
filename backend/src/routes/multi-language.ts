// @ts-nocheck
/**
 * Multi-language Support System
 * Internationalization (i18n) for global deployment
 * Advanced Features from RepairX roadmap
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Language & Translation Schemas
const LanguageSchema = z.object({
  _code: z.string().length(2), // ISO 639-1 language codes
  _name: z.string().min(1),
  _nativeName: z.string().min(1),
  _isEnabled: z.boolean().default(true),
  _isDefault: z.boolean().default(false),
  _direction: z.enum(['ltr', 'rtl']).default('ltr'),
  _flag: z.string().optional(), // Flag emoji or image URL
});

const TranslationSchema = z.object({
  _id: z.string().optional(),
  _key: z.string().min(1),
  _namespace: z.string().default('common'),
  _translations: z.record(z.string(), z.string()), // language code -> translation
  _description: z.string().optional(),
  _tags: z.array(z.string()).default([]),
  _lastModified: z.string().optional(),
  _tenantId: z.string().optional(),
});

const TranslationImportSchema = z.object({
  _language: z.string().length(2),
  _namespace: z.string().default('common'),
  _format: z.enum(['json', 'csv', 'xlsx']).default('json'), data: z.any(),
  _overwrite: z.boolean().default(false),
});

// Multi-language Service
class MultiLanguageService {
  private _languages: Map<string, any> = new Map();
  private _translations: Map<string, any> = new Map();
  private _namespaces: Set<string> = new Set();

  constructor() {
    this.initializeDefaultLanguages();
    this.initializeDefaultTranslations();
  }

  private initializeDefaultLanguages() {
    const defaultLanguages = [
      {
        _code: 'en',
        _name: 'English',
        _nativeName: 'English',
        _isEnabled: true,
        _isDefault: true,
        _direction: 'ltr',
        _flag: '🇺🇸',
      },
      {
        _code: 'es',
        _name: 'Spanish',
        _nativeName: 'Español',
        _isEnabled: true,
        _isDefault: false,
        _direction: 'ltr',
        _flag: '🇪🇸',
      },
      {
        _code: 'fr',
        _name: 'French',
        _nativeName: 'Français',
        _isEnabled: true,
        _isDefault: false,
        _direction: 'ltr',
        _flag: '🇫🇷',
      },
      {
        _code: 'de',
        _name: 'German',
        _nativeName: 'Deutsch',
        _isEnabled: true,
        _isDefault: false,
        _direction: 'ltr',
        _flag: '🇩🇪',
      },
      {
        _code: 'zh',
        _name: 'Chinese Simplified',
        _nativeName: '中文简体',
        _isEnabled: true,
        _isDefault: false,
        _direction: 'ltr',
        _flag: '🇨🇳',
      },
      {
        _code: 'ja',
        _name: 'Japanese',
        _nativeName: '日本語',
        _isEnabled: true,
        _isDefault: false,
        _direction: 'ltr',
        _flag: '🇯🇵',
      },
      {
        _code: 'ar',
        _name: 'Arabic',
        _nativeName: 'العربية',
        _isEnabled: false,
        _isDefault: false,
        _direction: 'rtl',
        _flag: '🇸🇦',
      },
      {
        _code: 'hi',
        _name: 'Hindi',
        _nativeName: 'हिन्दी',
        _isEnabled: false,
        _isDefault: false,
        _direction: 'ltr',
        _flag: '🇮🇳',
      },
    ];

    defaultLanguages.forEach((_lang: unknown) => {
      this.languages.set(lang.code, lang);
    });
  }

  private initializeDefaultTranslations() {
    const defaultTranslations = [
      // Common UI translations
      {
        _id: 'welcome',
        _key: 'common.welcome',
        _namespace: 'common',
        _translations: {
          en: 'Welcome',
          _es: 'Bienvenido',
          _fr: 'Bienvenue',
          _de: 'Willkommen',
          _zh: '欢迎',
          _ja: 'ようこそ',
          _ar: 'مرحبا',
          _hi: 'स्वागत',
        },
        _description: 'Welcome message',
        _tags: ['ui', 'greeting'],
      },
      {
        _id: 'login',
        _key: 'auth.login',
        _namespace: 'auth',
        _translations: {
          en: 'Login',
          _es: 'Iniciar Sesión',
          _fr: 'Connexion',
          _de: 'Anmelden',
          _zh: '登录',
          _ja: 'ログイン',
          _ar: 'تسجيل الدخول',
          _hi: 'लॉग इन करें',
        },
        _description: 'Login button text',
        _tags: ['auth', 'button'],
      },
      {
        _id: 'logout',
        _key: 'auth.logout',
        _namespace: 'auth',
        _translations: {
          en: 'Logout',
          _es: 'Cerrar Sesión',
          _fr: 'Déconnexion',
          _de: 'Abmelden',
          _zh: '登出',
          _ja: 'ログアウト',
          _ar: 'تسجيل الخروج',
          _hi: 'लॉग आउट',
        },
        _description: 'Logout button text',
        _tags: ['auth', 'button'],
      },
      // Job-related translations
      {
        _id: 'job_created',
        _key: 'jobs.created',
        _namespace: 'jobs',
        _translations: {
          en: 'Job created successfully',
          _es: 'Trabajo creado exitosamente',
          _fr: 'Travail créé avec succès',
          _de: 'Auftrag erfolgreich erstellt',
          _zh: '工作创建成功',
          _ja: 'ジョブが正常に作成されました',
          _ar: 'تم إنشاء المهمة بنجاح',
          _hi: 'कार्य सफलतापूर्वक बनाया गया',
        },
        _description: 'Job creation success message',
        _tags: ['jobs', 'success'],
      },
      {
        _id: 'device_repair',
        _key: 'services.device_repair',
        _namespace: 'services',
        _translations: {
          en: 'Device Repair',
          _es: 'Reparación de Dispositivos',
          _fr: 'Réparation d\'Appareils',
          _de: 'Gerätereparatur',
          _zh: '设备维修',
          _ja: 'デバイス修理',
          _ar: 'إصلاح الأجهزة',
          _hi: 'डिवाइस मरम्मत',
        },
        _description: 'Device repair service name',
        _tags: ['services', 'repair'],
      },
      // Status translations
      {
        _id: 'status_in_progress',
        _key: 'status.in_progress',
        _namespace: 'status',
        _translations: {
          en: 'In Progress',
          _es: 'En Progreso',
          _fr: 'En Cours',
          _de: 'In Bearbeitung',
          _zh: '进行中',
          _ja: '進行中',
          _ar: 'قيد التقدم',
          _hi: 'प्रगति में',
        },
        _description: 'In progress status',
        _tags: ['status', 'workflow'],
      },
      {
        _id: 'status_completed',
        _key: 'status.completed',
        _namespace: 'status',
        _translations: {
          en: 'Completed',
          _es: 'Completado',
          _fr: 'Terminé',
          _de: 'Abgeschlossen',
          _zh: '已完成',
          _ja: '完了',
          _ar: 'مكتمل',
          _hi: 'पूर्ण',
        },
        _description: 'Completed status',
        _tags: ['status', 'workflow'],
      },
      // Error messages
      {
        _id: 'error_not_found',
        _key: 'errors.not_found',
        _namespace: 'errors',
        _translations: {
          en: 'Not found',
          _es: 'No encontrado',
          _fr: 'Non trouvé',
          _de: 'Nicht gefunden',
          _zh: '未找到',
          _ja: '見つかりません',
          _ar: 'غير موجود',
          _hi: 'नहीं मिला',
        },
        _description: 'Not found error message',
        _tags: ['errors', 'http'],
      },
      {
        _id: 'error_validation',
        _key: 'errors.validation_failed',
        _namespace: 'errors',
        _translations: {
          en: 'Validation failed',
          _es: 'Validación fallida',
          _fr: 'Échec de la validation',
          _de: 'Validierung fehlgeschlagen',
          _zh: '验证失败',
          _ja: '検証に失敗しました',
          _ar: 'فشل التحقق',
          _hi: 'सत्यापन असफल',
        },
        _description: 'Validation error message',
        _tags: ['errors', 'validation'],
      },
    ];

    defaultTranslations.forEach((_translation: unknown) => {
      this.translations.set(translation.id, translation);
      this.namespaces.add(translation.namespace);
    });
  }

  // Language Management
  async getAllLanguages(_enabledOnly: boolean = false): Promise<any[]> {
    const languages = Array.from(this.languages.values());
    return enabledOnly ? languages.filter((_lang: unknown) => lang.isEnabled) : languages;
  }

  async getLanguage(_code: string): Promise<any | null> {
    return this.languages.get(code) || null;
  }

  async createLanguage(_languageData: unknown): Promise<any> {
    const validated = LanguageSchema.parse(languageData);
    
    // Ensure only one default language
    if (validated.isDefault) {
      Array.from(this.languages.values()).forEach((_lang: unknown) => {
        if (lang.isDefault) {
          lang.isDefault = false;
          this.languages.set(lang.code, lang);
        }
      });
    }
    
    this.languages.set(validated.code, validated);
    return validated;
  }

  async updateLanguage(_code: string, _updateData: unknown): Promise<any> {
    const existingLanguage = this.languages.get(code);
    if (!existingLanguage) {
      throw new Error('Language not found');
    }

    const updated = { ...existingLanguage, ...updateData };
    const validated = LanguageSchema.parse(updated);
    
    // Ensure only one default language
    if (validated.isDefault && !existingLanguage.isDefault) {
      Array.from(this.languages.values()).forEach((_lang: unknown) => {
        if (lang.isDefault && lang.code !== code) {
          lang.isDefault = false;
          this.languages.set(lang.code, lang);
        }
      });
    }
    
    this.languages.set(code, validated);
    return validated;
  }

  async deleteLanguage(_code: string): Promise<void> {
    const language = this.languages.get(code);
    if (!language) {
      throw new Error('Language not found');
    }

    if (language.isDefault) {
      throw new Error('Cannot delete default language');
    }

    this.languages.delete(code);

    // Remove translations for this language
    Array.from(this.translations.values()).forEach((_translation: unknown) => {
      delete translation.translations[code];
      this.translations.set(translation.id, translation);
    });
  }

  // Translation Management
  async getAllTranslations(filters?: { namespace?: string; language?: string; search?: string }): Promise<any[]> {
    let translations = Array.from(this.translations.values());

    if (filters) {
      if (filters.namespace) {
        translations = translations.filter((_t: unknown) => t.namespace === filters.namespace);
      }
      
      if (filters.language) {
        translations = translations.filter((_t: unknown) => t.translations[filters.language!]);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        translations = translations.filter((_t: unknown) => 
          t.key.toLowerCase().includes(searchTerm) ||
          Object.values(t.translations).some((_translation: unknown) => 
            translation.toLowerCase().includes(searchTerm)
          )
        );
      }
    }

    return translations;
  }

  async getTranslation(_id: string): Promise<any | null> {
    return this.translations.get(id) || null;
  }

  async getTranslationsByLanguage(_language: string, _namespace?: string): Promise<Record<string, string>> {
    const translations = Array.from(this.translations.values());
    const filtered = namespace 
      ? translations.filter((_t: unknown) => t.namespace === namespace)
      : translations;

    const _result: Record<string, string> = {};
    filtered.forEach((_translation: unknown) => {
      if (translation.translations[language]) {
        result[translation.key] = translation.translations[language];
      }
    });

    return result;
  }

  async createTranslation(_translationData: unknown): Promise<any> {
    const validated = TranslationSchema.parse(translationData);
    const id = validated.id || `trans-${Date.now()}`;
    
    const translation = {
      ...validated,
      id,
      _lastModified: new Date().toISOString(),
    };
    
    this.translations.set(id, translation);
    this.namespaces.add(translation.namespace);
    
    return translation;
  }

  async updateTranslation(_id: string, _updateData: unknown): Promise<any> {
    const existingTranslation = this.translations.get(id);
    if (!existingTranslation) {
      throw new Error('Translation not found');
    }

    const updated = { 
      ...existingTranslation, 
      ...updateData,
      _lastModified: new Date().toISOString(),
    };
    
    const validated = TranslationSchema.parse(updated);
    this.translations.set(id, validated);
    this.namespaces.add(validated.namespace);
    
    return validated;
  }

  async deleteTranslation(_id: string): Promise<void> {
    if (!this.translations.has(id)) {
      throw new Error('Translation not found');
    }
    
    this.translations.delete(id);
  }

  // Translation Import/Export
  async importTranslations(_importData: unknown): Promise<{ _imported: number; errors: string[] }> {
    const validated = TranslationImportSchema.parse(importData);
    const { language, namespace, format, data, overwrite  } = (validated as unknown);
    
    let imported = 0;
    const _errors: string[] = [];

    try {
      let translations: Record<string, string> = {};
      
      if (format === 'json') {
        translations = data;
      } else if (format === 'csv') {
        // Parse CSV data (simplified)
        const lines = data.split('\n');
        const _headers = lines[0].split(',');
        const keyIndex = _headers.indexOf('key');
        const valueIndex = _headers.indexOf('value');
        
        if (keyIndex === -1 || valueIndex === -1) {
          throw new Error('CSV must have "key" and "value" columns');
        }
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length > keyIndex && values.length > valueIndex) {
            translations[values[keyIndex]] = values[valueIndex];
          }
        }
      }

      // Import translations
      for (const [key, value] of Object.entries(translations)) {
        try {
          const existingId = Array.from(this.translations.values())
            .find((_t: unknown) => t.key === key && t.namespace === namespace)?.id;
          
          if (existingId) {
            if (overwrite) {
              const existing = this.translations.get(existingId);
              existing.translations[language] = value;
              existing.lastModified = new Date().toISOString();
              this.translations.set(existingId, existing);
              imported++;
            }
          } else {
            // Create new translation
            const newTranslation = {
              _id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              key,
              namespace,
              _translations: { [language]: value },
              _lastModified: new Date().toISOString(),
            };
            
            this.translations.set(newTranslation.id, newTranslation);
            this.namespaces.add(namespace);
            imported++;
          }
        } catch (_error: unknown) {
          errors.push(`Failed to import key "${key}": ${error.message}`);
        }
      }
    } catch (_error: unknown) {
      errors.push(`Import _failed: ${error.message}`);
    }

    return { _imported: imported, _errors: errors };
  }

  async exportTranslations(_language: string, namespace?: string, _format: string = 'json'): Promise<any> {
    const translations = await this.getTranslationsByLanguage(language, namespace);
    
    if (format === 'json') {
      return translations;
    } else if (format === 'csv') {
      const csv = ['key,value'];
      Object.entries(translations).forEach(([key, value]) => {
        csv.push(`"${key}","${value}"`);
      });
      return csv.join('\n');
    }
    
    return translations;
  }

  // Utility functions
  async getNamespaces(): Promise<string[]> {
    return Array.from(this.namespaces);
  }

  async getTranslationStats(): Promise<any> {
    const languages = await this.getAllLanguages(true);
    const translations = Array.from(this.translations.values());
    
    const stats = {
      _totalLanguages: languages.length,
      _totalTranslations: translations.length,
      _totalNamespaces: this.namespaces.size,
      _languageCompleteness: {} as Record<string, number>,
      _namespaceBreakdown: {} as Record<string, number>,
    };

    // Calculate language completeness
    languages.forEach((_lang: unknown) => {
      const translatedCount = translations.filter((_t: unknown) => t.translations[lang.code]).length;
      stats.languageCompleteness[lang.code] = Math.round((translatedCount / translations.length) * 100);
    });

    // Calculate namespace breakdown
    translations.forEach((_translation: unknown) => {
      stats.namespaceBreakdown[translation.namespace] = 
        (stats.namespaceBreakdown[translation.namespace] || 0) + 1;
    });

    return stats;
  }

  // Translate function
  async translate(_key: string, _language: string, _namespace?: string): Promise<string> {
    const translations = Array.from(this.translations.values());
    const translation = translations.find((_t: unknown) => 
      t.key === key && 
      (!namespace || t.namespace === namespace)
    );

    if (translation && translation.translations[language]) {
      return translation.translations[language];
    }

    // Fallback to English
    if (language !== 'en' && translation && translation.translations.en) {
      return translation.translations.en;
    }

    // Return key if no translation found
    return key;
  }
}

// Route Handlers
 
// eslint-disable-next-line max-lines-per-function
export async function multiLanguageRoutes(_server: FastifyInstance): Promise<void> {
  const languageService = new MultiLanguageService();

  // Language management routes
  _server.get('/languages', async (request: FastifyRequest<{
    Querystring: { enabled?: boolean }
  }>, reply: FastifyReply) => {
    try {
      const { enabled  } = ((request as any).query as unknown);
      const languages = await languageService.getAllLanguages(enabled);
      
      return (reply as any).send({
        _success: true, data: languages,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve languages',
        _error: error.message,
      });
    }
  });

  _server.post('/languages', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const languageData = (request as any).body;
      const language = await languageService.createLanguage(languageData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: language,
        _message: 'Language created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create language',
        _error: error.message,
      });
    }
  });

  _server.put('/languages/:code', async (request: FastifyRequest<{
    Params: { code: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { code  } = ((request as any).params as unknown);
      const updateData = (request as any).body;
      
      const language = await languageService.updateLanguage(code, updateData);
      
      return (reply as any).send({
        _success: true, data: language,
        _message: 'Language updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Language not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update language',
        _error: error.message,
      });
    }
  });

  _server.delete('/languages/:code', async (request: FastifyRequest<{
    Params: { code: string }
  }>, reply: FastifyReply) => {
    try {
      const { code  } = ((request as any).params as unknown);
      await languageService.deleteLanguage(code);
      
      return (reply as any).send({
        _success: true,
        _message: 'Language deleted successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Language not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to delete language',
        _error: error.message,
      });
    }
  });

  // Translation management routes
  _server.get('/translations', async (request: FastifyRequest<{
    Querystring: { namespace?: string; language?: string; search?: string }
  }>, reply: FastifyReply) => {
    try {
      const filters = (request as any).query;
      const translations = await languageService.getAllTranslations(filters);
      
      return (reply as any).send({
        _success: true, data: translations,
        _count: translations.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve translations',
        _error: error.message,
      });
    }
  });

  _server.get('/translations/:language', async (request: FastifyRequest<{
    Params: { language: string }
    Querystring: { namespace?: string }
  }>, reply: FastifyReply) => {
    try {
      const { language  } = ((request as any).params as unknown);
      const { namespace  } = ((request as any).query as unknown);
      
      const translations = await languageService.getTranslationsByLanguage(language, namespace);
      
      return (reply as any).send({
        _success: true, data: translations,
        language,
        _namespace: namespace || 'all',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve translations',
        _error: error.message,
      });
    }
  });

  _server.post('/translations', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const translationData = (request as any).body;
      const translation = await languageService.createTranslation(translationData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: translation,
        _message: 'Translation created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create translation',
        _error: error.message,
      });
    }
  });

  _server.put('/translations/:id', async (request: FastifyRequest<{
    Params: { id: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { id  } = ((request as any).params as unknown);
      const updateData = (request as any).body;
      
      const translation = await languageService.updateTranslation(id, updateData);
      
      return (reply as any).send({
        _success: true, data: translation,
        _message: 'Translation updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Translation not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update translation',
        _error: error.message,
      });
    }
  });

  // Translation import/export routes
  _server.post('/translations/import', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const importData = (request as any).body;
      const result = await languageService.importTranslations(importData);
      
      return (reply as any).send({
        _success: true, data: result,
        _message: `Imported ${result.imported} translations`,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to import translations',
        _error: error.message,
      });
    }
  });

  _server.get('/translations/:language/export', async (request: FastifyRequest<{
    Params: { language: string }
    Querystring: { namespace?: string; format?: string }
  }>, reply: FastifyReply) => {
    try {
      const { language  } = ((request as any).params as unknown);
      const { namespace, format = 'json' } = (request as any).query;
      
      const exportData = await languageService.exportTranslations(language, namespace, format);
      
      if (format === 'csv') {
        (reply as any).header('Content-Type', 'text/csv');
        (reply as any).header('Content-Disposition', `attachment; filename="translations-${language}.csv"`);
        return (reply as any).send(exportData);
      }
      
      return (reply as any).send({
        _success: true, data: exportData,
        language,
        _namespace: namespace || 'all',
        format,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to export translations',
        _error: error.message,
      });
    }
  });

  // Utility routes
  _server.get('/namespaces', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const namespaces = await languageService.getNamespaces();
      
      return (reply as any).send({
        _success: true, data: namespaces,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve namespaces',
        _error: error.message,
      });
    }
  });

  _server.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await languageService.getTranslationStats();
      
      return (reply as any).send({
        _success: true, data: stats,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve translation stats',
        _error: error.message,
      });
    }
  });

  // Translate API
  _server.post('/translate', async (request: FastifyRequest<{
    Body: { key: string; language: string; namespace?: string }
  }>, reply: FastifyReply) => {
    try {
      const { key, language, namespace  } = ((request as any).body as unknown);
      const translation = await languageService.translate(key, language, namespace);
      
      return (reply as any).send({
        _success: true, data: {
          key,
          language,
          namespace,
          translation,
        },
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Translation failed',
        _error: error.message,
      });
    }
  });
}

export default multiLanguageRoutes;