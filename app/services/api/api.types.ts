import { GeneralApiProblem } from "./api-problem"
import { UserSnapshot } from "../../models/user/user"
import { DeviceType } from "../../../core/enums"
import { SyncResponse } from "../../../core/models/response/syncResponse"
import { FolderResponse } from "../../../core/models/response/folderResponse"
import { CollectionResponse } from "../../../core/models/response/collectionResponse"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { FolderRequest } from "../../../core/models/request/folderRequest"
import { CipherResponse } from "../../../core/models/response/cipherResponse"
import { AccountRoleText, InvitationStatus, SharingStatus, SharingType } from "../../config/types"
import { ProfileResponse } from "../../../core/models/response/profileResponse"
import { ProfileOrganizationResponse } from "../../../core/models/response/profileOrganizationResponse"

type SessionSnapshot = {
    access_token: string
    refresh_token: string
    key: string
    private_key: string
}

export type PolicyType = {
    avoid_ambiguous_character: boolean
    block_mobile: boolean
    failed_login_attempts: number | null
    failed_login_block_time: number | null
    failed_login_duration: number | null
    failed_login_owner_email: boolean
    ip_allow: string[]
    ip_block: string[]
    max_password_length: number | null
    min_password_length: number | null
    password_composition: boolean
    require_digit: boolean
    require_lower_case: boolean
    require_special_character: boolean
    require_upper_case: boolean
    team: {
        id: string
        name: string
    }
}

export type SharingInvitationType = {
    access_time: number
    cipher_type: number
    id: string
    item_type: string
    owner: {
        email: string
        full_name: string
    }
    role: AccountRoleText
    share_type: SharingType
    status: SharingStatus
    hide_passwords: boolean
    team: {
        id: string
        name: string
        organization_id: string
    }
}

export type SharedMemberType = {
    access_time: string
    avatar: string
    email: string
    full_name: string
    hide_passwords: boolean
    id: string
    pwd_user_id: string
    role: AccountRoleText
    share_type: SharingType
    status: SharingStatus
    username: string
}

export type MyShareType = {
    id: string
    description: string
    name: string
    organization_id: string
    members: SharedMemberType[]
}

// ------------------ Response ------------------------

export type LoginResult = { 
    kind: "ok"
    data: {
        token?: string
        is_factor2?: boolean
        methods?: {
            type: string
            data: any
        }[]
    }
} | GeneralApiProblem

export type GetPMTokenResult = { 
    kind: "ok"
    data: {
        url: string
        access_token: string

        // Clone data here to hide error
        // These data actually not exists
        is_factor2?: boolean
        methods?: {
            type: string
            data: any
        }[]
    }
} | GeneralApiProblem

export type SocialLoginResult = { 
    kind: "ok"
    data: {
        token: string
    }
} | GeneralApiProblem

export type AccountRecoveryResult = { 
    kind: "ok"
    data: {
        type: string
        data: any
    }[] 
} | GeneralApiProblem

export type SessionLoginResult = { kind: "ok"; data: SessionSnapshot } | GeneralApiProblem
export type GetUserResult = { kind: "ok"; user: UserSnapshot } | GeneralApiProblem
export type EmptyResult = { kind: "ok" } | GeneralApiProblem
export type SyncResult = { kind: "ok", data: SyncResponse } | GeneralApiProblem
export type GetCipherResult = { kind: "ok", data: CipherResponse } | GeneralApiProblem
export type GetFolderResult = { kind: "ok", data: FolderResponse } | GeneralApiProblem
export type GetOrganizationResult = { kind: "ok", data: ProfileOrganizationResponse } | GeneralApiProblem
export type PostFolderResult = { kind: 'ok', data: FolderResponse } | GeneralApiProblem
export type PostCollectionResult = { kind: 'ok', data: CollectionResponse } | GeneralApiProblem
export type GetProfileResult = { kind: "ok", data: ProfileResponse } | GeneralApiProblem

export type GetTeamsResult = { 
    kind: 'ok', 
    teams: object[] 
} | GeneralApiProblem

export type GetPlanResult = {
    kind: 'ok'
    data: {
        name: string,
        alias: string
    }
} | GeneralApiProblem

export type EmailOtpResult = { kind: "ok"; success: boolean } | GeneralApiProblem
export type ResetPasswordResult = { kind: "ok"; success: boolean } | GeneralApiProblem

export type ResetPasswordWithCodeResult = {
    kind: "ok" 
    data: {
        reset_password_url: string
    } 
} | GeneralApiProblem

export type GetInvitationsResult = {
    kind: "ok"
    data: {
        access_time: number
        id: string
        role: AccountRoleText
        status: InvitationStatus
        team: {
            id: string
            name: string
            organization_id: string
        }
    }[]
} | GeneralApiProblem

