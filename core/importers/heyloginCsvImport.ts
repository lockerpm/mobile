import { FieldType } from "../enums/fieldType"
import { ImportResult } from "../models/domain/importResult"
import { CipherType } from "../enums"
import { CardView } from "../models/view"
import { BaseImporter } from "./baseImporter"
import { Importer } from "./importer"

export class HeyLoginCsvImporter extends BaseImporter implements Importer {
  parse(data: string): Promise<ImportResult> {
    const result = new ImportResult()
    const results = this.parseCsv(data, true)
    if (results == null) {
      result.success = false
      return Promise.resolve(result)
    }

    // CS
    const existingKeys = [
      // Ignore
      "id",
      "type",

      // Basic
      "note",
      "displayName",
      "customFields",

      // Password
      "url",
      "username",
      "password",
      "totp",
      "totpUrl",
      "wifiSsid",

      // Card
      "creditCardNumber",
      "creditCardHolder",
      "creditCardExpiration",
      "creditCardSecurityCode",
      "creditCardPin",
    ]

    results.forEach((value) => {
      const cipher = this.initLoginCipher()

      // Basic info
      cipher.name = this.getValueOrDefault(
        value.displayName || this.nameFromUrl(value.url) || value.username || "",
        "--"
      )
      cipher.notes = this.getValueOrDefault(value.note)

      switch (value.type) {
        case "login": {
          cipher.login.username = this.getValueOrDefault(value.username)
          cipher.login.password = this.getValueOrDefault(value.password)
          cipher.login.totp = this.getValueOrDefault(value.totpUrl || value.totp)
          cipher.login.uris = this.makeUriArray(value.url)
          break
        }
        case "wifi": {
          cipher.login.password = this.getValueOrDefault(value.password)
          this.processKvp(cipher, "SSID", value.wifiSsid, FieldType.Text)
          break
        }
        case "creditCard": {
          cipher.card = new CardView()
          cipher.type = CipherType.Card
          cipher.card.cardholderName = this.getValueOrDefault(value.creditCardHolder)
          cipher.card.number = this.getValueOrDefault(value.creditCardNumber)
          if (value.creditCardExpiration) {
            const parts = value.creditCardExpiration.split("/")
            if (parts.length === 2) {
              cipher.card.expMonth = this.getValueOrDefault(parts[0])
              cipher.card.expYear = this.getValueOrDefault(parts[1])
            }
          }
          cipher.card.code = this.getValueOrDefault(value.creditCardSecurityCode)
          this.processKvp(cipher, "PIN", value.creditCardPin, FieldType.Hidden)
          break
        }
      }

      // Custom fields
      try {
        const customFields = JSON.parse(value.customFields)
        customFields.forEach((f) => {
          this.processKvp(cipher, f.name, f.value, f.protected ? FieldType.Hidden : FieldType.Text)
        })
      } catch (e) {
        //
      }

      // Other fields
      Object.keys(value)
        .filter((k) => !existingKeys.includes(k))
        .forEach((k) => {
          this.processKvp(cipher, k, value[k])
        })

      this.cleanupCipher(cipher)
      result.ciphers.push(cipher)
    })

    result.success = true
    return Promise.resolve(result)
  }
}
