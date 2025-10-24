import analytics from "@react-native-firebase/analytics"
import DeviceInfo from "react-native-device-info"

export enum AnalyticEvents {
  REGISTER_SUCCESS = "register_success",
  CREATE_MASTER_PW = "create_master_pw",
  ENTER_MASTER_PW = "enter_master_pw",
  COPY_OTP = "copy_otp",
  ADD_OTP = "add_otp",
  CREATE_PRIVATE_EMAIL = "create_private_email",
  BLOCK_PRIVATE_EMAIL = "block_private_email",
  CREATE_ITEMS = "create_items",
  SHARE_ITENS = "share_items",
  GENERATE_PASSWORD = "generate_password",
  PASSWORD_HEALTH = "password_health",
  DATA_BREACH_SCANNER = "data_breach_scanner",
  SCAM_REPORT = "scam_report",
  SCAM_LOOKUP = "scam_lookup",
  SCAM_DELETE_REPORT = "scam_delete_report",
  SCAM_ENABLE_CALLERID = "scam_enable_callerid",
}

export const logRegisterSuccessEvent = async () => {
  if (__DEV__) {
    return
  }

  const device_identifier = await DeviceInfo.getUniqueId()
  await analytics().logEvent(AnalyticEvents.REGISTER_SUCCESS, {
    device_identifier,
  })
}

// Create master pw
export const logCreateMasterPwEvent = async () => {
  if (__DEV__) {
    return
  }

  const device_identifier = await DeviceInfo.getUniqueId()
  await analytics().logEvent(AnalyticEvents.CREATE_MASTER_PW, {
    device_identifier,
  })
}

export const trackScreenView = (screenName: string) => {
  if (__DEV__) {
    return
  }

  analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  })
}

export const logFirebaseEvent = async (event: AnalyticEvents, email: string | null) => {
  if (__DEV__) {
    return
  }
  const device_identifier = await DeviceInfo.getUniqueId()
  await analytics().logEvent(event, {
    device_identifier,
    email,
  })
}
