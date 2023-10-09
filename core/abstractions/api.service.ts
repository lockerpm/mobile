import { PolicyType } from '../enums/policyType';

import { EnvironmentUrls } from '../models/domain/environmentUrls';
import { AttachmentRequest } from '../models/request/attachmentRequest';

import { BitPayInvoiceRequest } from '../models/request/bitPayInvoiceRequest';
import { CipherBulkDeleteRequest } from '../models/request/cipherBulkDeleteRequest';
import { CipherBulkMoveRequest } from '../models/request/cipherBulkMoveRequest';
import { CipherBulkRestoreRequest } from '../models/request/cipherBulkRestoreRequest';
import { CipherBulkShareRequest } from '../models/request/cipherBulkShareRequest';
import { CipherCollectionsRequest } from '../models/request/cipherCollectionsRequest';
import { CipherCreateRequest } from '../models/request/cipherCreateRequest';
import { CipherRequest } from '../models/request/cipherRequest';
import { CipherShareRequest } from '../models/request/cipherShareRequest';
import { CollectionRequest } from '../models/request/collectionRequest';
import { DeleteRecoverRequest } from '../models/request/deleteRecoverRequest';
import { EmailRequest } from '../models/request/emailRequest';
import { EmailTokenRequest } from '../models/request/emailTokenRequest';
import { EmergencyAccessAcceptRequest } from '../models/request/emergencyAccessAcceptRequest';
import { EmergencyAccessConfirmRequest } from '../models/request/emergencyAccessConfirmRequest';
import { EmergencyAccessInviteRequest } from '../models/request/emergencyAccessInviteRequest';
import { EmergencyAccessPasswordRequest } from '../models/request/emergencyAccessPasswordRequest';
import { EmergencyAccessUpdateRequest } from '../models/request/emergencyAccessUpdateRequest';
import { EventRequest } from '../models/request/eventRequest';
import { FolderRequest } from '../models/request/folderRequest';
import { GroupRequest } from '../models/request/groupRequest';
import { IapCheckRequest } from '../models/request/iapCheckRequest';
import { ImportCiphersRequest } from '../models/request/importCiphersRequest';
import { ImportDirectoryRequest } from '../models/request/importDirectoryRequest';
import { ImportOrganizationCiphersRequest } from '../models/request/importOrganizationCiphersRequest';
import { KdfRequest } from '../models/request/kdfRequest';
import { KeysRequest } from '../models/request/keysRequest';
import { OrganizationCreateRequest } from '../models/request/organizationCreateRequest';
import { OrganizationImportRequest } from '../models/request/organizationImportRequest';
import { OrganizationKeysRequest } from '../models/request/organizationKeysRequest';
import { OrganizationTaxInfoUpdateRequest } from '../models/request/organizationTaxInfoUpdateRequest';
import { OrganizationUpdateRequest } from '../models/request/organizationUpdateRequest';
import { OrganizationUpgradeRequest } from '../models/request/organizationUpgradeRequest';
import { OrganizationUserAcceptRequest } from '../models/request/organizationUserAcceptRequest';
import { OrganizationUserBulkConfirmRequest } from '../models/request/organizationUserBulkConfirmRequest';
import { OrganizationUserBulkRequest } from '../models/request/organizationUserBulkRequest';
import { OrganizationUserConfirmRequest } from '../models/request/organizationUserConfirmRequest';
import { OrganizationUserInviteRequest } from '../models/request/organizationUserInviteRequest';
import { OrganizationUserResetPasswordEnrollmentRequest } from '../models/request/organizationUserResetPasswordEnrollmentRequest';
import { OrganizationUserResetPasswordRequest } from '../models/request/organizationUserResetPasswordRequest';
import { OrganizationUserUpdateGroupsRequest } from '../models/request/organizationUserUpdateGroupsRequest';
import { OrganizationUserUpdateRequest } from '../models/request/organizationUserUpdateRequest';
import { PasswordHintRequest } from '../models/request/passwordHintRequest';
import { PasswordRequest } from '../models/request/passwordRequest';
import { PasswordVerificationRequest } from '../models/request/passwordVerificationRequest';
import { PaymentRequest } from '../models/request/paymentRequest';
import { PolicyRequest } from '../models/request/policyRequest';
import { PreloginRequest } from '../models/request/preloginRequest';
import { RegisterRequest } from '../models/request/registerRequest';
import { SeatRequest } from '../models/request/seatRequest';
import { SelectionReadOnlyRequest } from '../models/request/selectionReadOnlyRequest';
import { SendAccessRequest } from '../models/request/sendAccessRequest';
import { SendRequest } from '../models/request/sendRequest';
import { SetPasswordRequest } from '../models/request/setPasswordRequest';
import { StorageRequest } from '../models/request/storageRequest';
import { TaxInfoUpdateRequest } from '../models/request/taxInfoUpdateRequest';
import { TokenRequest } from '../models/request/tokenRequest';
import { TwoFactorEmailRequest } from '../models/request/twoFactorEmailRequest';
import { TwoFactorProviderRequest } from '../models/request/twoFactorProviderRequest';
import { TwoFactorRecoveryRequest } from '../models/request/twoFactorRecoveryRequest';
import { UpdateDomainsRequest } from '../models/request/updateDomainsRequest';
import { UpdateKeyRequest } from '../models/request/updateKeyRequest';
import { UpdateProfileRequest } from '../models/request/updateProfileRequest';
import { UpdateTwoFactorAuthenticatorRequest } from '../models/request/updateTwoFactorAuthenticatorRequest';
import { UpdateTwoFactorDuoRequest } from '../models/request/updateTwoFactorDuoRequest';
import { UpdateTwoFactorEmailRequest } from '../models/request/updateTwoFactorEmailRequest';
import { UpdateTwoFactorWebAuthnDeleteRequest } from '../models/request/updateTwoFactorWebAuthnDeleteRequest';
import { UpdateTwoFactorWebAuthnRequest } from '../models/request/updateTwoFactorWebAuthnRequest';
import { UpdateTwoFactorYubioOtpRequest } from '../models/request/updateTwoFactorYubioOtpRequest';
import { VerifyBankRequest } from '../models/request/verifyBankRequest';
import { VerifyDeleteRecoverRequest } from '../models/request/verifyDeleteRecoverRequest';
import { VerifyEmailRequest } from '../models/request/verifyEmailRequest';

