import { StorageService } from "../../../../core/abstractions"
import { StorageServiceOptions } from "../../../../core/abstractions/storage.service"

export class SecureStorageService implements StorageService {
  private store = new Map<string, any>();

  get<T>(key: string, options?: StorageServiceOptions): Promise<T> {
    const targetKey = this.getTargetKey(key, options)
    if (this.store.has(targetKey)) {
      const obj = this.store.get(targetKey);
      return Promise.resolve(obj as T);
    }
    return Promise.resolve(null);
  }

  save(key: string, obj: any, options?: StorageServiceOptions): Promise<any> {
    const targetKey = this.getTargetKey(key, options)
    if (obj == null) {
      return this.remove(key, options);
    }
    this.store.set(targetKey, obj);
    return Promise.resolve();
  }

  remove(key: string, options?: StorageServiceOptions): Promise<any> {
    const targetKey = this.getTargetKey(key, options)
    this.store.delete(targetKey);
    return Promise.resolve();
  }

  has(key: string, options?: StorageServiceOptions): Promise<boolean> {
    const targetKey = this.getTargetKey(key, options)
    return Promise.resolve(this.store.has(targetKey));
  }

  getTargetKey(key: string, options?: StorageServiceOptions) {
    if (options) {
      return `${key}__${options.keySuffix}`
    }
    return key
  }
}
