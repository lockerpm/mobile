import { CryptoService } from "../../abstractions/crypto.service"


import { Utils } from "../../misc/utils"

import { SendData } from "../data/sendData"

import { SendView } from "../view/sendView"
import { Cipher } from "./cipher"

import Domain from "./domainBase"
import { EncString } from "./encString"

export class Send extends Domain {
  id: string
  accessId: string
  creationDate: Date
  revisionDate: Date
  key: EncString
  password: string
  maxAccessCount?: number
  accessCount: number
  eachEmailAccessCount?: number
  expirationDate: Date
  disabled: boolean
  requireOtp: boolean
  cipherId: string
  cipher: Cipher
  emails: { access_count: number; creation_date: number; email: string; max_access_count: number }[]

  obj: SendData

  constructor(obj?: SendData, alreadyEncrypted: boolean = false) {
    super()
    if (obj == null) {
      return
    }

    this.obj = obj

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        userId: null,
        accessId: null,
        key: null,
        cipherId: null,
      },
      alreadyEncrypted,
      ["id", "userId", "accessId", "cipherId"],
    )

    // @ts-ignore
    this.creationDate = obj.creationDate != null ? new Date(obj.creationDate) : null
    // @ts-ignore
    this.revisionDate = obj.revisionDate != null ? new Date(obj.revisionDate) : null
    this.password = obj.password
    this.maxAccessCount = obj.maxAccessCount
    this.accessCount = obj.accessCount
    this.eachEmailAccessCount = obj.eachEmailAccessCount
    // @ts-ignore
    this.expirationDate = obj.expirationDate != null ? new Date(obj.expirationDate) : null
    this.disabled = obj.disabled
    this.requireOtp = obj.requireOtp
    this.emails = obj.emails
  }

  async decrypt(): Promise<SendView> {
    const model = new SendView(this)

    let cryptoService: CryptoService
    const containerService = (Utils.global as any).bitwardenContainerService
    if (containerService) {
      cryptoService = containerService.getCryptoService()
    } else {
      throw new Error('global bitwardenContainerService not initialized.')
    }

    try {
      model.key = await cryptoService.decryptToBytes(this.key)
      model.cryptoKey = await cryptoService.makeSendKey(model.key)
    } catch (e) {
      // TODO: error?
    }

    const cipher = new Cipher(this.obj.cipher)
    const cipherView = await cipher.decrypt(model.cryptoKey)
    model.cipher = cipherView

    return model
  }
}
