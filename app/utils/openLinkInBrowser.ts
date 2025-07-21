import { Linking } from "react-native"

const TERMS_URL = "https://locker.io/terms/"
const PRIVACY_POLICY_URL = "https://locker.io/privacy"
const HELP_CENTER_URL = "https://support.locker.io/"
const MANAGE_PLAN_URL = "https://locker.io/upgrade/"
const REPORT_VULN = "https://whitehub.net/programs/locker/"
const REGISTER_BUSINESS_URL =
  "https://id.locker.io/register/locker-enterprise-trial?next=register&SERVICE_SCOPE=pwdmanager"
const DELETE_ACCOUNT_URL = "https://locker.io/settings/account"

const LANGUAGE_SUPPORT_URL =
  "https://cystack.notion.site/Locker-Translation-Guide-bb4e4fc4c23d4bbc994375035b124829"

/**
 * Helper for opening a give URL in an external browser.
 */
function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url))
}

export const openTerms = () => openLinkInBrowser(TERMS_URL)
export const openPrivacyPolicy = () => openLinkInBrowser(PRIVACY_POLICY_URL)
export const openHelpCenter = () => openLinkInBrowser(HELP_CENTER_URL)
export const openManagePlan = () => openLinkInBrowser(MANAGE_PLAN_URL)
export const openReportVuln = () => openLinkInBrowser(REPORT_VULN)
export const openRegisterBusiness = () => openLinkInBrowser(REGISTER_BUSINESS_URL)

export const openDeleteAccount = () => openLinkInBrowser(DELETE_ACCOUNT_URL)

export const openLanguageSupport = () => openLinkInBrowser(LANGUAGE_SUPPORT_URL)
