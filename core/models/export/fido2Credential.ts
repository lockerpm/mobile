import { Fido2Credential as Fido2CredentialDomain } from "../domain/fido2Credential"
import { EncString } from "../domain/encString"
import { Fido2CredentialView } from "../view/fido2CredentialView"

export class Fido2Credential {
  static template(): Fido2Credential {
    const req = new Fido2Credential()
    req.credentialId = "keyId"
    req.keyType = "keyType"
    req.keyAlgorithm = "keyAlgorithm"
    req.keyCurve = "keyCurve"
    req.keyValue = "keyValue"
    req.rpId = "rpId"
    req.userHandle = "userHandle"
    req.userName = "userName"
    req.counter = "counter"
    req.rpName = "rpName"
    req.userDisplayName = "userDisplayName"
    req.discoverable = "false"
    req.creationDate = null
    return req
  }

  static toView(req: Fido2Credential, view = new Fido2CredentialView()) {
    view.credentialId = req.credentialId
    view.keyType = req.keyType
    view.keyAlgorithm = req.keyAlgorithm
    view.keyCurve = req.keyCurve
    view.keyValue = req.keyValue
    view.rpId = req.rpId
    view.userHandle = req.userHandle
    view.userName = req.userName
    view.counter = parseInt(req.counter)
    view.rpName = req.rpName
    view.userDisplayName = req.userDisplayName
    view.discoverable = req.discoverable === "true"
    view.creationDate = new Date(req.creationDate)
    return view
  }

  static toDomain(req: Fido2Credential, domain = new Fido2CredentialDomain()) {
    domain.credentialId = req.credentialId != null ? new EncString(req.credentialId) : null
    domain.keyType = req.keyType != null ? new EncString(req.keyType) : null
    domain.keyAlgorithm = req.keyAlgorithm != null ? new EncString(req.keyAlgorithm) : null
    domain.keyCurve = req.keyCurve != null ? new EncString(req.keyCurve) : null
    domain.keyValue = req.keyValue != null ? new EncString(req.keyValue) : null
    domain.rpId = req.rpId != null ? new EncString(req.rpId) : null
    domain.userHandle = req.userHandle != null ? new EncString(req.userHandle) : null
    domain.userName = req.userName != null ? new EncString(req.userName) : null
    domain.counter = req.counter != null ? new EncString(req.counter) : null
    domain.rpName = req.rpName != null ? new EncString(req.rpName) : null
    domain.userDisplayName = req.userDisplayName != null ? new EncString(req.userDisplayName) : null
    domain.discoverable = req.discoverable != null ? new EncString(req.discoverable) : null
    domain.creationDate = req.creationDate
    return domain
  }

  credentialId: string
  keyType: string
  keyAlgorithm: string
  keyCurve: string
  keyValue: string
  rpId: string
  userHandle: string
  userName: string
  counter: string
  rpName: string
  userDisplayName: string
  discoverable: string
  creationDate: Date

  constructor(o?: Fido2CredentialView | Fido2CredentialDomain) {
    if (o == null) {
      return
    }

    this.credentialId = safeGetString(o.credentialId)
    this.keyType = safeGetString(o.keyType)
    this.keyAlgorithm = safeGetString(o.keyAlgorithm)
    this.keyCurve = safeGetString(o.keyCurve)
    this.keyValue = safeGetString(o.keyValue)
    this.rpId = safeGetString(o.rpId)
    this.userHandle = safeGetString(o.userHandle)
    this.userName = safeGetString(o.userName)
    this.counter = safeGetString(String(o.counter))
    this.rpName = safeGetString(o.rpName)
    this.userDisplayName = safeGetString(o.userDisplayName)
    this.discoverable = safeGetString(String(o.discoverable))
    this.creationDate = o.creationDate
  }
}

function safeGetString(value: string | EncString) {
  if (value == null) {
    return null
  }

  if (typeof value == "string") {
    return value
  }
  return value?.encryptedString
}
