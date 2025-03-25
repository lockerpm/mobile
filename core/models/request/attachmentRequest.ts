import { Attachment } from "../domain"

export class AttachmentRequest {
  id: string
  url: string
  fileName: string
  key: string
  size: string

  constructor(obj: Attachment) {
    this.id = obj.id
    this.size = obj.size
    this.url = obj.url ? obj.url.encryptedString : null
    this.fileName = obj.fileName ? obj.fileName.encryptedString : null
    this.key = obj.key ? obj.key.encryptedString : null
  }
}