import { ApiKeyResponse } from '../models/response/apiKeyResponse';
import { AttachmentResponse } from '../models/response/attachmentResponse';
import { AttachmentUploadDataResponse } from '../models/response/attachmentUploadDataResponse';
import { BillingResponse } from '../models/response/billingResponse';
import { BreachAccountResponse } from '../models/response/breachAccountResponse';
import { CipherResponse } from '../models/response/cipherResponse';
import {
    CollectionGroupDetailsResponse,
    CollectionResponse,
} from '../models/response/collectionResponse';
import { DomainsResponse } from '../models/response/domainsResponse';
import {
    EmergencyAccessGranteeDetailsResponse,
    EmergencyAccessGrantorDetailsResponse,
    EmergencyAccessTakeoverResponse,
    EmergencyAccessViewResponse
} from '../models/response/emergencyAccessResponse';
import { EventResponse } from '../models/response/eventResponse';
import { FolderResponse } from '../models/response/folderResponse';
import {
    GroupDetailsResponse,
    GroupResponse,
} from '../models/response/groupResponse';
import { IdentityTokenResponse } from '../models/response/identityTokenResponse';
import { IdentityTwoFactorResponse } from '../models/response/identityTwoFactorResponse';
import { ListResponse } from '../models/response/listResponse';
import { OrganizationKeysResponse } from '../models/response/organizationKeysResponse';
import { OrganizationResponse } from '../models/response/organizationResponse';
import { OrganizationSubscriptionResponse } from '../models/response/organizationSubscriptionResponse';
import { OrganizationUserBulkPublicKeyResponse } from '../models/response/organizationUserBulkPublicKeyResponse';
import { OrganizationUserBulkResponse } from '../models/response/organizationUserBulkResponse';
import {
    OrganizationUserDetailsResponse,
    OrganizationUserResetPasswordDetailsReponse,
    OrganizationUserUserDetailsResponse,
} from '../models/response/organizationUserResponse';
import { PaymentResponse } from '../models/response/paymentResponse';
import { PlanResponse } from '../models/response/planResponse';
import { PolicyResponse } from '../models/response/policyResponse';
import { PreloginResponse } from '../models/response/preloginResponse';
import { ProfileResponse } from '../models/response/profileResponse';
import { SelectionReadOnlyResponse } from '../models/response/selectionReadOnlyResponse';
import { SendAccessResponse } from '../models/response/sendAccessResponse';
import { SendFileDownloadDataResponse } from '../models/response/sendFileDownloadDataResponse';
import { SendFileUploadDataResponse } from '../models/response/sendFileUploadDataResponse';
import { SendResponse } from '../models/response/sendResponse';
import { SubscriptionResponse } from '../models/response/subscriptionResponse';
import { SyncResponse } from '../models/response/syncResponse';
import { TaxInfoResponse } from '../models/response/taxInfoResponse';
import { TaxRateResponse } from '../models/response/taxRateResponse';
import { TwoFactorAuthenticatorResponse } from '../models/response/twoFactorAuthenticatorResponse';
import { TwoFactorDuoResponse } from '../models/response/twoFactorDuoResponse';
import { TwoFactorEmailResponse } from '../models/response/twoFactorEmailResponse';
import { TwoFactorProviderResponse } from '../models/response/twoFactorProviderResponse';
import { TwoFactorRecoverResponse } from '../models/response/twoFactorRescoverResponse';
import { ChallengeResponse, TwoFactorWebAuthnResponse } from '../models/response/twoFactorWebAuthnResponse';
import { TwoFactorYubiKeyResponse } from '../models/response/twoFactorYubiKeyResponse';
import { UserKeyResponse } from '../models/response/userKeyResponse';

