import { TwoFactorProviderType } from '../../enums/twoFactorProviderType';

export class AuthResult {
    twoFactor = false;
    resetMasterPassword = false;
    twoFactorProviders: Map<TwoFactorProviderType, { [key: string]: string; }> = null;
}
