/* eslint-disable camelcase */
import { AttachmentView } from "core/models/view"
import { CipherRepromptType } from "../../enums/cipherRepromptType"
import { CipherType } from "../../enums/cipherType"
import { FieldType } from "../../enums/fieldType"
import { SecureNoteType } from "../../enums/secureNoteType"
import { ImportResult } from "../../models/domain/importResult"
import { CardView } from "../../models/view/cardView"
import { CipherView } from "../../models/view/cipherView"
import { IdentityView } from "../../models/view/identityView"
import { LoginView } from "../../models/view/loginView"
import { PasswordHistoryView } from "../../models/view/passwordHistoryView"
import { SecureNoteView } from "../../models/view/secureNoteView"
import { BaseImporter } from "../baseImporter"
import { Importer } from "../importer"

import {
  CategoryEnum,
  Details,
  ExportData,
  FieldsEntity,
  Item,
  LoginFieldTypeEnum,
  Overview,
  PasswordHistoryEntity,
  SectionsEntity,
  UrlsEntity,
  Value,
  VaultsEntity,
} from "./types/onepassword1PuxImporterTypes"

export class OnePassword1PuxImporter extends BaseImporter implements Importer {
  result = new ImportResult()

  parse(data: string): Promise<ImportResult> {
    const exportData: ExportData = JSON.parse(data)

    if (!exportData.accounts) {
      return Promise.resolve(this.result)
    }

    // TODO Add handling of multiple vaults
    // const personalVaults = account.vaults[0].filter((v) => v.attrs.type === VaultAttributeTypeEnum.Personal);
    const account = exportData.accounts[0]

    if (!account?.vaults) {
      return Promise.resolve(this.result)
    }

    account.vaults.forEach((vault: VaultsEntity) => {
      if (!vault.items) {
        return
      }

      vault.items.forEach((item: Item) => {
        if (item.trashed === true) {
          return
        }

        const cipher = this.initLoginCipher()

        const category = item.categoryUuid as CategoryEnum
        switch (category) {
          case CategoryEnum.Login:
          case CategoryEnum.Database:
          case CategoryEnum.Password:
          case CategoryEnum.WirelessRouter:
          case CategoryEnum.Server:
          case CategoryEnum.API_Credential:
            cipher.type = CipherType.Login
            cipher.login = new LoginView()
            break
          case CategoryEnum.CreditCard:
          case CategoryEnum.BankAccount:
            cipher.type = CipherType.Card
            cipher.card = new CardView()
            break
          case CategoryEnum.SecureNote:
          case CategoryEnum.SoftwareLicense:
          case CategoryEnum.EmailAccount:
          case CategoryEnum.MedicalRecord:
            // case CategoryEnum.Document:
            cipher.type = CipherType.SecureNote
            cipher.secureNote = new SecureNoteView()
            cipher.secureNote.type = SecureNoteType.Generic
            break
          case CategoryEnum.Identity:
          case CategoryEnum.DriversLicense:
          case CategoryEnum.OutdoorLicense:
          case CategoryEnum.Membership:
          case CategoryEnum.Passport:
          case CategoryEnum.RewardsProgram:
          case CategoryEnum.SocialSecurityNumber:
            cipher.type = CipherType.Identity
            cipher.identity = new IdentityView()
            break
          default:
            break
        }

        cipher.favorite = item.favIndex === 1

        this.processOverview(item.overview, cipher)

        this.processLoginFields(item, cipher)

        this.processDetails(category, item.details, cipher)

        if (item.details.passwordHistory) {
          this.parsePasswordHistory(
            item.details.passwordHistory.filter((i) => !!i),
            cipher
          )
        }

        if (item.details.sections) {
          this.processSections(
            category,
            item.details.sections.filter((i) => !!i),
            cipher
          )
        }

        if (!this.isNullOrWhitespace(item.details.notesPlain || "")) {
          if (cipher.notes) {
            cipher.notes += "\n"
          }
          cipher.notes += item.details.notesPlain?.split(this.newLineRegex).join("\n") + "\n"
        }

        const createTotpCipher = (name: string, issuer: string, totp: string) => {
          const totpCipher = new CipherView()
          totpCipher.name = name
          totpCipher.type = CipherType.TOTP
          totpCipher.secureNote = new SecureNoteView()
          totpCipher.secureNote.type = SecureNoteType.Generic
          totpCipher.notes = `otpauth://totp/${encodeURIComponent(
            issuer
          )}?secret=${totp}&issuer=${encodeURIComponent(issuer)}&algorithm=sha1&digits=6&period=30`
          return totpCipher
        }

        // Add new TOTP cipher if it exists in login
        if (cipher.login.totp) {
          this.result.ciphers.push(createTotpCipher(cipher.name, cipher.name, cipher.login.totp))
        }

        // Add new TOTP cipher if it exists in custom fields
        cipher.fields
          .filter((f) => f.type === FieldType.TOTP)
          .forEach((f, index) => {
            this.result.ciphers.push(
              createTotpCipher(`${cipher.name} - TOTP ${index + 2}`, cipher.name, f.value)
            )
          })

        this.convertToNoteIfNeeded(cipher)
        this.cleanupCipher(cipher)

        // Convert attachments to the new format
        if (cipher.attachments && cipher.attachments.length > 0) {
          // TODO: temporary remove all attachments
          // Later we can add them back, and uncomment the code below
          cipher.attachments = []

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // cipher.attachments = cipher.attachments.map(attachment => ({
          //   id: attachment.id,
          //   fileName: attachment.fileName,
          //   size: parseInt(attachment.size),
          //   url: '<redacted>',
          //   key: '<redacted>'
          // }))
        }

        this.processFolder(this.result, vault.attrs.name)

        this.result.ciphers.push(cipher)
      })
    })

    if (this.organization) {
      this.moveFoldersToCollections(this.result)
    }

    this.result.success = true
    return Promise.resolve(this.result)
  }