import { SendAccessView } from '../models/view/sendAccessView';

export abstract class ApiService {
    urlsSet: boolean;
    apiBaseUrl: string;
    identityBaseUrl: string;
    eventsBaseUrl: string;

    setUrls: (urls: EnvironmentUrls) => void;
    postIdentityToken: (request: TokenRequest) => Promise<IdentityTokenResponse | IdentityTwoFactorResponse>;
    refreshIdentityToken: () => Promise<any>;

    getProfile: () => Promise<ProfileResponse>;
    getUserBilling: () => Promise<BillingResponse>;
    getUserSubscription: () => Promise<SubscriptionResponse>;
    getTaxInfo: () => Promise<TaxInfoResponse>;
    putProfile: (request: UpdateProfileRequest) => Promise<ProfileResponse>;
    putTaxInfo: (request: TaxInfoUpdateRequest) => Promise<any>;
    postPrelogin: (request: PreloginRequest) => Promise<PreloginResponse>;
    postEmailToken: (request: EmailTokenRequest) => Promise<any>;
    postEmail: (request: EmailRequest) => Promise<any>;
    postPassword: (request: PasswordRequest) => Promise<any>;
    setPassword: (request: SetPasswordRequest) => Promise<any>;
    postSecurityStamp: (request: PasswordVerificationRequest) => Promise<any>;
    deleteAccount: (request: PasswordVerificationRequest) => Promise<any>;
    getAccountRevisionDate: () => Promise<number>;
    postPasswordHint: (request: PasswordHintRequest) => Promise<any>;
    postRegister: (request: RegisterRequest) => Promise<any>;
    postPremium: (data: FormData) => Promise<PaymentResponse>;
    postIapCheck: (request: IapCheckRequest) => Promise<any>;
    postReinstatePremium: () => Promise<any>;
    postCancelPremium: () => Promise<any>;
    postAccountStorage: (request: StorageRequest) => Promise<PaymentResponse>;
    postAccountPayment: (request: PaymentRequest) => Promise<any>;
    postAccountLicense: (data: FormData) => Promise<any>;
    postAccountKey: (request: UpdateKeyRequest) => Promise<any>;
    postAccountKeys: (request: KeysRequest) => Promise<any>;
    postAccountVerifyEmail: () => Promise<any>;
    postAccountVerifyEmailToken: (request: VerifyEmailRequest) => Promise<any>;
    postAccountVerifyPassword: (request: PasswordVerificationRequest) => Promise<any>;
    postAccountRecoverDelete: (request: DeleteRecoverRequest) => Promise<any>;
    postAccountRecoverDeleteToken: (request: VerifyDeleteRecoverRequest) => Promise<any>;
    postAccountKdf: (request: KdfRequest) => Promise<any>;
    getEnterprisePortalSignInToken: () => Promise<string>;
    postUserApiKey: (id: string, request: PasswordVerificationRequest) => Promise<ApiKeyResponse>;
    postUserRotateApiKey: (id: string, request: PasswordVerificationRequest) => Promise<ApiKeyResponse>;

