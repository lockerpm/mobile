import * as papa from 'papaparse';

import { CipherType } from '../enums/cipherType';

import { ApiService } from '../abstractions/api.service';
import { CipherService } from '../abstractions/cipher.service';
import { CryptoService } from '../abstractions/crypto.service';
import { ExportService as ExportServiceAbstraction } from '../abstractions/export.service';
import { FolderService } from '../abstractions/folder.service';

import { CipherView } from '../models/view/cipherView';
import { CollectionView } from '../models/view/collectionView';
import { FolderView } from '../models/view/folderView';

import { Cipher } from '../models/domain/cipher';
import { Collection } from '../models/domain/collection';
import { Folder } from '../models/domain/folder';

import { CipherData } from '../models/data/cipherData';
import { CollectionData } from '../models/data/collectionData';
import { CollectionDetailsResponse } from '../models/response/collectionResponse';

import { CipherWithIds as CipherExport } from '../models/export/cipherWithIds';
import { CollectionWithId as CollectionExport } from '../models/export/collectionWithId';
import { Event } from '../models/export/event';
import { FolderWithId as FolderExport } from '../models/export/folderWithId';
import { EventView } from '../models/view/eventView';

import { Utils } from '../misc/utils';

export class ExportService implements ExportServiceAbstraction {
    constructor(private folderService: FolderService, private cipherService: CipherService,
        private apiService: ApiService, private cryptoService: CryptoService) { }

    async getExport(format: 'csv' | 'json' | 'encrypted_json' = 'csv'): Promise<string> {
        if (format === 'encrypted_json') {
            return this.getEncryptedExport();
        } else {
            return this.getDecryptedExport(format);
        }
    }

    async getOrganizationExport(organizationId: string,
        format: 'csv' | 'json' | 'encrypted_json' = 'csv'): Promise<string> {
        if (format === 'encrypted_json') {
            return this.getOrganizationEncryptedExport(organizationId);
        } else {
            return this.getOrganizationDecryptedExport(organizationId, format);
        }
    }

    async getEventExport(events: EventView[]): Promise<string> {
        return papa.unparse(events.map(e => new Event(e)));
    }

    getFileName(prefix: string = null, extension = 'csv'): string {
        const now = new Date();
        const dateString =
            now.getFullYear() + '' + this.padNumber(now.getMonth() + 1, 2) + '' + this.padNumber(now.getDate(), 2) +
            this.padNumber(now.getHours(), 2) + '' + this.padNumber(now.getMinutes(), 2) +
            this.padNumber(now.getSeconds(), 2);

        return 'locker' + (prefix ? ('_' + prefix) : '') + '_export_' + dateString + '.' + extension;
    }

    private async getDecryptedExport(format: 'json' | 'csv'): Promise<string> {
        let decFolders: FolderView[] = [];
        let decCiphers: CipherView[] = [];
        const promises = [];

        promises.push(this.folderService.getAllDecrypted().then(folders => {
            decFolders = folders;
        }));

        promises.push(this.cipherService.getAllDecrypted().then(ciphers => {
            decCiphers = ciphers ? ciphers.filter(f => f.deletedDate == null || f.type !== CipherType.MasterPassword) : [];
        }));

        await Promise.all(promises);

        if (format === 'csv') {
            const foldersMap = new Map<string, FolderView>();
            decFolders.forEach(f => {
                if (f.id != null) {
                    foldersMap.set(f.id, f);
                }
            });

            const exportCiphers: any[] = [];
            decCiphers.forEach(c => {
                // only export logins and secure notes
                // if (c.type !== CipherType.Login && c.type !== CipherType.SecureNote) {
                //     return;
                // }
                if (c.organizationId != null) {
                    // return;
                    c.organizationId = null
                }

                const cipher: any = {};
                cipher.folder = c.folderId != null && foldersMap.has(c.folderId) ?
                    foldersMap.get(c.folderId).name : null;
                cipher.favorite = c.favorite ? 1 : null;
                this.buildCommonCipher(cipher, c);
                exportCiphers.push(cipher);
            });

            return papa.unparse(exportCiphers);
        } else {
            const jsonDoc: any = {
                encrypted: false,
                folders: [],
                items: [],
            };

            decFolders.forEach(f => {
                if (f.id == null) {
                    return;
                }
                const folder = new FolderExport();
                folder.build(f);
                jsonDoc.folders.push(folder);
            });

            decCiphers.forEach(c => {
                if (c.organizationId != null) {
                    c.organizationId = null
                    // return;
                }
                const cipher = new CipherExport();
                cipher.build(c);
                cipher.collectionIds = null;
                jsonDoc.items.push(cipher);
            });

            return JSON.stringify(jsonDoc, null, '  ');
        }
    }

