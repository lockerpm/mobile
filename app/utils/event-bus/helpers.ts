import { AppEventType, EventBus } from "."
import { TEMP_PREFIX } from "../../config/constants"

export const detectTempId = (ids: string[]) => {
  if (ids) {
    for (const id of ids) {
      if (id.startsWith(TEMP_PREFIX)) {
        EventBus.emit(AppEventType.TEMP_ID_DECTECTED, null)
        return true
      }
    }
  }
  return false
}
