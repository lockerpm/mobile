import { EventRegister } from 'react-native-event-listeners'
// import { Logger } from '../logger'


export enum AppEventType {
  PASSWORD_UPDATE = 'PASSWORD_UPDATE',
  TEMP_ID_DECTECTED = 'TEMP_ID_DECTECTED',
  NEW_BATCH_DECRYPTED = 'NEW_BATCH_DECRYPTED',
  DECRYPT_ALL_STATUS = 'DECRYPT_ALL_STATUS',
  CLOSE_ALL_MODALS = 'CLOSE_ALL_MODALS'
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