    private async getEncryptedExport(): Promise<string> {
        let folders: Folder[] = [];
        let ciphers: Cipher[] = [];
        const promises = [];

        promises.push(this.folderService.getAll().then(f => {
            folders = f;
        }));

        promises.push(this.cipherService.getAll().then(c => {
            ciphers = c.filter(f => f.deletedDate == null);
        }));

        await Promise.all(promises);

        const encKeyValidation = await this.cryptoService.encrypt(Utils.newGuid());

        const jsonDoc: any = {
            encrypted: true,
            encKeyValidation_DO_NOT_EDIT: encKeyValidation.encryptedString,
            folders: [],
            items: [],
        };

        folders.forEach(f => {
            if (f.id == null) {
                return;
            }
            const folder = new FolderExport();
            folder.build(f);
            jsonDoc.folders.push(folder);
        });

        ciphers.forEach(c => {
            if (c.organizationId != null) {
                return;
            }
            const cipher = new CipherExport();
            cipher.build(c);
            cipher.collectionIds = null;
            jsonDoc.items.push(cipher);
        });

        return JSON.stringify(jsonDoc, null, '  ');
    }

    private async getOrganizationDecryptedExport(organizationId: string, format: 'json' | 'csv'): Promise<string> {
        const decCollections: CollectionView[] = [];
        const decCiphers: CipherView[] = [];
        const promises = [];

        promises.push(this.apiService.getCollections(organizationId).then(collections => {
            const collectionPromises: any = [];
            if (collections != null && collections.data != null && collections.data.length > 0) {
                collections.data.forEach(c => {
                    const collection = new Collection(new CollectionData(c as CollectionDetailsResponse));
                    collectionPromises.push(collection.decrypt().then(decCol => {
                        decCollections.push(decCol);
                    }));
                });
            }
            return Promise.all(collectionPromises);
        }));

        promises.push(this.apiService.getCiphersOrganization(organizationId).then(ciphers => {
            const cipherPromises: any = [];
            if (ciphers != null && ciphers.data != null && ciphers.data.length > 0) {
                ciphers.data.filter(c => c.deletedDate === null).forEach(c => {
                    const cipher = new Cipher(new CipherData(c));
                    cipherPromises.push(cipher.decrypt().then(decCipher => {
                        decCiphers.push(decCipher);
                    }));
                });
            }
            return Promise.all(cipherPromises);
        }));

        await Promise.all(promises);

        if (format === 'csv') {
            const collectionsMap = new Map<string, CollectionView>();
            decCollections.forEach(c => {
                collectionsMap.set(c.id, c);
            });

            const exportCiphers: any[] = [];
            decCiphers.forEach(c => {
                // only export logins and secure notes
                // if (c.type !== CipherType.Login && c.type !== CipherType.SecureNote) {
                //     return;
                // }

                const cipher: any = {};
                cipher.collections = [];
                if (c.collectionIds != null) {
                    cipher.collections = c.collectionIds.filter(id => collectionsMap.has(id))
                        .map(id => collectionsMap.get(id).name);
                }
                this.buildCommonCipher(cipher, c);
                exportCiphers.push(cipher);
            });

            return papa.unparse(exportCiphers);
        } else {
            const jsonDoc: any = {
                encrypted: false,
                collections: [],
                items: [],
            };

            decCollections.forEach(c => {
                const collection = new CollectionExport();
                collection.build(c);
                jsonDoc.collections.push(collection);
            });

            decCiphers.forEach(c => {
                const cipher = new CipherExport();
                cipher.build(c);
                jsonDoc.items.push(cipher);
            });
            return JSON.stringify(jsonDoc, null, '  ');
        }
    }

