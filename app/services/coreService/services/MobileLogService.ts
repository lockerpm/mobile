import { LogService as LogServiceAbstraction } from "../../../../core/abstractions"
import { LogLevelType } from "../../../../core/enums"

export class MobileLogService implements LogServiceAbstraction {
  protected timersMap: Map<string, [number, number]> = new Map();

  debug(message: string) {
    if (!__DEV__) {
      return;
    }
    this.write(LogLevelType.Debug, message);
  }

  info(message: string) {
    this.write(LogLevelType.Info, message);
  }

  warning(message: string) {
    this.write(LogLevelType.Warning, message);
  }

  error(message: string) {
    this.write(LogLevelType.Error, message);
  }

  time(label = 'default') {
    if (!this.timersMap.has(label)) {
      this.timersMap.set(label, global.nativePerformanceNow());
    }
  }

  timeEnd(label: string): [number, number] {
    const elapsed = this.timersMap.get(label);
    elapsed[1] = global.nativePerformanceNow() - elapsed[1]
    this.timersMap.delete(label);
    this.write(LogLevelType.Info, `${label}: ${elapsed[0] * 1000 + elapsed[1] / 10e6}ms`);
    return elapsed;
  }

  write(level: LogLevelType, message: string): void {
    console.log(`${level}: ${message}`)
  }
}
