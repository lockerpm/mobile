export class DurationTest {
  name: string
  start: number
  lastTick: number

  constructor(name: string) {
    this.name = name
    this.start = Date.now()
    this.lastTick = this.start
  }

  tick(action: string) {
    console.log(`${this.name}: ${action} took ${Date.now() - this.lastTick}ms`)
    this.lastTick = Date.now()
  }

  final() {
    console.log(`${this.name} took total ${Date.now() - this.start}ms`)
  }
}