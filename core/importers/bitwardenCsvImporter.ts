import { BaseImporter } from './baseImporter';
import { Importer } from './importer';

import { ImportResult } from '../models/domain/importResult';

import { CipherView } from '../models/view/cipherView';
import { CollectionView } from '../models/view/collectionView';
import { FieldView } from '../models/view/fieldView';
import { FolderView } from '../models/view/folderView';
import { LoginView } from '../models/view/loginView';
import { SecureNoteView } from '../models/view/secureNoteView';

import { CipherRepromptType } from '../enums/cipherRepromptType';
import { CipherType } from '../enums/cipherType';
import { FieldType } from '../enums/fieldType';
import { SecureNoteType } from '../enums/secureNoteType';
import { CardView, IdentityView } from '../models/view';

export class BitwardenCsvImporter extends BaseImporter implements Importer {
    parse(data: string): Promise<ImportResult> {
        const result = new ImportResult();
        const results = this.parseCsv(data, true);
        if (results == null) {
            result.success = false;
            return Promise.resolve(result);
        }

        results.forEach(value => {
            if (this.organization && !this.isNullOrWhitespace(value.collections)) {
                const collections = (value.collections as string).split(',');
                collections.forEach(col => {
                    let addCollection = true;
                    let collectionIndex = result.collections.length;

                    for (let i = 0; i < result.collections.length; i++) {
                        if (result.collections[i].name === col) {
                            addCollection = false;
                            collectionIndex = i;
                            break;
                        }
                    }

                    if (addCollection) {
                        const collection = new CollectionView();
                        collection.name = col;
                        result.collections.push(collection);
                    }

                    result.collectionRelationships.push([result.ciphers.length, collectionIndex]);
                });
            } else if (!this.organization) {
                this.processFolder(result, value.folder);
            }

            const cipher = new CipherView();
            cipher.favorite = !this.organization && this.getValueOrDefault(value.favorite, '0') !== '0' ? true : false;
            cipher.type = CipherType.Login;
            cipher.notes = this.getValueOrDefault(value.notes);
            cipher.name = this.getValueOrDefault(value.name, '--');
            try {
                cipher.reprompt = parseInt(this.getValueOrDefault(value.reprompt, CipherRepromptType.None.toString()), 10);
            } catch (e) {
                // tslint:disable-next-line
                console.error('Unable to parse reprompt value', e);
                cipher.reprompt = CipherRepromptType.None;
            }

            if (!this.isNullOrWhitespace(value.fields)) {
                const fields = this.splitNewLine(value.fields);
                for (let i = 0; i < fields.length; i++) {
                    if (this.isNullOrWhitespace(fields[i])) {
                        continue;
                    }

                    const delimPosition = fields[i].lastIndexOf(': ');
                    if (delimPosition === -1) {
                        continue;
                    }

                    if (cipher.fields == null) {
                        cipher.fields = [];
                    }

                    const field = new FieldView();
                    field.name = fields[i].substr(0, delimPosition);
                    field.value = null;
                    field.type = FieldType.Text;
                    if (fields[i].length > (delimPosition + 2)) {
                        field.value = fields[i].substr(delimPosition + 2);
                    }
                    cipher.fields.push(field);
                }
            }

            const valueType = value.type != null ? value.type.toLowerCase() : null;
            switch (valueType) {
                case 'note':
                    cipher.type = CipherType.SecureNote;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'driver-license':
                    cipher.type = CipherType.DriverLicense;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'citizen-id':
                    cipher.type = CipherType.CitizenID;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'passport':
                    cipher.type = CipherType.Passport;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'social-security-number':
                    cipher.type = CipherType.SocialSecurityNumber;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'wireless-router':
                    cipher.type = CipherType.WirelessRouter;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'server':
                    cipher.type = CipherType.Server;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'api-cipher':
                    cipher.type = CipherType.APICipher;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;
                case 'database':
                    cipher.type = CipherType.Database;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break;

                case 'crypto-wallet':
                    cipher.type = CipherType.CryptoWallet;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break
                case 'totp':
                    cipher.type = CipherType.TOTP;
                    cipher.secureNote = new SecureNoteView();
                    cipher.secureNote.type = SecureNoteType.Generic;
                    break
                case 'identity':
                    cipher.type = CipherType.Identity;
                    cipher.identity = new IdentityView();
                    try {
                        const parsedData = JSON.parse(cipher.notes)
                        Object.keys(parsedData).forEach(key => {
                            if (key === 'notes') {
                                cipher.notes = parsedData.notes
                            } else {
                                cipher.identity[key] = parsedData[key]
                            }
                        })
                    } catch (e) {
                        // Do nothing
                    }
                    break
                case 'card':
                    cipher.type = CipherType.Card;
                    cipher.card = new CardView();
                    try {
                        const parsedData = JSON.parse(cipher.notes)
                        Object.keys(parsedData).forEach(key => {
                            if (key === 'notes') {
                                cipher.notes = parsedData.notes
                            } else {
                                cipher.card[key] = parsedData[key]
                            }
                        })
                    } catch (e) {
                        // Do nothing
                    }
                    break
                default:
                    cipher.type = CipherType.Login;
                    cipher.login = new LoginView();
                    cipher.login.totp = this.getValueOrDefault(value.login_totp || value.totp);
                    cipher.login.username = this.getValueOrDefault(value.login_username || value.username);
                    cipher.login.password = this.getValueOrDefault(value.login_password || value.password);
                    const uris = this.parseSingleRowCsv(value.login_uri || value.uri);
                    cipher.login.uris = this.makeUriArray(uris);
                    break;
            }

            result.ciphers.push(cipher);
        });

        result.success = true;
        return Promise.resolve(result);
    }
}
