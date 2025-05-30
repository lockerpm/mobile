import { Linking } from "react-native"
import { Logger } from "./utils"

const TERMS_URL = "https://locker.io/terms/"
const PRIVACY_POLICY_URL = "https://locker.io/privacy"
const HELP_CENTER_URL = "https://support.locker.io/"
const MANAGE_PLAN_URL = "https://locker.io/upgrade/"
const REPORT_VULN = "https://whitehub.net/programs/locker/"
const REGISTER_BUSINESS_URL =
  "https://id.locker.io/register/locker-enterprise-trial?next=register&SERVICE_SCOPE=pwdmanager"

const goUrl = (url: string) => {
  Linking.canOpenURL(url)
    .then((val) => {
      if (val) Linking.openURL(url)
    })
    .catch((e) => Logger.error(e))
}

export const openTerms = () => goUrl(TERMS_URL)
export const openPrivacyPolicy = () => goUrl(PRIVACY_POLICY_URL)
export const openHelpCenter = () => goUrl(HELP_CENTER_URL)
export const openManagePlan = () => goUrl(MANAGE_PLAN_URL)
export const openReportVuln = () => goUrl(REPORT_VULN)
export const openRegisterBusiness = () => goUrl(REGISTER_BUSINESS_URL)
