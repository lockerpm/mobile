export abstract class StorageService {
  get: <T>(key: string, options?: StorageServiceOptions) => T
  has: (key: string, options?: StorageServiceOptions) => boolean
  save: (key: string, obj: any, options?: StorageServiceOptions) => any
  remove: (key: string, options?: StorageServiceOptions) => any
}

export interface StorageServiceOptions {
  keySuffix: KeySuffixOptions
}

export type KeySuffixOptions = "auto" | "biometric"
