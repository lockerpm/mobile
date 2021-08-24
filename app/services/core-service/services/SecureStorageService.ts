import { StorageService } from "../../../../core/abstractions"
import { StorageServiceOptions } from "../../../../core/abstractions/storage.service"
import { hasSecure, loadSecure, removeSecure, saveSecure } from "../../../utils/storage"

export class SecureStorageService implements StorageService {
  get<T>(key: string, options?: StorageServiceOptions): Promise<T> {
    const targetKey = this.getTargetKey(key, options)
    return loadSecure(targetKey)
  }

  has(key: string, options?: StorageServiceOptions): Promise<boolean> {
    const targetKey = this.getTargetKey(key, options)
    return hasSecure(targetKey)
  }

  remove(key: string, options?: StorageServiceOptions): Promise<any> {
    const targetKey = this.getTargetKey(key, options)
    return removeSecure(targetKey)
  }

  save(key: string, obj: any, options?: StorageServiceOptions): Promise<any> {
    const targetKey = this.getTargetKey(key, options)
    return saveSecure(targetKey, obj)
  }

  getTargetKey(key: string, options?: StorageServiceOptions) {
    if (options) {
      return `${key}__${options.keySuffix}`
    }
    return key
  }
}
