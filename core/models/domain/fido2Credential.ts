import { Fido2CredentialData } from "../data/fido2CredentialData"
import { Fido2CredentialView } from "../view/fido2CredentialView"
import Domain from "./domainBase"
import { EncString } from "./encString"
import { SymmetricCryptoKey } from "./symmetricCryptoKey"

export class Fido2Credential extends Domain {
  credentialId: EncString | null = null
  keyType: EncString
  keyAlgorithm: EncString
  keyCurve: EncString
  keyValue: EncString
  rpId: EncString
  userHandle: EncString
  userName: EncString
  counter: EncString
  rpName: EncString
  userDisplayName: EncString
  discoverable: EncString
  creationDate: Date | null

  constructor(obj?: Fido2CredentialData, alreadyEncrypted: boolean = false) {
    super()
    if (obj == null) {
      return
    }

    this.creationDate = obj.creationDate != null ? new Date(obj.creationDate) : null
    this.buildDomainModel(
      this,
      obj,
      {
        credentialId: null,
        keyType: null,
        keyAlgorithm: null,
        keyCurve: null,
        keyValue: null,
        rpId: null,
        userHandle: null,
        userName: null,
        counter: null,
        rpName: null,
        userDisplayName: null,
        discoverable: null,
      },
      alreadyEncrypted,
      []
    )
  }

  decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<Fido2CredentialView> {
    const cred = new Fido2CredentialView()
    cred.creationDate = this.creationDate
    return this.decryptObj(
      cred,
      {
        credentialId: null,
        keyType: null,
        keyAlgorithm: null,
        keyCurve: null,
        keyValue: null,
        rpId: null,
        userHandle: null,
        userName: null,
        counter: null,
        rpName: null,
        userDisplayName: null,
        discoverable: null,
      },
      orgId,
      encKey
    )
  }

  toFido2CredentialData(): Fido2CredentialData {
    const i = new Fido2CredentialData()
    i.creationDate = this.creationDate?.toISOString() || ""
    this.buildDataModel(
      this,
      i,
      {
        credentialId: null,
        keyType: null,
        keyAlgorithm: null,
        keyCurve: null,
        keyValue: null,
        rpId: null,
        userHandle: null,
        userName: null,
        counter: null,
        rpName: null,
        userDisplayName: null,
        discoverable: null,
      },
      ["creationDate"]
    )
    return i
  }
}
