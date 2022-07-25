import PQueue from 'p-queue/dist'

export const SyncQueue = new PQueue({ concurrency: 1 })
export const DecryptQueue = new PQueue({ concurrency: 100 })
export const PasswordHealthQueue = new PQueue({ concurrency: 1 })
