import { Utils } from "../../misc/utils"

import { Send } from "../domain/send"
import { SymmetricCryptoKey } from "../domain/symmetricCryptoKey"
import { CipherView } from "./cipherView"

import { View } from "./view"

export class SendView implements View {
  id: string
  accessId: string
  revisionDate: Date
  creationDate: Date
  key: ArrayBuffer
  cryptoKey: SymmetricCryptoKey
  password: string
  maxAccessCount?: number
  accessCount = 0
  eachEmailAccessCount?: number
  expirationDate: Date
  disabled = false
  requireOtp = false
  cipherId: string
  cipher: CipherView
  emails: string[]

  constructor(s?: Send) {
    if (!s) {
      return
    }

    this.id = s.id
    this.accessId = s.accessId
    this.revisionDate = s.revisionDate
    this.creationDate = s.creationDate

    this.password = s.password
    this.maxAccessCount = s.maxAccessCount
    this.accessCount = s.accessCount
    this.eachEmailAccessCount = s.eachEmailAccessCount
    this.expirationDate = s.expirationDate
    this.disabled = s.disabled
    this.requireOtp = s.requireOtp
    this.cipherId = s.cipherId
    this.cipher = new CipherView(s.cipher)
    this.emails = s.emails
  }

  get urlB64Key(): string {
    return Utils.fromBufferToUrlB64(this.key)
  }

  get maxAccessCountReached(): boolean {
    if (this.maxAccessCount == null) {
      return false
    }
    return this.accessCount >= this.maxAccessCount
  }

  get expired(): boolean {
    if (this.expirationDate == null) {
      return false
    }
    return this.expirationDate <= new Date()
  }
}
