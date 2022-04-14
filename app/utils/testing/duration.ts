import { Logger } from "../logger"

export class DurationTest {
  name: string
  start: number
  lastTick: number

  constructor(name: string) {
    this.name = name
    this.start = Date.now()
    this.lastTick = this.start
  }

  tick(action: any) {
    Logger.debug(`${this.name}: ${action} took ${Date.now() - this.lastTick}ms`)
    this.lastTick = Date.now()
  }

  final() {
    Logger.debug(`${this.name} took total ${Date.now() - this.start}ms`)
  }
}