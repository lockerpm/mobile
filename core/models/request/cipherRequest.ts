import { CipherRepromptType } from "../../enums/cipherRepromptType"
import { CipherType } from "../../enums/cipherType"

import { Cipher } from "../domain/cipher"

import { CardApi } from "../api/cardApi"
import { FieldApi } from "../api/fieldApi"
import { IdentityApi } from "../api/identityApi"
import { LoginApi } from "../api/loginApi"
import { LoginUriApi } from "../api/loginUriApi"
import { Fido2CredentialApi } from "../api/fido2CredentialApi"
import { SecureNoteApi } from "../api/secureNoteApi"

import { AttachmentRequest } from "./attachmentRequest"
import { PasswordHistoryRequest } from "./passwordHistoryRequest"

export class CipherRequest {
  type: CipherType
  folderId: string
  organizationId: string
  name: string
  notes: string
  favorite: boolean
  login: LoginApi
  secureNote: SecureNoteApi
  card: CardApi
  identity: IdentityApi
  fields: FieldApi[]
  passwordHistory: PasswordHistoryRequest[]
  attachments: AttachmentRequest[]
  lastKnownRevisionDate: Date
  reprompt: CipherRepromptType

  constructor(cipher: Cipher) {
    this.type = cipher.type
    this.folderId = cipher.folderId
    this.organizationId = cipher.organizationId
    this.name = cipher.name ? cipher.name.encryptedString : null
    this.notes = cipher.notes ? cipher.notes.encryptedString : null
    this.favorite = cipher.favorite
    this.lastKnownRevisionDate = cipher.revisionDate
    this.reprompt = cipher.reprompt

    switch (this.type) {
      case CipherType.MasterPassword:
      case CipherType.Login:
        this.login = new LoginApi()
        this.login.uris = null
        this.login.username = cipher.login.username ? cipher.login.username.encryptedString : null
        this.login.password = cipher.login.password ? cipher.login.password.encryptedString : null
        this.login.passwordRevisionDate =
          cipher.login.passwordRevisionDate != null
            ? cipher.login.passwordRevisionDate.toISOString()
            : null
        this.login.totp = cipher.login.totp ? cipher.login.totp.encryptedString : null
        this.login.autofillOnPageLoad = cipher.login.autofillOnPageLoad

        if (cipher.login.uris != null) {
          this.login.uris = cipher.login.uris.map((u) => {
            const uri = new LoginUriApi()
            uri.uri = u.uri != null ? u.uri.encryptedString : null
            uri.match = u.match != null ? u.match : null
            return uri
          })
        }

        if (cipher.login.fido2Credentials != null) {
          this.login.fido2Credentials = cipher.login.fido2Credentials.map((c) => {
            const cred = new Fido2CredentialApi()
            cred.credentialId = c.credentialId != null ? c.credentialId.encryptedString : null
            cred.keyType = c.keyType != null ? c.keyType.encryptedString : null
            cred.keyAlgorithm = c.keyAlgorithm != null ? c.keyAlgorithm.encryptedString : null
            cred.keyCurve = c.keyCurve != null ? c.keyCurve.encryptedString : null
            cred.keyValue = c.keyValue != null ? c.keyValue.encryptedString : null
            cred.rpId = c.rpId != null ? c.rpId.encryptedString : null
            cred.userHandle = c.userHandle != null ? c.userHandle.encryptedString : null
            cred.userName = c.userName != null ? c.userName.encryptedString : null
            cred.counter = c.counter != null ? c.counter.encryptedString : null
            cred.rpName = c.rpName != null ? c.rpName.encryptedString : null
            cred.userDisplayName =
              c.userDisplayName != null ? c.userDisplayName.encryptedString : null
            cred.discoverable = c.discoverable != null ? c.discoverable.encryptedString : null
            cred.creationDate = c.creationDate != null ? c.creationDate.toISOString() : null
            return cred
          })
        }
        break
      case CipherType.SecureNote:
      case CipherType.TOTP:
      case CipherType.CryptoWallet:
        this.secureNote = new SecureNoteApi()
        this.secureNote.type = cipher.secureNote.type
        break
      case CipherType.Card:
        this.card = new CardApi()
        this.card.cardholderName =
          cipher.card.cardholderName != null ? cipher.card.cardholderName.encryptedString : null
        this.card.brand = cipher.card.brand != null ? cipher.card.brand.encryptedString : null
        this.card.number = cipher.card.number != null ? cipher.card.number.encryptedString : null
        this.card.expMonth =
          cipher.card.expMonth != null ? cipher.card.expMonth.encryptedString : null
        this.card.expYear = cipher.card.expYear != null ? cipher.card.expYear.encryptedString : null
        this.card.code = cipher.card.code != null ? cipher.card.code.encryptedString : null
        break
      case CipherType.Identity:
        this.identity = new IdentityApi()
        this.identity.title =
          cipher.identity.title != null ? cipher.identity.title.encryptedString : null
        this.identity.firstName =
          cipher.identity.firstName != null ? cipher.identity.firstName.encryptedString : null
        this.identity.middleName =
          cipher.identity.middleName != null ? cipher.identity.middleName.encryptedString : null
        this.identity.lastName =
          cipher.identity.lastName != null ? cipher.identity.lastName.encryptedString : null
        this.identity.address1 =
          cipher.identity.address1 != null ? cipher.identity.address1.encryptedString : null
        this.identity.address2 =
          cipher.identity.address2 != null ? cipher.identity.address2.encryptedString : null
        this.identity.address3 =
          cipher.identity.address3 != null ? cipher.identity.address3.encryptedString : null
        this.identity.city =
          cipher.identity.city != null ? cipher.identity.city.encryptedString : null
        this.identity.state =
          cipher.identity.state != null ? cipher.identity.state.encryptedString : null
        this.identity.postalCode =
          cipher.identity.postalCode != null ? cipher.identity.postalCode.encryptedString : null
        this.identity.country =
          cipher.identity.country != null ? cipher.identity.country.encryptedString : null
        this.identity.company =
          cipher.identity.company != null ? cipher.identity.company.encryptedString : null
        this.identity.email =
          cipher.identity.email != null ? cipher.identity.email.encryptedString : null
        this.identity.phone =
          cipher.identity.phone != null ? cipher.identity.phone.encryptedString : null
        this.identity.ssn = cipher.identity.ssn != null ? cipher.identity.ssn.encryptedString : null
        this.identity.username =
          cipher.identity.username != null ? cipher.identity.username.encryptedString : null
        this.identity.passportNumber =
          cipher.identity.passportNumber != null
            ? cipher.identity.passportNumber.encryptedString
            : null
        this.identity.licenseNumber =
          cipher.identity.licenseNumber != null
            ? cipher.identity.licenseNumber.encryptedString
            : null
        break
      default:
        break
    }

    if (cipher.fields != null) {
      this.fields = cipher.fields.map((f) => {
        const field = new FieldApi()
        field.type = f.type
        field.name = f.name ? f.name.encryptedString : null
        field.value = f.value ? f.value.encryptedString : null
        return field
      })
    }

    if (cipher.passwordHistory != null) {
      this.passwordHistory = []
      cipher.passwordHistory.forEach((ph) => {
        this.passwordHistory.push({
          lastUsedDate: ph.lastUsedDate,
          password: ph.password ? ph.password.encryptedString : null,
        })
      })
    }

    if (cipher.attachments != null) {
      this.attachments = []
      cipher.attachments.forEach((attachment) => {
        const attachmentRequest = new AttachmentRequest(attachment)
        this.attachments.push(attachmentRequest)
      })
    }
  }
}
