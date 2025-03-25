import { AttachmentData } from "../data/attachmentData"

import { AttachmentView } from "../view/attachmentView"

import Domain from "./domainBase"
import { EncString } from "./encString"
import { SymmetricCryptoKey } from "./symmetricCryptoKey"

export class Attachment extends Domain {
  id: string
  size: number
  key: EncString
  url: EncString
  fileName: EncString

  constructor(obj?: AttachmentData, alreadyEncrypted = false) {
    super()
    if (obj == null) {
      return
    }

    this.size = obj.size
    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        url: null,
        fileName: null,
        key: null,
      },
      alreadyEncrypted,
      ["id"],
    )
  }

  async decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<AttachmentView> {
    const view = await this.decryptObj(
      new AttachmentView(this),
      {
        fileName: null,
        url: null,
        key: null,
      },
      orgId,
      encKey,
    )
    return view
  }

  toAttachmentData(): AttachmentData {
    const a = new AttachmentData()
    a.size = this.size
    this.buildDataModel(
      this,
      a,
      {
        id: null,
        url: null,
        fileName: null,
        key: null,
      },
      ["id"],
    )
    return a
  }
}