    getFolder: (id: string) => Promise<FolderResponse>;
    postFolder: (request: FolderRequest) => Promise<FolderResponse>;
    putFolder: (id: string, request: FolderRequest) => Promise<FolderResponse>;
    deleteFolder: (id: string) => Promise<any>;

    getSend: (id: string) => Promise<SendResponse>;
    postSendAccess: (id: string, request: SendAccessRequest, apiUrl?: string) => Promise<SendAccessResponse>;
    getSends: () => Promise<ListResponse<SendResponse>>;
    postSend: (request: SendRequest) => Promise<SendResponse>;
    postFileTypeSend: (request: SendRequest) => Promise<SendFileUploadDataResponse>;
    postSendFile: (sendId: string, fileId: string, data: FormData) => Promise<any>;
    /**
     * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
     * This method still exists for backward compatibility with old server versions.
     */
    postSendFileLegacy: (data: FormData) => Promise<SendResponse>;
    putSend: (id: string, request: SendRequest) => Promise<SendResponse>;
    putSendRemovePassword: (id: string) => Promise<SendResponse>;
    deleteSend: (id: string) => Promise<any>;
    getSendFileDownloadData: (send: SendAccessView, request: SendAccessRequest, apiUrl?: string) => Promise<SendFileDownloadDataResponse>;
    renewSendFileUploadUrl: (sendId: string, fileId: string) => Promise<SendFileUploadDataResponse>;

