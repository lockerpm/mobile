import { CipherRepromptType } from '../../enums/cipherRepromptType';
import { CipherType } from '../../enums/cipherType';

import { Cipher } from '../domain/cipher';

import { AttachmentView } from './attachmentView';
import { CardView } from './cardView';
import { FieldView } from './fieldView';
import { IdentityView } from './identityView';
import { LoginView } from './loginView';
import { PasswordHistoryView } from './passwordHistoryView';
import { SecureNoteView } from './secureNoteView';
import { View } from './view';

export class CipherView implements View {
    id: string = null;
    organizationId: string = null;
    folderId: string = null;
    name: string = null;
    notes: string = null;
    type: CipherType = null;
    favorite = false;
    organizationUseTotp = false;
    edit = false;
    viewPassword = true;
    localData: any;
    login = new LoginView();
    identity = new IdentityView();
    card = new CardView();
    secureNote = new SecureNoteView();
    attachments: AttachmentView[] = null;
    fields: FieldView[] = null;
    passwordHistory: PasswordHistoryView[] = null;
    collectionIds: string[] = null;
    revisionDate: Date = null;
    deletedDate: Date = null;
    reprompt: CipherRepromptType = CipherRepromptType.None;

    constructor(c?: Cipher) {
        if (!c) {
            return;
        }

        this.id = c.id;
        this.organizationId = c.organizationId;
        this.folderId = c.folderId;
        this.favorite = c.favorite;
        this.organizationUseTotp = c.organizationUseTotp;
        this.edit = c.edit;
        this.viewPassword = c.viewPassword;
        this.type = c.type;
        this.localData = c.localData;
        this.collectionIds = c.collectionIds;
        this.revisionDate = c.revisionDate;
        this.deletedDate = c.deletedDate;
        // Old locally stored ciphers might have reprompt == null. If so set it to None.
        this.reprompt = c.reprompt ?? CipherRepromptType.None;
    }

    get subTitle(): string {
        switch (this.type) {
            case CipherType.MasterPassword:
            case CipherType.Login:
                return this.login.subTitle;
            case CipherType.SecureNote:
            case CipherType.TOTP:
            case CipherType.DriverLicense:
            case CipherType.CitizenID:
            case CipherType.Passport:
            case CipherType.SocialSecurityNumber:
            case CipherType.WirelessRouter:
            case CipherType.Server:
            case CipherType.APICipher:
            case CipherType.Database:
            case CipherType.CryptoWallet:
                return this.secureNote.subTitle;
            case CipherType.Card:
                return this.card.subTitle;
            case CipherType.Identity:
                return this.identity.subTitle;
            default:
                break;
        }

        return null;
    }

    get hasPasswordHistory(): boolean {
        return this.passwordHistory && this.passwordHistory.length > 0;
    }

    get hasAttachments(): boolean {
        return this.attachments && this.attachments.length > 0;
    }

    get hasOldAttachments(): boolean {
        if (this.hasAttachments) {
            for (let i = 0; i < this.attachments.length; i++) {
                if (this.attachments[i].key == null) {
                    return true;
                }
            }
        }
        return false;
    }

    get hasFields(): boolean {
        return this.fields && this.fields.length > 0;
    }

    get passwordRevisionDisplayDate(): Date {
        if (this.type !== CipherType.Login || this.login == null) {
            return null;
        } else if (this.login.password == null || this.login.password === '') {
            return null;
        }
        return this.login.passwordRevisionDate;
    }

    get isDeleted(): boolean {
        return this.deletedDate != null;
    }
}
