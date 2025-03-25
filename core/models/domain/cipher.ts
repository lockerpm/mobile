import { CipherRepromptType } from "../../enums/cipherRepromptType"
import { CipherType } from "../../enums/cipherType"

import { CipherData } from "../data/cipherData"

import { CipherView } from "../view/cipherView"

import { Attachment } from "./attachment"
import { Card } from "./card"
import Domain from "./domainBase"
import { EncString } from "./encString"
import { Field } from "./field"
import { Identity } from "./identity"
import { Login } from "./login"
import { Password } from "./password"
import { SecureNote } from "./secureNote"
import { SymmetricCryptoKey } from "./symmetricCryptoKey"

export class Cipher extends Domain {
  id: string
  organizationId: string
  folderId: string
  name: EncString
  notes: EncString
  type: CipherType
  favorite: boolean
  organizationUseTotp: boolean
  edit: boolean
  viewPassword: boolean
  revisionDate: Date
  localData: any
  login: Login
  identity: Identity
  card: Card
  secureNote: SecureNote
  attachments: Attachment[]
  fields: Field[]
  passwordHistory: Password[]
  collectionIds: string[]
  deletedDate: Date
  reprompt: CipherRepromptType

  constructor(obj?: CipherData, alreadyEncrypted = false, localData: any = null) {
    super()
    if (obj == null) {
      return
    }

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        userId: null,
        organizationId: null,
        folderId: null,
        name: null,
        notes: null,
      },
      alreadyEncrypted,
      ["id", "userId", "organizationId", "folderId"],
    )

    this.type = obj.type
    this.favorite = obj.favorite
    this.organizationUseTotp = obj.organizationUseTotp
    this.edit = obj.edit
    if (obj.viewPassword != null) {
      this.viewPassword = obj.viewPassword
    } else {
      this.viewPassword = true // Default for already synced Ciphers without viewPassword
    }
    this.revisionDate = obj.revisionDate != null ? new Date(obj.revisionDate) : null
    this.collectionIds = obj.collectionIds
    this.localData = localData
    this.deletedDate = obj.deletedDate != null ? new Date(obj.deletedDate) : null
    this.reprompt = obj.reprompt

    switch (this.type) {
      case CipherType.MasterPassword:
      case CipherType.Login:
        this.login = new Login(obj.login, alreadyEncrypted)
        break
      case CipherType.SecureNote:
      case CipherType.TOTP:
      case CipherType.CryptoWallet:
        this.secureNote = new SecureNote(obj.secureNote, alreadyEncrypted)
        break
      case CipherType.Card:
        this.card = new Card(obj.card, alreadyEncrypted)
        break
      case CipherType.Identity:
        this.identity = new Identity(obj.identity, alreadyEncrypted)
        break
      default:
        break
    }

    if (obj.attachments != null) {
      this.attachments = obj.attachments.map((a) => new Attachment(a, alreadyEncrypted))
    } else {
      this.attachments = null
    }

    if (obj.fields != null) {
      this.fields = obj.fields.map((f) => new Field(f, alreadyEncrypted))
    } else {
      this.fields = null
    }

    if (obj.passwordHistory != null) {
      this.passwordHistory = obj.passwordHistory.map((ph) => new Password(ph, alreadyEncrypted))
    } else {
      this.passwordHistory = null
    }
  }

  async log(a: string) {
    if (this.id === "9934826b-1905-4492-bdc7-d1b723d1f920") console.log("decrypt", a)
  }

  async decrypt(encKey?: SymmetricCryptoKey): Promise<CipherView> {
    this.log("1")
    const model = new CipherView(this)
    this.log("11")
    try {
      await this.decryptObj(
        model,
        {
          name: null,
          notes: null,
        },
        this.organizationId,
        encKey,
      )
      this.log("2")
      switch (this.type) {
        case CipherType.MasterPassword:
        case CipherType.Login:
          model.login = await this.login.decrypt(this.organizationId, encKey)
          break
        case CipherType.SecureNote:
        case CipherType.TOTP:
        case CipherType.CryptoWallet:
          model.secureNote = await this.secureNote.decrypt(this.organizationId, encKey)
          break
        case CipherType.Card:
          model.card = await this.card.decrypt(this.organizationId, encKey)
          break
        case CipherType.Identity:
          model.identity = await this.identity.decrypt(this.organizationId, encKey)
          break
        default:
          break
      }
      this.log("3")
      const orgId = this.organizationId

      if (this.attachments != null && this.attachments.length > 0) {
        console.log("decrypt attachment", this.id)
        const attachmentsPromises = this.attachments.map((attachment) =>
          attachment.decrypt(orgId, encKey),
        )
        const attachments = await Promise.all(attachmentsPromises)
        model.attachments = attachments
      }
      this.log("4")
      if (this.fields != null && this.fields.length > 0) {
        const fieldsPromises = this.fields.map((field) => field.decrypt(orgId, encKey))
        const fields = await Promise.all(fieldsPromises)
        model.fields = fields
      }
      this.log("5")
      if (this.passwordHistory != null && this.passwordHistory.length > 0) {
        const passwordHistoryPromises = this.passwordHistory.map((ph) => ph.decrypt(orgId, encKey))
        const passwordHistory = await Promise.all(passwordHistoryPromises)
        model.passwordHistory = passwordHistory
      }
      this.log("6")
    } catch (e) {
      console.error("error decrypting cipher", e)
    }
    return model
  }

  toCipherData(userId: string): CipherData {
    const c = new CipherData()
    c.id = this.id
    c.organizationId = this.organizationId
    c.folderId = this.folderId
    c.userId = this.organizationId != null ? userId : null
    c.edit = this.edit
    c.viewPassword = this.viewPassword
    c.organizationUseTotp = this.organizationUseTotp
    c.favorite = this.favorite
    c.revisionDate = this.revisionDate != null ? this.revisionDate.toISOString() : null
    c.type = this.type
    c.collectionIds = this.collectionIds
    c.deletedDate = this.deletedDate != null ? this.deletedDate.toISOString() : null
    c.reprompt = this.reprompt

    this.buildDataModel(this, c, {
      name: null,
      notes: null,
    })

    switch (c.type) {
      case CipherType.MasterPassword:
      case CipherType.Login:
        c.login = this.login.toLoginData()
        break
      case CipherType.SecureNote:
      case CipherType.TOTP:
      case CipherType.CryptoWallet:
        c.secureNote = this.secureNote.toSecureNoteData()
        break
      case CipherType.Card:
        c.card = this.card.toCardData()
        break
      case CipherType.Identity:
        c.identity = this.identity.toIdentityData()
        break
      default:
        break
    }

    if (this.fields != null) {
      c.fields = this.fields.map((f) => f.toFieldData())
    }
    if (this.attachments != null) {
      c.attachments = this.attachments.map((a) => a.toAttachmentData())
    }
    if (this.passwordHistory != null) {
      c.passwordHistory = this.passwordHistory.map((ph) => ph.toPasswordHistoryData())
    }
    return c
  }
}