    getCipher: (id: string) => Promise<CipherResponse>;
    getCipherAdmin: (id: string) => Promise<CipherResponse>;
    getAttachmentData: (cipherId: string, attachmentId: string, emergencyAccessId?: string) => Promise<AttachmentResponse>;
    getCiphersOrganization: (organizationId: string) => Promise<ListResponse<CipherResponse>>;
    postCipher: (request: CipherRequest) => Promise<CipherResponse>;
    postCipherCreate: (request: CipherCreateRequest) => Promise<CipherResponse>;
    postCipherAdmin: (request: CipherCreateRequest) => Promise<CipherResponse>;
    putCipher: (id: string, request: CipherRequest) => Promise<CipherResponse>;
    putCipherAdmin: (id: string, request: CipherRequest) => Promise<CipherResponse>;
    deleteCipher: (id: string) => Promise<any>;
    deleteCipherAdmin: (id: string) => Promise<any>;
    deleteManyCiphers: (request: CipherBulkDeleteRequest) => Promise<any>;
    deleteManyCiphersAdmin: (request: CipherBulkDeleteRequest) => Promise<any>;
    putMoveCiphers: (request: CipherBulkMoveRequest) => Promise<any>;
    putShareCipher: (id: string, request: CipherShareRequest) => Promise<CipherResponse>;
    putShareCiphers: (request: CipherBulkShareRequest) => Promise<any>;
    putCipherCollections: (id: string, request: CipherCollectionsRequest) => Promise<any>;
    putCipherCollectionsAdmin: (id: string, request: CipherCollectionsRequest) => Promise<any>;
    postPurgeCiphers: (request: PasswordVerificationRequest, organizationId?: string) => Promise<any>;
    postImportCiphers: (request: ImportCiphersRequest) => Promise<any>;
    postImportOrganizationCiphers: (organizationId: string, request: ImportOrganizationCiphersRequest) => Promise<any>;
    putDeleteCipher: (id: string) => Promise<any>;
    putDeleteCipherAdmin: (id: string) => Promise<any>;
    putDeleteManyCiphers: (request: CipherBulkDeleteRequest) => Promise<any>;
    putDeleteManyCiphersAdmin: (request: CipherBulkDeleteRequest) => Promise<any>;
    putRestoreCipher: (id: string) => Promise<CipherResponse>;
    putRestoreCipherAdmin: (id: string) => Promise<CipherResponse>;
    putRestoreManyCiphers: (request: CipherBulkRestoreRequest) => Promise<ListResponse<CipherResponse>>;

    /**
     * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
     * This method still exists for backward compatibility with old server versions.
     */
    postCipherAttachmentLegacy: (id: string, data: FormData) => Promise<CipherResponse>;
    /**
     * @deprecated Mar 25 2021: This method has been deprecated in favor of direct uploads.
     * This method still exists for backward compatibility with old server versions.
     */
    postCipherAttachmentAdminLegacy: (id: string, data: FormData) => Promise<CipherResponse>;
    postCipherAttachment: (id: string, request: AttachmentRequest) => Promise<AttachmentUploadDataResponse>;
    deleteCipherAttachment: (id: string, attachmentId: string) => Promise<any>;
    deleteCipherAttachmentAdmin: (id: string, attachmentId: string) => Promise<any>;
    postShareCipherAttachment: (id: string, attachmentId: string, data: FormData,
        organizationId: string) => Promise<any>;

    renewAttachmentUploadUrl: (id: string, attachmentId: string) => Promise<AttachmentUploadDataResponse>;
    postAttachmentFile: (id: string, attachmentId: string, data: FormData) => Promise<any>;

    getCollectionDetails: (organizationId: string, id: string) => Promise<CollectionGroupDetailsResponse>;
    getUserCollections: () => Promise<ListResponse<CollectionResponse>>;
    getCollections: (organizationId: string) => Promise<ListResponse<CollectionResponse>>;
    getCollectionUsers: (organizationId: string, id: string) => Promise<SelectionReadOnlyResponse[]>;
    postCollection: (organizationId: string, request: CollectionRequest) => Promise<CollectionResponse>;
    putCollectionUsers: (organizationId: string, id: string, request: SelectionReadOnlyRequest[]) => Promise<any>;
    putCollection: (organizationId: string, id: string, request: CollectionRequest) => Promise<CollectionResponse>;
    deleteCollection: (organizationId: string, id: string) => Promise<any>;
    deleteCollectionUser: (organizationId: string, id: string, organizationUserId: string) => Promise<any>;

