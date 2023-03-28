import { Send } from "../domain/send"
import { CipherRequest } from "./cipherRequest"

export class SendRequest {
  key: string | null
  password: string
  max_access_count: number | null
  each_email_access_count: number | null
  expiration_date: number | null
  require_otp: boolean
  cipher_id: string
  cipher: CipherRequest
  emails: string[]

  constructor(send: Send) {
    this.key = send?.key?.encryptedString || null
    this.password = send.password
    this.max_access_count = send.maxAccessCount || null
    this.each_email_access_count = send.eachEmailAccessCount || null
    this.expiration_date = send.expirationDate ? send.expirationDate.getTime() / 1000 : null
    this.require_otp = send.requireOtp
    this.cipher_id = send.cipherId
    this.cipher = new CipherRequest(send.cipher)
    this.emails = send.emails
  }
}
