
import { SendResponse } from '../response/sendResponse';
import { CipherData } from './cipherData';

export class SendData {
    id: string
    accessId: string
    revisionDate: number
    creationDate: number
    key: string
    password: string
    maxAccessCount?: number
    accessCount: number
    eachEmailAccessCount: number
    expirationDate: string
    disabled: boolean
    requireOtp: boolean
    cipherId: string
    cipher: CipherData
    userId: string
    emails: string[]
  
    constructor (response?: SendResponse, userId?: string) {
      if (response == null) {
        return
      }
  
      this.id = response.id
      this.accessId = response.accessId
      this.revisionDate = response.revisionDate
      this.creationDate = response.creationDate
      this.key = response.key
      this.password = response.password
      this.maxAccessCount = response.maxAccessCount
      this.accessCount = response.accessCount
      this.eachEmailAccessCount = response.eachEmailAccessCount
      this.expirationDate = response.expirationDate
      this.disabled = response.disabled
      this.requireOtp = response.requireOtp
      this.cipherId = response.cipherId
      this.cipher = new CipherData(response.cipher, userId)
      this.emails = response.emails
  
      // @ts-ignore
      this.userId = userId
    }
}
