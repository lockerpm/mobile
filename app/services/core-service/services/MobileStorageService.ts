import { StorageService } from "../../../../core/abstractions"
import { StorageServiceOptions } from "../../../../core/abstractions/storage.service"
import { load, has, remove, save } from "../../../utils/storage"

export class MobileStorageService implements StorageService {
  get<T>(key: string, options: StorageServiceOptions | undefined): Promise<T> {
    return load(key)
  }

  has(key: string, options: StorageServiceOptions | undefined): Promise<boolean> {
    return has(key)
  }

  remove(key: string, options: StorageServiceOptions | undefined): Promise<any> {
    return remove(key)
  }

  save(key: string, obj: any, options: StorageServiceOptions | undefined): Promise<any> {
    return save(key, obj)
  }
}