  // Process item.overview
  private processOverview(overview: Overview, cipher: CipherView) {
    if (overview == null) {
      return
    }

    cipher.name = this.getValueOrDefault(overview.title)

    if (overview.urls != null) {
      const urls: string[] = []
      overview.urls.forEach((url: UrlsEntity) => {
        if (!this.isNullOrWhitespace(url.url)) {
          urls.push(url.url)
        }
      })
      cipher.login.uris = this.makeUriArray(urls)
    }

    if (overview.tags != null && overview.tags.length > 0) {
      this.processKvp(cipher, "Tags", overview.tags.join(", "), FieldType.Text)
    }
  }

  // Process item.details old fields
  private processDetails(category: CategoryEnum, details: Details, cipher: CipherView) {
    if (category !== CategoryEnum.Password) {
      return
    }
    if (!details) {
      return
    }
    if (details.notesPlain) {
      cipher.notes = details.notesPlain
    }
    if (details.password) {
      cipher.login.password = details.password
    }
    if (details.documentAttributes) {
      const { fileName, documentId, decryptedSize } = details.documentAttributes
      const attachment = new AttachmentView()
      attachment.id = documentId
      attachment.fileName = fileName
      attachment.size = decryptedSize.toString()
      if (!cipher.attachments) {
        cipher.attachments = []
      }
      cipher.attachments.push(attachment)
    }
  }

  // Process item.details.loginFields
  private processLoginFields(item: Item, cipher: CipherView) {
    if (item.details == null) {
      return
    }

    if (item.details.loginFields == null || item.details.loginFields.length === 0) {
      return
    }

    item.details.loginFields.forEach((loginField) => {
      if (!loginField) {
        return
      }

      if (loginField.designation === "username" && loginField.value !== "") {
        cipher.type = CipherType.Login
        cipher.login.username = loginField.value
        return
      }

      if (loginField.designation === "password" && loginField.value !== "") {
        cipher.type = CipherType.Login
        cipher.login.password = loginField.value
        return
      }

      let fieldValue = loginField.value
      let fieldType: FieldType = FieldType.Text
      switch (loginField.fieldType) {
        case LoginFieldTypeEnum.Password:
          fieldType = FieldType.Hidden
          break
        case LoginFieldTypeEnum.CheckBox:
          fieldValue = loginField.value !== "" ? "true" : "false"
          fieldType = FieldType.Text
          break
        default:
          break
      }
      this.processKvp(cipher, loginField.name, fieldValue, fieldType)
    })
  }

