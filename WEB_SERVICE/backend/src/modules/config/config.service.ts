import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { getDb } from '../../database/drizzle';
import { setting, type Setting, type NewSetting } from '../../database/schema';
import { eq } from 'drizzle-orm';

type UpdateConfigDto = {
  key: string;
  value: unknown;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string | null;
};

@Injectable()
export class ConfigService {
  private get db() {
    return getDb();
  }

  /**
   * Obtiene todas las configuraciones
   */
  async findAll(): Promise<Setting[]> {
    return this.db.select().from(setting);
  }

  /**
   * Obtiene una configuración por su clave
   */
  async findByKey(key: string): Promise<Setting | null> {
    const results = await this.db
      .select()
      .from(setting)
      .where(eq(setting.settingKey, key))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Obtiene el valor de una configuración (parseado según su tipo)
   */
  async getValue<T = string>(
    key: string,
    defaultValue?: T,
  ): Promise<T | undefined> {
    const config = await this.findByKey(key);
    if (!config) {
      return defaultValue;
    }

    const { settingValue, settingType } = config;

    if (settingValue === null || settingValue === undefined) {
      return defaultValue;
    }

    const settingValueString = String(settingValue);

    switch (settingType) {
      case 'number':
        return parseFloat(settingValueString) as T;
      case 'boolean':
        return (settingValueString.toLowerCase() === 'true') as T;
      case 'json':
        try {
          return JSON.parse(settingValueString) as T;
        } catch {
          return defaultValue;
        }
      case 'string':
      default:
        return settingValueString as T;
    }
  }

  /**
   * Crea o actualiza una configuración
   */
  async upsert(data: UpdateConfigDto): Promise<Setting> {
    const { key, value, type, description } = data;

    const existing = await this.findByKey(key);

    const settingValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    const settingType = type || this.inferType(value);

    const newSetting: NewSetting = {
      settingKey: key,
      settingValue,
      settingType,
      description: description || null,
    };

    if (existing) {
      await this.db
        .update(setting)
        .set({
          settingValue,
          settingType,
          description: description || existing.description,
        })
        .where(eq(setting.settingKey, key));

      const updated = await this.findByKey(key);
      return updated!;
    }

    await this.db.insert(setting).values(newSetting);
    const created = await this.findByKey(key);
    if (!created) {
      throw new BadRequestException('Error al crear la configuración');
    }
    return created;
  }

  /**
   * Elimina una configuración
   */
  async deleteByKey(key: string): Promise<boolean> {
    const existing = await this.findByKey(key);
    if (!existing) {
      throw new NotFoundException(
        `Configuración con clave "${key}" no encontrada`,
      );
    }

    await this.db.delete(setting).where(eq(setting.settingKey, key));
    return true;
  }

  /**
   * Inferir el tipo de un valor
   */
  private inferType(value: any): string {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  }
}
