import { StorageService } from "../../../../core/abstractions"
import { StorageServiceOptions } from "../../../../core/abstractions/storage.service"
import { load, has, remove, save } from "../../../utils/storage"

export class MobileStorageService implements StorageService {
  get<T>(key: string, options: StorageServiceOptions | undefined): Promise<T> {
    const targetKey = this.getTargetKey(key, options)
    return load(targetKey)
  }

  has(key: string, options: StorageServiceOptions | undefined): Promise<boolean> {
    const targetKey = this.getTargetKey(key, options)
    return has(targetKey)
  }

  remove(key: string, options: StorageServiceOptions | undefined): Promise<any> {
    const targetKey = this.getTargetKey(key, options)
    return remove(targetKey)
  }

  save(key: string, obj: any, options: StorageServiceOptions | undefined): Promise<any> {
    const targetKey = this.getTargetKey(key, options)
    return save(targetKey, obj)
  }

  getTargetKey(key: string, options: StorageServiceOptions | undefined) {
    if (options) {
      return `${key}__${options.keySuffix}`
    }
    return key
  }
}