export type CheckBreachResult = {
    kind: "ok"
    data: {
        added_date: string
        breach_date: string
        data_clases: string[]
        description: string
        domain: string
        is_fabricated: boolean
        is_retired: boolean
        is_sensitive: boolean
        is_spam_list: boolean
        is_verified: boolean
        logo_path: string
        modified_date: string
        name: string
        pwn_count: number
        title: string
    }[]
} | GeneralApiProblem

export type GetPolicyResult = {
    kind: 'ok',
    data: PolicyType
} | GeneralApiProblem

export type GetLastUpdateResult = {
    kind: 'ok',
    data: {
        revision_date: number
    }
} | GeneralApiProblem

export type GetSharingPublicKeyResult = {
    kind: 'ok',
    data: {
        public_key: string
    }
} | GeneralApiProblem

export type ShareCipherResult = {
    kind: 'ok',
    data: {
        id: string      // organizationId
    }
} | GeneralApiProblem

export type GetShareInvitationsResult = {
    kind: 'ok',
    data: SharingInvitationType[]
} | GeneralApiProblem

export type GetMySharesResult = {
    kind: 'ok',
    data: MyShareType[]
} | GeneralApiProblem

// ---------------- Request data --------------------

export type LoginData = {
    username: string
    password: string
    method?: string
    otp?: string
    save_device?: boolean
}

export type GetPMTokenData = {
    SERVICE_URL: '/'
    SERVICE_SCOPE: 'pwdmanager'
    CLIENT: 'mobile'
}

export type RegisterData = {
    email: string
    password: string
    confirm_password: string
    full_name: string
    country: string
    phone?: string
    keep_me_updated?: boolean
}

export type SessionLoginData = {
    client_id: 'mobile'
    password: string
    device_name: string
    device_type: DeviceType
    device_identifier: string
}

export type RegisterLockerData = {
    name: string,
    email: string,
    master_password_hash: string,
    master_password_hint: string,
    key: string,
    kdf: number,
    kdf_iterations: number,
    reference_data: string,
    keys: {
        public_key: string,
        encrypted_private_key: string
    },
    score: number
}

export type ChangePasswordData = {
    key: string,
    new_master_password_hash: string,
    master_password_hash: string
}

export type PasswordHintRequestData = {
    email: string
}

export type EmailOtpRequestData = {
    username: string
    password: string
}

export type LoginUri = {
    match: string | null,
    response: string | null,
    uri: string | null
}

export type MoveFolderData = {
    ids: string[],
    folderId: string
}

export type CipherData = {
    collectionIds: string[] | null,
    organizationId: string | null,
    folderId: string | null,
    favorite: boolean,
    fields: {
        name: string,
        response: string | null,
        types: number | null,
        value: string
    },
    score: number | 0,
    name: string,
    notes: string | null,
    type: number,
    login: {
        username: string | null,
        password: string | null,
        totp: string | null,
        response: string | null,
        uris: LoginUri[] | null
    } | null,
    secureNote: {
        type: number,
        response: string | null
    } | null,
    card: {
        brand: string | null,
        cardholderName: string | null,
        code: string | null,
        expMonth: string | null,
        expYear: string | null,
        number: string | null,
        response: string | null
    } | null,
    identity: {
        address1: string | null,
        address2: string | null,
        address3: string | null,
        city: string | null,
        company: string | null,
        country: string | null,
        email: string | null,
        firstName: string | null,
        middleName: string | null,
        lastName: string | null,
        licenseNumber: string | null,
        postalCode: string | null,
        phone: string | null,
        passportNumber: string | null,
        response: string | null,
        ssn: string | null,
        state: string | null,
        title: string | null,
        username: string | null
    } | null
}

export type ImportCipherData = {
    ciphers: CipherRequest[]
    folders: FolderRequest[]
    folderRelationships: {
        key: number
        value: number
    }[]
}

export type FeedbackData = {
    type: 'feedback' | 'support',
    description: string
}

export type UpdateFCMData = {
    fcm_id: string
    device_identifier: string
}

export type GetSharingPublicKeyData = {
    email: string
}

export type ShareCipherData = {
    cipher: CipherRequest & { id: string }
    sharing_key: string
    members: {
        username: string
        role: AccountRoleText
        key: string
        hide_passwords: boolean
    }[]
}

export type ShareInvitationResponseData = {
    status: 'accept' | 'reject'
}

export type StopShareCipherData = {
    cipher: CipherRequest & { id: string }
}

export type EditShareCipherData = {
    role: AccountRoleText
    hide_passwords: boolean
}
