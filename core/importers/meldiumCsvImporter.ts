import { BaseImporter } from './baseImporter';
import { Importer } from './importer';

import { ImportResult } from '../models/domain/importResult';

export class MeldiumCsvImporter extends BaseImporter implements Importer {
    parse(data: string): Promise<ImportResult> {
        const result = new ImportResult();
        const results = this.parseCsv(data, true);
        if (results == null) {
            result.success = false;
            return Promise.resolve(result);
        }

        // CS
        const existingKeys = ['DisplayName', 'Notes', 'UserName', 'Password', 'Url']

        results.forEach(value => {
            const cipher = this.initLoginCipher();
            cipher.name = this.getValueOrDefault(value.DisplayName, '--');
            cipher.notes = this.getValueOrDefault(value.Notes);
            cipher.login.username = this.getValueOrDefault(value.UserName);
            cipher.login.password = this.getValueOrDefault(value.Password);
            cipher.login.uris = this.makeUriArray(value.Url);

            // CS
            Object.keys(value).filter(k => !existingKeys.includes(k)).forEach(k => {
                this.processKvp(cipher, k, value[k])
            })

            this.cleanupCipher(cipher);
            result.ciphers.push(cipher);
        });


        result.success = true;
        return Promise.resolve(result);
    }
}
