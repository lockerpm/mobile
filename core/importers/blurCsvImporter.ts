import { BaseImporter } from './baseImporter';
import { Importer } from './importer';

import { ImportResult } from '../models/domain/importResult';

export class BlurCsvImporter extends BaseImporter implements Importer {
    parse(data: string): Promise<ImportResult> {
        const result = new ImportResult();
        const results = this.parseCsv(data, true);
        if (results == null) {
            result.success = false;
            return Promise.resolve(result);
        }

        // CS
        const existingKeys = ['label', 'domain', 'password', 'email', 'username']

        results.forEach(value => {
            if (value.label === 'null') {
                value.label = null;
            }
            const cipher = this.initLoginCipher();
            cipher.name = this.getValueOrDefault(value.label,
                this.getValueOrDefault(this.nameFromUrl(value.domain), '--'));
            cipher.login.uris = this.makeUriArray(value.domain);
            cipher.login.password = this.getValueOrDefault(value.password);

            // CS
            // if (this.isNullOrWhitespace(value.email) && !this.isNullOrWhitespace(value.username)) {
            //     cipher.login.username = value.username;
            // } else {
            //     cipher.login.username = this.getValueOrDefault(value.email);
            //     cipher.notes = this.getValueOrDefault(value.username);
            // }
            if (this.isNullOrWhitespace(value.username) && !this.isNullOrWhitespace(value.email)) {
                cipher.login.username = value.email;
            } else {
                cipher.login.username = this.getValueOrDefault(value.username);
                this.processKvp(cipher, 'email', value.email)
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
