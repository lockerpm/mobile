// Queue: to use, call QueueManager.getInstance().getSyncQueue() or any queue you want

import PQueue from 'p-queue/dist'


export default class QueueManager {
  static myInstance = null

  _syncQueue: PQueue = null

  static getInstance(): QueueManager {
    if (QueueManager.myInstance == null) {
      QueueManager.myInstance = new QueueManager()
    }

    return this.myInstance
  }

  constructor() {
    this._syncQueue = new PQueue({ concurrency: 1 })
  }

  getSyncQueue() {
    return this._syncQueue
  }
}
