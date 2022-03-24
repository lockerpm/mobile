import { EventRegister } from 'react-native-event-listeners'
// import { Logger } from '../logger'


export enum AppEventType {
  PASSWORD_UPDATE = 'PASSWORD_UPDATE',
}


export class EventBus {
  static createListener(event: AppEventType, handler: (data: any) => void) {
    return EventRegister.addEventListener(event, handler)
  }

  static removeListener(listener: any) {
    EventRegister.removeEventListener(listener)
  }

  static emit(event: AppEventType, data: any) {
    EventRegister.emit(event, data)
    // Logger.debug(`EVENT BUS EMIT: ${event} --- ${JSON.stringify(data)}`)
  }
}
