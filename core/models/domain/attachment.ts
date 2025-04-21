import { AttachmentData } from "../data/attachmentData"
import { AttachmentView } from "../view/attachmentView"
import Domain from "./domainBase"
import { EncString } from "./encString"
import { SymmetricCryptoKey } from "./symmetricCryptoKey"
export class Attachment extends Domain {
  id: string
  size: string
  url: EncString
  key: EncString
  fileName: EncString
  constructor(obj?: AttachmentData, alreadyEncrypted = false) {
    super()
    if (obj == null) {
      return
    }
    this.size = obj.size
    this.id = obj.id
    this.buildDomainModel(
      this,
      obj,
      {
        url: null,
        fileName: null,
        key: null,
      },
      alreadyEncrypted,
    )
  }

  async decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<AttachmentView> {
    const view = await this.decryptObj(
      new AttachmentView(this),
      {
        key: null,
        fileName: null,
        url: null,
      },
      orgId,
      encKey,
    )
    return view
  }

  toAttachmentData(): AttachmentData {
    const a = new AttachmentData()
    a.size = this.size
    a.id = this.id
    this.buildDataModel(this, a, {
      url: null,
      fileName: null,
      key: null,
    })
    return a
  }
}