  // Process item.details.sections
  private processSections(category: CategoryEnum, sections: SectionsEntity[], cipher: CipherView) {
    if (sections == null || sections.length === 0) {
      return
    }

    sections.forEach((section: SectionsEntity) => {
      if (section.fields == null) {
        return
      }

      // If all fields have empty title and does not include any file
      // then it's a custom note with multiple lines
      if (section.fields.every((f: FieldsEntity) => !f.title && !f.value?.file)) {
        const content = section.fields
          .map((f: FieldsEntity) => {
            return Object.values(f.value)[0] || ""
          })
          .filter((i) => !!i)
          .join("\n")
        if (content) {
          this.processKvp(cipher, section.title, content, FieldType.Text)
        }
        return
      }

      // Process normally
      this.parseSectionFields(category, section.fields, cipher)
    })
  }

  // Process item.details.sections.fields
  private parseSectionFields(category: CategoryEnum, fields: FieldsEntity[], cipher: CipherView) {
    fields.forEach((field: FieldsEntity) => {
      const valueKey = Object.keys(field.value)[0]
      const anyField = field as any

      if (!anyField.value?.[valueKey]) {
        return
      }

      const fieldName = this.getFieldName(field.id, field.title)
      const fieldValue = this.extractValue(field.value, valueKey)

      // Fill in the cipher based on the field type
      if (cipher.type === CipherType.Login) {
        if (this.fillLogin(field, fieldValue, cipher)) {
          return
        }

        switch (category) {
          case CategoryEnum.Login:
          case CategoryEnum.Database:
          case CategoryEnum.EmailAccount:
          case CategoryEnum.WirelessRouter:
            break

          case CategoryEnum.Server:
            if (this.isNullOrWhitespace(cipher.login.uri) && field.id === "url") {
              cipher.login.uris = this.makeUriArray(fieldValue)
              return
            }
            break

          case CategoryEnum.API_Credential:
            if (this.fillApiCredentials(field, fieldValue, cipher)) {
              return
            }
            break
          default:
            break
        }
      } else if (cipher.type === CipherType.Card) {
        if (this.fillCreditCard(field, fieldValue, cipher)) {
          return
        }

        if (category === CategoryEnum.BankAccount) {
          if (this.fillBankAccount(field, fieldValue, cipher)) {
            return
          }
        }
      } else if (cipher.type === CipherType.Identity) {
        if (this.fillIdentity(field, fieldValue, cipher, valueKey)) {
          return
        }
        if (valueKey === "address" && field.value.address) {
          // fieldValue is an object casted into a string, so access the plain value instead
          const { street, city, country, zip, state } = field.value.address
          cipher.identity.address1 = this.getValueOrDefault(street)
          cipher.identity.city = this.getValueOrDefault(city)
          if (!this.isNullOrWhitespace(country)) {
            cipher.identity.country = country.toUpperCase()
          }
          cipher.identity.postalCode = this.getValueOrDefault(zip)
          cipher.identity.state = this.getValueOrDefault(state)
          return
        }

        switch (category) {
          case CategoryEnum.Identity:
            break
          case CategoryEnum.DriversLicense:
            if (this.fillDriversLicense(field, fieldValue, cipher)) {
              return
            }
            break
          case CategoryEnum.OutdoorLicense:
            if (this.fillOutdoorLicense(field, fieldValue, cipher)) {
              return
            }
            break
          case CategoryEnum.Membership:
            if (this.fillMembership(field, fieldValue, cipher)) {
              return
            }
            break
          case CategoryEnum.Passport:
            if (this.fillPassport(field, fieldValue, cipher)) {
              return
            }
            break
          case CategoryEnum.RewardsProgram:
            if (this.fillRewardsProgram(field, fieldValue, cipher)) {
              return
            }
            break
          case CategoryEnum.SocialSecurityNumber:
            if (this.fillSSN(field, fieldValue, cipher)) {
              return
            }
            break
          default:
            break
        }
      }

      if (valueKey === "email" && field.value.email) {
        // fieldValue is an object casted into a string, so access the plain value instead
        const { email_address, provider } = field.value.email
        this.processKvp(cipher, fieldName, email_address, FieldType.Text)
        this.processKvp(cipher, "provider", provider, FieldType.Text)
        return
      }

      // Do not include a password field if it's already in the history
      if (
        field.title === "password" &&
        cipher.passwordHistory != null &&
        cipher.passwordHistory.some((h) => h.password === fieldValue)
      ) {
        return
      }

      // TODO ?? If one of the fields is marked as guarded, then activate Password-Reprompt for the entire item
      if (field.guarded && cipher.reprompt === CipherRepromptType.None) {
        cipher.reprompt = CipherRepromptType.Password
      }

      // Handle file attachments
      if (valueKey === "file" && field.value.file) {
        const { fileName, documentId, decryptedSize } = field.value.file
        const attachment = new AttachmentView()
        attachment.id = documentId
        attachment.fileName = fileName
        attachment.size = decryptedSize.toString()
        if (!cipher.attachments) {
          cipher.attachments = []
        }
        cipher.attachments.push(attachment)
        return
      }

      const fieldType = valueKey === "concealed" ? FieldType.Hidden : FieldType.Text
      this.processKvp(cipher, fieldName, fieldValue, fieldType)
    })
  }