    getGroupDetails: (organizationId: string, id: string) => Promise<GroupDetailsResponse>;
    getGroups: (organizationId: string) => Promise<ListResponse<GroupResponse>>;
    getGroupUsers: (organizationId: string, id: string) => Promise<string[]>;
    postGroup: (organizationId: string, request: GroupRequest) => Promise<GroupResponse>;
    putGroup: (organizationId: string, id: string, request: GroupRequest) => Promise<GroupResponse>;
    putGroupUsers: (organizationId: string, id: string, request: string[]) => Promise<any>;
    deleteGroup: (organizationId: string, id: string) => Promise<any>;
    deleteGroupUser: (organizationId: string, id: string, organizationUserId: string) => Promise<any>;

    getPolicy: (organizationId: string, type: PolicyType) => Promise<PolicyResponse>;
    getPolicies: (organizationId: string) => Promise<ListResponse<PolicyResponse>>;
    getPoliciesByToken: (organizationId: string, token: string, email: string, organizationUserId: string) =>
        Promise<ListResponse<PolicyResponse>>;

    putPolicy: (organizationId: string, type: PolicyType, request: PolicyRequest) => Promise<PolicyResponse>;

    getOrganizationUser: (organizationId: string, id: string) => Promise<OrganizationUserDetailsResponse>;
    getOrganizationUserGroups: (organizationId: string, id: string) => Promise<string[]>;
    getOrganizationUsers: (organizationId: string) => Promise<ListResponse<OrganizationUserUserDetailsResponse>>;
    getOrganizationUserResetPasswordDetails: (organizationId: string, id: string)
        => Promise<OrganizationUserResetPasswordDetailsReponse>;

    postOrganizationUserInvite: (organizationId: string, request: OrganizationUserInviteRequest) => Promise<any>;
    postOrganizationUserReinvite: (organizationId: string, id: string) => Promise<any>;
    postManyOrganizationUserReinvite: (organizationId: string, request: OrganizationUserBulkRequest) => Promise<ListResponse<OrganizationUserBulkResponse>>;
    postOrganizationUserAccept: (organizationId: string, id: string,
        request: OrganizationUserAcceptRequest) => Promise<any>;

    postOrganizationUserConfirm: (organizationId: string, id: string,
        request: OrganizationUserConfirmRequest) => Promise<any>;

    postOrganizationUsersPublicKey: (organizationId: string, request: OrganizationUserBulkRequest) =>
        Promise<ListResponse<OrganizationUserBulkPublicKeyResponse>>;

    postOrganizationUserBulkConfirm: (organizationId: string, request: OrganizationUserBulkConfirmRequest) => Promise<ListResponse<OrganizationUserBulkResponse>>;

    putOrganizationUser: (organizationId: string, id: string, request: OrganizationUserUpdateRequest) => Promise<any>;
    putOrganizationUserGroups: (organizationId: string, id: string,
        request: OrganizationUserUpdateGroupsRequest) => Promise<any>;

    putOrganizationUserResetPasswordEnrollment: (organizationId: string, userId: string,
        request: OrganizationUserResetPasswordEnrollmentRequest) => Promise<any>;

    putOrganizationUserResetPassword: (organizationId: string, id: string,
        request: OrganizationUserResetPasswordRequest) => Promise<any>;

    deleteOrganizationUser: (organizationId: string, id: string) => Promise<any>;
    deleteManyOrganizationUsers: (organizationId: string, request: OrganizationUserBulkRequest) => Promise<ListResponse<OrganizationUserBulkResponse>>;

    getSync: () => Promise<SyncResponse>;
    postImportDirectory: (organizationId: string, request: ImportDirectoryRequest) => Promise<any>;
    postPublicImportDirectory: (request: OrganizationImportRequest) => Promise<any>;

    getSettingsDomains: () => Promise<DomainsResponse>;
    putSettingsDomains: (request: UpdateDomainsRequest) => Promise<DomainsResponse>;