    private async getOrganizationEncryptedExport(organizationId: string): Promise<string> {
        const collections: Collection[] = [];
        const ciphers: Cipher[] = [];
        const promises = [];

        promises.push(this.apiService.getCollections(organizationId).then(c => {
            const collectionPromises: any = [];
            if (c != null && c.data != null && c.data.length > 0) {
                c.data.forEach(r => {
                    const collection = new Collection(new CollectionData(r as CollectionDetailsResponse));
                    collections.push(collection);
                });
            }
            return Promise.all(collectionPromises);
        }));

        promises.push(this.apiService.getCiphersOrganization(organizationId).then(c => {
            const cipherPromises: any = [];
            if (c != null && c.data != null && c.data.length > 0) {
                c.data.filter(item => item.deletedDate === null).forEach(item => {
                    const cipher = new Cipher(new CipherData(item));
                    ciphers.push(cipher);
                });
            }
            return Promise.all(cipherPromises);
        }));

        await Promise.all(promises);

        const orgKey = await this.cryptoService.getOrgKey(organizationId);
        const encKeyValidation = await this.cryptoService.encrypt(Utils.newGuid(), orgKey);

        const jsonDoc: any = {
            encrypted: true,
            encKeyValidation_DO_NOT_EDIT: encKeyValidation.encryptedString,
            collections: [],
            items: [],
        };

        collections.forEach(c => {
            const collection = new CollectionExport();
            collection.build(c);
            jsonDoc.collections.push(collection);
        });

        ciphers.forEach(c => {
            const cipher = new CipherExport();
            cipher.build(c);
            jsonDoc.items.push(cipher);
        });
        return JSON.stringify(jsonDoc, null, '  ');
    }

    private padNumber(num: number, width: number, padCharacter = '0'): string {
        const numString = num.toString();
        return numString.length >= width ? numString :
            new Array(width - numString.length + 1).join(padCharacter) + numString;
    }

    private buildCommonCipher(cipher: any, c: CipherView) {
        cipher.type = null;
        cipher.name = c.name;
        cipher.notes = c.notes;
        cipher.fields = null;
        cipher.reprompt = c.reprompt;
        // Login props
        cipher.login_uri = null;
        cipher.login_username = null;
        cipher.login_password = null;
        cipher.login_totp = null;

        if (c.fields) {
            c.fields.forEach((f: any) => {
                if (!cipher.fields) {
                    cipher.fields = '';
                } else {
                    cipher.fields += '\n';
                }

                cipher.fields += ((f.name || '') + ': ' + f.value);
            });
        }

        switch (c.type) {
            case CipherType.Login:
                cipher.type = 'login';
                cipher.login_username = c.login.username;
                cipher.login_password = c.login.password;
                cipher.login_totp = c.login.totp;

                if (c.login.uris) {
                    cipher.login_uri = [];
                    c.login.uris.forEach(u => {
                        cipher.login_uri.push(u.uri);
                    });
                }
                break;
            case CipherType.SecureNote:
                cipher.type = 'note';
                break;
            case CipherType.DriverLicense:
                cipher.type = 'driver-license'
                break
            case CipherType.CitizenID:
                cipher.type = 'citizen-id'
                break
            case CipherType.Passport:
                cipher.type = 'passport'
                break
            case CipherType.SocialSecurityNumber:
                cipher.type = 'social-security-number'
                break
            case CipherType.WirelessRouter:
                cipher.type = 'wireless-router'
                break
            case CipherType.Server:
                cipher.type = 'server'
                break
            case CipherType.APICipher:
                cipher.type = 'api-cipher'
                break
            case CipherType.Database:
                cipher.type = 'database'
                break
            case CipherType.CryptoWallet:
                cipher.type = 'crypto-wallet'
                break
            case CipherType.TOTP:
                cipher.type = 'totp'
                break
            case CipherType.Card:
                cipher.type = 'card'
                const cardPayload = {
                    notes: c.notes
                }
                Object.getOwnPropertyNames(c.card).forEach(key => {
                    if (key.startsWith('_')) {
                        if (key !== '_subTitle') {
                            cardPayload[key.slice(1)] = c.card[key]
                        }
                    } else {
                        cardPayload[key] = c.card[key]
                    }
                })
                cipher.notes = JSON.stringify(cardPayload)
                break
            case CipherType.Identity:
                cipher.type = 'identity'
                const identityPayload = {
                    notes: c.notes
                }
                Object.getOwnPropertyNames(c.identity).forEach(key => {
                    if (key.startsWith('_')) {
                        if (key !== '_subTitle') {
                            identityPayload[key.slice(1)] = c.identity[key]
                        }
                    } else {
                        identityPayload[key] = c.identity[key]
                    }
                })
                cipher.notes = JSON.stringify(identityPayload)
                break
            default:
                return;
        }

        return cipher;
    }
}
