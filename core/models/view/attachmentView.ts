import { View } from "./view"
import { Attachment } from "../domain/attachment"

export class AttachmentView implements View {
  id: string = null
  url: string = null
  size: number = null
  fileName: string = null
  key: string = null

  constructor(a?: Attachment) {
    if (!a) {
      return
    }

    this.id = a.id
    this.size = a.size
  }

  get fileSize(): number {
    try {
      if (this.size != null) {
        return this.size
      }
    } catch {}
    return 0
  }
}