  // ------------------------ FILL METHODS ------------------------

  private fillLogin(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    const fieldName = this.getFieldName(field.id, field.title)

    if (this.isNullOrWhitespace(cipher.login.username) && fieldName === "username") {
      cipher.login.username = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.login.password) && fieldName === "password") {
      cipher.login.password = fieldValue
      return true
    }

    if (field.id != null && field.id?.startsWith("TOTP_")) {
      if (this.isNullOrWhitespace(cipher.login.totp)) {
        cipher.login.totp = fieldValue
      } else {
        this.processKvp(cipher, fieldName, fieldValue, FieldType.TOTP)
      }
      return true
    }

    return false
  }

  private fillApiCredentials(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    const fieldName = this.getFieldName(field.id, field.title)

    if (this.isNullOrWhitespace(cipher.login.password) && fieldName === "credential") {
      cipher.login.password = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.login.uri) && fieldName === "hostname") {
      cipher.login.uris = this.makeUriArray(fieldValue)
      return true
    }

    return false
  }

  private fillCreditCard(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.card.number) && field.id === "ccnum") {
      cipher.card.number = fieldValue
      cipher.card.brand = this.getCardBrand(fieldValue)!
      return true
    }

    if (this.isNullOrWhitespace(cipher.card.code) && field.id === "cvv") {
      cipher.card.code = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.card.cardholderName) && field.id === "cardholder") {
      cipher.card.cardholderName = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.card.expiration) && field.id === "expiry") {
      const monthYear: string = fieldValue.toString().trim()
      cipher.card.expMonth = monthYear.substring(4, 6)
      if (cipher.card.expMonth[0] === "0") {
        cipher.card.expMonth = cipher.card.expMonth.substring(1, 2)
      }
      cipher.card.expYear = monthYear.substring(0, 4)
      return true
    }

    if (field.id === "type") {
      // Skip since brand was determined from number above
      return true
    }

    return false
  }

  private fillBankAccount(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.card.cardholderName) && field.id === "owner") {
      cipher.card.cardholderName = fieldValue
      return true
    }

    return false
  }

  private fillIdentity(
    field: FieldsEntity,
    fieldValue: string,
    cipher: CipherView,
    valueKey: string
  ): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "firstname") {
      cipher.identity.firstName = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.lastName) && field.id === "lastname") {
      cipher.identity.lastName = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.middleName) && field.id === "initial") {
      cipher.identity.middleName = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.phone) && field.id === "defphone") {
      cipher.identity.phone = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.company) && field.id === "company") {
      cipher.identity.company = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.email)) {
      if (valueKey === "email" && field.value.email) {
        const { email_address, provider } = field.value.email
        cipher.identity.email = this.getValueOrDefault(email_address)
        this.processKvp(cipher, "provider", provider, FieldType.Text)
        return true
      }

      if (field.id === "email") {
        cipher.identity.email = fieldValue
        return true
      }
    }

    if (this.isNullOrWhitespace(cipher.identity.username) && field.id === "username") {
      cipher.identity.username = fieldValue
      return true
    }
    return false
  }

  private fillDriversLicense(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "fullname") {
      this.processFullName(cipher, fieldValue)
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.address1) && field.id === "address") {
      cipher.identity.address1 = fieldValue
      return true
    }

    // TODO ISO code
    if (this.isNullOrWhitespace(cipher.identity.country) && field.id === "country") {
      cipher.identity.country = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.state) && field.id === "state") {
      cipher.identity.state = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.licenseNumber) && field.id === "number") {
      cipher.identity.licenseNumber = fieldValue
      return true
    }

    return false
  }

  private fillOutdoorLicense(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "name") {
      this.processFullName(cipher, fieldValue)
      return true
    }

    // TODO ISO code
    if (this.isNullOrWhitespace(cipher.identity.country) && field.id === "country") {
      cipher.identity.country = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.state) && field.id === "state") {
      cipher.identity.state = fieldValue
      return true
    }

    return false
  }

  private fillMembership(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "member_name") {
      this.processFullName(cipher, fieldValue)
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.company) && field.id === "org_name") {
      cipher.identity.company = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.phone) && field.id === "phone") {
      cipher.identity.phone = fieldValue
      return true
    }

    return false
  }

  private fillPassport(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "fullname") {
      this.processFullName(cipher, fieldValue)
      return true
    }

    // TODO Iso
    if (this.isNullOrWhitespace(cipher.identity.country) && field.id === "issuing_country") {
      cipher.identity.country = fieldValue
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.passportNumber) && field.id === "number") {
      cipher.identity.passportNumber = fieldValue
      return true
    }

    return false
  }

  private fillRewardsProgram(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "member_name") {
      this.processFullName(cipher, fieldValue)
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.company) && field.id === "company_name") {
      cipher.identity.company = fieldValue
      return true
    }

    return false
  }

  private fillSSN(field: FieldsEntity, fieldValue: string, cipher: CipherView): boolean {
    if (this.isNullOrWhitespace(cipher.identity.firstName) && field.id === "name") {
      this.processFullName(cipher, fieldValue)
      return true
    }

    if (this.isNullOrWhitespace(cipher.identity.ssn) && field.id === "number") {
      cipher.identity.ssn = fieldValue
      return true
    }

    return false
  }

  // ------------------------ SUPPORTING METHODS ------------------------

  private capitalize(inputString: string): string {
    return inputString.trim().replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
  }

  private getFieldName(id: string, title: string): string {
    if (this.isNullOrWhitespace(title)) {
      return id
    }

    // Naive approach of checking if the fields id is usable
    // eslint-disable-next-line prefer-regex-literals
    if (id.length > 25 && RegExp(/^[a-z0-9]+$/, "i").test(id)) {
      return title
    }
    return id
  }

  private extractValue(value: Value, valueKey: string): string {
    try {
      if (valueKey === "date" && value.date != null) {
        return new Date(value.date * 1000).toUTCString()
      }

      if (valueKey === "monthYear" && value.monthYear != null) {
        return value.monthYear.toString()
      }

      let res = (value as any)[valueKey]
      if (typeof res === "object") {
        res = Object.values(res)
          .map((i: any) => {
            if (typeof i === "object") {
              return Object.values(i).join(", ")
            }
            return i
          })
          .join(", ")
      }

      return res
    } catch (error) {
      return JSON.stringify((value as any)[valueKey])
    }
  }

  private parsePasswordHistory(historyItems: PasswordHistoryEntity[], cipher: CipherView) {
    if (historyItems == null || historyItems.length === 0) {
      return
    }

    const maxSize = historyItems.length > 5 ? 5 : historyItems.length
    cipher.passwordHistory = historyItems
      .filter((h: any) => !this.isNullOrWhitespace(h.value) && h.time != null)
      .sort((a, b) => b.time - a.time)
      .slice(0, maxSize)
      .map((h: any) => {
        const ph = new PasswordHistoryView()
        ph.password = h.value
        ph.lastUsedDate = new Date(("" + h.time).length >= 13 ? h.time : h.time * 1000)
        return ph
      })
  }
}
