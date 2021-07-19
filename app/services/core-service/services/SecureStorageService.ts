import { StorageService } from "../../../../core/abstractions"

export class SecureStorageService implements StorageService {
  private store = new Map<string, any>();

  get<T>(key: string): Promise<T> {
    if (this.store.has(key)) {
      const obj = this.store.get(key);
      return Promise.resolve(obj as T);
    }
    return Promise.resolve(null);
  }

  save(key: string, obj: any): Promise<any> {
    if (obj == null) {
      return this.remove(key);
    }
    this.store.set(key, obj);
    return Promise.resolve();
  }

  remove(key: string): Promise<any> {
    this.store.delete(key);
    return Promise.resolve();
  }

  has(key: string): Promise<boolean> {
    return Promise.resolve(this.store.has(key));
  }
}