    getTwoFactorProviders: () => Promise<ListResponse<TwoFactorProviderResponse>>;
    getTwoFactorOrganizationProviders: (organizationId: string) => Promise<ListResponse<TwoFactorProviderResponse>>;
    getTwoFactorAuthenticator: (request: PasswordVerificationRequest) => Promise<TwoFactorAuthenticatorResponse>;
    getTwoFactorEmail: (request: PasswordVerificationRequest) => Promise<TwoFactorEmailResponse>;
    getTwoFactorDuo: (request: PasswordVerificationRequest) => Promise<TwoFactorDuoResponse>;
    getTwoFactorOrganizationDuo: (organizationId: string,
        request: PasswordVerificationRequest) => Promise<TwoFactorDuoResponse>;

    getTwoFactorYubiKey: (request: PasswordVerificationRequest) => Promise<TwoFactorYubiKeyResponse>;
    getTwoFactorWebAuthn: (request: PasswordVerificationRequest) => Promise<TwoFactorWebAuthnResponse>;
    getTwoFactorWebAuthnChallenge: (request: PasswordVerificationRequest) => Promise<ChallengeResponse>;
    getTwoFactorRecover: (request: PasswordVerificationRequest) => Promise<TwoFactorRecoverResponse>;
    putTwoFactorAuthenticator: (
        request: UpdateTwoFactorAuthenticatorRequest) => Promise<TwoFactorAuthenticatorResponse>;

    putTwoFactorEmail: (request: UpdateTwoFactorEmailRequest) => Promise<TwoFactorEmailResponse>;
    putTwoFactorDuo: (request: UpdateTwoFactorDuoRequest) => Promise<TwoFactorDuoResponse>;
    putTwoFactorOrganizationDuo: (organizationId: string,
        request: UpdateTwoFactorDuoRequest) => Promise<TwoFactorDuoResponse>;

    putTwoFactorYubiKey: (request: UpdateTwoFactorYubioOtpRequest) => Promise<TwoFactorYubiKeyResponse>;
    putTwoFactorWebAuthn: (request: UpdateTwoFactorWebAuthnRequest) => Promise<TwoFactorWebAuthnResponse>;
    deleteTwoFactorWebAuthn: (request: UpdateTwoFactorWebAuthnDeleteRequest) => Promise<TwoFactorWebAuthnResponse>;
    putTwoFactorDisable: (request: TwoFactorProviderRequest) => Promise<TwoFactorProviderResponse>;
    putTwoFactorOrganizationDisable: (organizationId: string,
        request: TwoFactorProviderRequest) => Promise<TwoFactorProviderResponse>;

    postTwoFactorRecover: (request: TwoFactorRecoveryRequest) => Promise<any>;
    postTwoFactorEmailSetup: (request: TwoFactorEmailRequest) => Promise<any>;
    postTwoFactorEmail: (request: TwoFactorEmailRequest) => Promise<any>;

    getEmergencyAccessTrusted: () => Promise<ListResponse<EmergencyAccessGranteeDetailsResponse>>;
    getEmergencyAccessGranted: () => Promise<ListResponse<EmergencyAccessGrantorDetailsResponse>>;
    getEmergencyAccess: (id: string) => Promise<EmergencyAccessGranteeDetailsResponse>;
    getEmergencyGrantorPolicies: (id: string) => Promise<ListResponse<PolicyResponse>>;
    putEmergencyAccess: (id: string, request: EmergencyAccessUpdateRequest) => Promise<any>;
    deleteEmergencyAccess: (id: string) => Promise<any>;
    postEmergencyAccessInvite: (request: EmergencyAccessInviteRequest) => Promise<any>;
    postEmergencyAccessReinvite: (id: string) => Promise<any>;
    postEmergencyAccessAccept: (id: string, request: EmergencyAccessAcceptRequest) => Promise<any>;
    postEmergencyAccessConfirm: (id: string, request: EmergencyAccessConfirmRequest) => Promise<any>;
    postEmergencyAccessInitiate: (id: string) => Promise<any>;
    postEmergencyAccessApprove: (id: string) => Promise<any>;
    postEmergencyAccessReject: (id: string) => Promise<any>;
    postEmergencyAccessTakeover: (id: string) => Promise<EmergencyAccessTakeoverResponse>;
    postEmergencyAccessPassword: (id: string, request: EmergencyAccessPasswordRequest) => Promise<any>;
    postEmergencyAccessView: (id: string) => Promise<EmergencyAccessViewResponse>;

