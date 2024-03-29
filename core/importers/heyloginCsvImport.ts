import { FieldType } from '../enums/fieldType'
import { ImportResult } from '../models/domain/importResult'
import { BaseImporter } from './baseImporter'
import { Importer } from './importer'

export class HeyLoginCsvImporter extends BaseImporter implements Importer {
  parse (data: string): Promise<ImportResult> {
    const result = new ImportResult()
    const results = this.parseCsv(data, true)
    if (results == null) {
      result.success = false
      return Promise.resolve(result)
    }

    // CS
    const existingKeys = [
      'url',
      'note',
      'username',
      'password',
      'customFields',
      'totp'
    ]

    results.forEach(value => {
      const cipher = this.initLoginCipher()
      cipher.name = this.getValueOrDefault(
        this.nameFromUrl(value.url) || value.username || '',
        '--'
      )
      cipher.notes = this.getValueOrDefault(value.note)
      cipher.login.username = this.getValueOrDefault(value.username)
      cipher.login.password = this.getValueOrDefault(value.password)
      cipher.login.totp = this.getValueOrDefault(value.totp)
      cipher.login.uris = this.makeUriArray(value.url)
      try {
        const customFields = JSON.parse(value.customFields)
        customFields.forEach(f => {
          this.processKvp(
            cipher,
            f.name,
            f.value,
            f.protected ? FieldType.Hidden : FieldType.Text
          )
        })
      } catch (e) {
        //
      }

      // CS
      Object.keys(value)
        .filter(k => !existingKeys.includes(k))
        .forEach(k => {
          this.processKvp(cipher, k, value[k])
        })

      this.cleanupCipher(cipher)
      result.ciphers.push(cipher)
    })

    result.success = true
    return Promise.resolve(result)
  }
}