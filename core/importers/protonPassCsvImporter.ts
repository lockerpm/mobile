import { ImportResult } from "core/models/domain/importResult"
import { CipherType, SecureNoteType } from "../enums"
import { CipherView, IdentityView, LoginView, SecureNoteView } from "../models/view"
import { BaseImporter } from "./baseImporter"
import { Importer } from "./importer"

export class ProtonPassCsvImporter extends BaseImporter implements Importer {
  parse(data: string): Promise<ImportResult> {
    const result = new ImportResult()
    const results = this.parseCsv(data, true)
    if (results == null) {
      result.success = false
      return Promise.resolve(result)
    }

    const existingKeys = [
      "type",
      "name",
      "url",
      "email",
      "username",
      "password",
      "note",
      "totp",

      // Ignore
      "createTime",
      "modifyTime",
    ]

    results.forEach((value) => {
      const cipher = new CipherView()
      cipher.type = CipherType.SecureNote
      cipher.notes = this.getValueOrDefault(value.note)
      cipher.name = this.getValueOrDefault(value.name, "--")

      const type = this.getValueOrDefault(value.type)

      switch (type) {
        case "login": {
          cipher.type = CipherType.Login
          cipher.login = new LoginView()

          cipher.login.password = this.getValueOrDefault(value.password)
          if (value.url) {
            cipher.login.uris = this.makeUriArray(value.url.split(",").map((u) => u.trim()))
          }
          cipher.login.totp = this.getValueOrDefault(value.totp)

          const username = this.getValueOrDefault(value.username)
          const email = this.getValueOrDefault(value.email)
          if (username) {
            cipher.login.username = username
            if (email) {
              this.processKvp(cipher, "email", email)
            }
          } else {
            cipher.login.username = email
          }
          break
        }

        case "note": {
          cipher.secureNote = new SecureNoteView()
          cipher.secureNote.type = SecureNoteType.Generic
          break
        }

        case "identity": {
          cipher.type = CipherType.Identity
          cipher.identity = new IdentityView()
          try {
            const parsedData = JSON.parse(cipher.notes)
            Object.keys(parsedData).forEach((key) => {
              switch (key) {
                case "note": {
                  cipher.notes = parsedData.note
                  break
                }

                case "fullName": {
                  const names = parsedData.fullName.split(" ")
                  cipher.identity.firstName = names[0]
                  cipher.identity.lastName = names.slice(1).join(" ")
                  break
                }

                case "phoneNumber": {
                  cipher.identity.phone = parsedData.phoneNumber
                  break
                }

                case "zipOrPostalCode": {
                  cipher.identity.postalCode = parsedData.zipOrPostalCode
                  break
                }

                case "streetAddress": {
                  cipher.identity.address1 = parsedData.streetAddress
                  break
                }

                case "stateOrProvince": {
                  cipher.identity.state = parsedData.stateOrProvince
                  break
                }

                case "countryOrRegion": {
                  cipher.identity.country = parsedData.countryOrRegion
                  break
                }

                case "socialSecurityNumber": {
                  cipher.identity.ssn = parsedData.socialSecurityNumber
                  break
                }

                case "passportNumber": {
                  cipher.identity.passportNumber = parsedData.passportNumber
                  break
                }

                case "licenseNumber": {
                  cipher.identity.licenseNumber = parsedData.licenseNumber
                  break
                }

                case "email":
                case "city":
                case "company":
                case "firstName":
                case "lastName":
                case "middleName": {
                  if (parsedData[key]) {
                    cipher.identity[key] = parsedData[key]
                  }
                  break
                }

                default: {
                  this.processKvp(cipher, key, parsedData[key])
                }
              }
            })
          } catch (e) {
            // Do nothing
          }
          break
        }

        default: {
          this.processKvp(cipher, "type", type)
          if (value.email) {
            this.processKvp(cipher, "email", value.email)
          }
          if (value.url) {
            this.processKvp(cipher, "url", value.url)
          }

          if (cipher.notes) {
            try {
              const obj = JSON.parse(cipher.notes)
              Object.keys(obj).forEach((key) => {
                if (key === "note") {
                  cipher.notes = obj.note
                } else {
                  this.processKvp(cipher, key, obj[key])
                }
              })
            } catch (error) {
              //
            }
          }

          cipher.secureNote = new SecureNoteView()
          cipher.secureNote.type = SecureNoteType.Generic
        }
      }

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
