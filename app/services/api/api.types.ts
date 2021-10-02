import { GeneralApiProblem } from "./api-problem"
import { UserSnapshot } from "../../models/user/user"
import { DeviceType } from "../../../core/enums"
import { SyncResponse } from "../../../core/models/response/syncResponse"
import { FolderResponse } from "../../../core/models/response/folderResponse"

type SessionSnapshot = {
    access_token: string
    refresh_token: string
    key: string
    private_key: string
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
export type GetTeamsResult = { kind: 'ok', teams: object[] } | GeneralApiProblem
export type PostFolderResult = { kind: 'ok', data: FolderResponse } | GeneralApiProblem
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

// ---------------- Request data --------------------

export type LoginData = {
    username: string
    password: string
    method?: string
    otp?: string
    save_device?: boolean
}

export type SessionLoginData = {
    client_id: 'mobile'
    password: string
    device_name: string
    device_type: DeviceType
    device_identifier: string
}

export type RegisterData = {
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
