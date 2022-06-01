import { BaseImporter } from './baseImporter';
import { Importer } from './importer';

import { ImportResult } from '../models/domain/importResult';

export class AviraCsvImporter extends BaseImporter implements Importer {
    parse(data: string): Promise<ImportResult> {
        const result = new ImportResult();
        const results = this.parseCsv(data, true);
        if (results == null) {
            result.success = false;
            return Promise.resolve(result);
        }

        // CS
        const existingKeys = ['name', 'website', 'password', 'username', 'secondary_username']

        results.forEach(value => {
            const cipher = this.initLoginCipher();
            cipher.name = this.getValueOrDefault(value.name,
                this.getValueOrDefault(this.nameFromUrl(value.website), '--'));
            cipher.login.uris = this.makeUriArray(value.website);
            cipher.login.password = this.getValueOrDefault(value.password);

            if (this.isNullOrWhitespace(value.username) && !this.isNullOrWhitespace(value.secondary_username)) {
                cipher.login.username = value.secondary_username;
            } else {
                cipher.login.username = this.getValueOrDefault(value.username);

                // CS
                // cipher.notes = this.getValueOrDefault(value.secondary_username);
                this.processKvp(cipher, 'secondary_username', value.secondary_username)
            }

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
