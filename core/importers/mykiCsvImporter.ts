import { BaseImporter } from './baseImporter';
import { Importer } from './importer';

import { CipherType } from '../enums/cipherType';
import { SecureNoteType } from '../enums/secureNoteType';

import { CardView } from '../models/view/cardView';
import { IdentityView } from '../models/view/identityView';
import { SecureNoteView } from '../models/view/secureNoteView';

import { ImportResult } from '../models/domain/importResult';

export class MykiCsvImporter extends BaseImporter implements Importer {
    parse(data: string): Promise<ImportResult> {
        const result = new ImportResult();
        const results = this.parseCsv(data, true);
        if (results == null) {
            result.success = false;
            return Promise.resolve(result);
        }

        results.forEach(value => {
            const cipher = this.initLoginCipher();
            cipher.name = this.getValueOrDefault(value.nickname, '--');
            cipher.notes = this.getValueOrDefault(value.additionalInfo);
            // CS
            const existingKeys = ['nickname', 'additionalInfo']

            if (value.url !== undefined) {
                // Accounts
                cipher.login.uris = this.makeUriArray(value.url);
                cipher.login.username = this.getValueOrDefault(value.username);
                cipher.login.password = this.getValueOrDefault(value.password);
                cipher.login.totp = this.getValueOrDefault(value.twoFactAuthToken);
                existingKeys.push('url', 'username', 'password', 'twoFactAuthToken')
            } else if (value.cardNumber !== undefined) {
                // Cards
                cipher.card = new CardView();
                cipher.type = CipherType.Card;
                cipher.card.cardholderName = this.getValueOrDefault(value.cardName);
                cipher.card.number = this.getValueOrDefault(value.cardNumber);
                cipher.card.brand = this.getCardBrand(cipher.card.number);
                cipher.card.expMonth = this.getValueOrDefault(value.exp_month);
                cipher.card.expYear = this.getValueOrDefault(value.exp_year);
                cipher.card.code = this.getValueOrDefault(value.cvv);
                existingKeys.push('cardName', 'cardNumber', 'exp_month', 'exp_year', 'cvv')
            } else if (value.firstName !== undefined) {
                // Identities
                cipher.identity = new IdentityView();
                cipher.type = CipherType.Identity;
                cipher.identity.title = this.getValueOrDefault(value.title);
                cipher.identity.firstName = this.getValueOrDefault(value.firstName);
                cipher.identity.middleName = this.getValueOrDefault(value.middleName);
                cipher.identity.lastName = this.getValueOrDefault(value.lastName);
                cipher.identity.phone = this.getValueOrDefault(value.number);
                cipher.identity.email = this.getValueOrDefault(value.email);
                cipher.identity.address1 = this.getValueOrDefault(value.firstAddressLine);
                cipher.identity.address2 = this.getValueOrDefault(value.secondAddressLine);
                cipher.identity.city = this.getValueOrDefault(value.city);
                cipher.identity.country = this.getValueOrDefault(value.country);
                cipher.identity.postalCode = this.getValueOrDefault(value.zipCode);
                existingKeys.push('title', 'firstName', 'middleName', 'lastName', 'number', 'email', 'firstAddressLine', 'secondAddressLine', 'city', 'country', 'zipCode')
            } else if (value.content !== undefined) {
                // Notes
                cipher.secureNote = new SecureNoteView();
                cipher.type = CipherType.SecureNote;
                cipher.secureNote.type = SecureNoteType.Generic;
                cipher.name = this.getValueOrDefault(value.title, '--');
                cipher.notes = this.getValueOrDefault(value.content);
                existingKeys.push('title', 'content')
            } else {
                return;
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