    getOrganization: (id: string) => Promise<OrganizationResponse>;
    getOrganizationBilling: (id: string) => Promise<BillingResponse>;
    getOrganizationSubscription: (id: string) => Promise<OrganizationSubscriptionResponse>;
    getOrganizationLicense: (id: string, installationId: string) => Promise<any>;
    getOrganizationTaxInfo: (id: string) => Promise<TaxInfoResponse>;
    postOrganization: (request: OrganizationCreateRequest) => Promise<OrganizationResponse>;
    putOrganization: (id: string, request: OrganizationUpdateRequest) => Promise<OrganizationResponse>;
    putOrganizationTaxInfo: (id: string, request: OrganizationTaxInfoUpdateRequest) => Promise<any>;
    postLeaveOrganization: (id: string) => Promise<any>;
    postOrganizationLicense: (data: FormData) => Promise<OrganizationResponse>;
    postOrganizationLicenseUpdate: (id: string, data: FormData) => Promise<any>;
    postOrganizationApiKey: (id: string, request: PasswordVerificationRequest) => Promise<ApiKeyResponse>;
    postOrganizationRotateApiKey: (id: string, request: PasswordVerificationRequest) => Promise<ApiKeyResponse>;
    postOrganizationUpgrade: (id: string, request: OrganizationUpgradeRequest) => Promise<PaymentResponse>;
    postOrganizationSeat: (id: string, request: SeatRequest) => Promise<PaymentResponse>;
    postOrganizationStorage: (id: string, request: StorageRequest) => Promise<any>;
    postOrganizationPayment: (id: string, request: PaymentRequest) => Promise<any>;
    postOrganizationVerifyBank: (id: string, request: VerifyBankRequest) => Promise<any>;
    postOrganizationCancel: (id: string) => Promise<any>;
    postOrganizationReinstate: (id: string) => Promise<any>;
    deleteOrganization: (id: string, request: PasswordVerificationRequest) => Promise<any>;
    getPlans: () => Promise<ListResponse<PlanResponse>>;
    getTaxRates: () => Promise<ListResponse<TaxRateResponse>>;
    getOrganizationKeys: (id: string) => Promise<OrganizationKeysResponse>;
    postOrganizationKeys: (id: string, request: OrganizationKeysRequest) => Promise<OrganizationKeysResponse>;

    getEvents: (start: string, end: string, token: string) => Promise<ListResponse<EventResponse>>;
    getEventsCipher: (id: string, start: string, end: string, token: string) => Promise<ListResponse<EventResponse>>;
    getEventsOrganization: (id: string, start: string, end: string,
        token: string) => Promise<ListResponse<EventResponse>>;

    getEventsOrganizationUser: (organizationId: string, id: string,
        start: string, end: string, token: string) => Promise<ListResponse<EventResponse>>;

    postEventsCollect: (request: EventRequest[]) => Promise<any>;

    deleteSsoUser: (organizationId: string) => Promise<any>;
    getSsoUserIdentifier: () => Promise<string>;

    getUserPublicKey: (id: string) => Promise<UserKeyResponse>;

    getHibpBreach: (username: string) => Promise<BreachAccountResponse[]>;

    postBitPayInvoice: (request: BitPayInvoiceRequest) => Promise<string>;
    postSetupPayment: () => Promise<string>;

    getActiveBearerToken: () => Promise<string>;
    fetch: (request: Request) => Promise<Response>;
    nativeFetch: (request: Request) => Promise<Response>;

    preValidateSso: (identifier: string) => Promise<boolean>;
}
