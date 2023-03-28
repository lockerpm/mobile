import { BaseResponse } from "./baseResponse"

import { CipherResponse } from "./cipherResponse"

export class SendResponse extends BaseResponse {
  id: string
  accessId: string
  creationDate: number
  revisionDate: number
  key: string
  password: string
  maxAccessCount?: number
  accessCount: number
  eachEmailAccessCount: number
  expirationDate: string
  disabled: boolean
  requireOtp: boolean
  cipherId: string
  cipher: CipherResponse
  emails: string[]

  constructor(response: any) {
    super(response)
    this.id = this.getResponseProperty("Id")
    this.accessId = this.getResponseProperty("AccessId")
    this.creationDate = this.getResponseProperty("CreationDate")
    this.revisionDate = this.getResponseProperty("RevisionDate")
    this.key = this.getResponseProperty("Key")
    this.maxAccessCount = this.getResponseProperty("MaxAccessCount")
    this.accessCount = this.getResponseProperty("AccessCount")
    this.eachEmailAccessCount = this.getResponseProperty("EachEmailAccessCount")
    this.expirationDate = this.getResponseProperty("ExpirationDate")
    this.requireOtp = this.getResponseProperty("RequireOtp") || false
    this.password = this.getResponseProperty("Password")
    this.disabled = this.getResponseProperty("Disabled") || false
    this.cipherId = this.getResponseProperty("CipherId")
    this.cipher = new CipherResponse(this.getResponseProperty("Cipher"))
    this.emails = this.getResponseProperty("Emails")
  }
}
