import { GeneralApiProblem } from "./api-problem"
import { UserSnapshot } from "../../models/user/user"
import { DeviceType } from "../../../core/enums"
import { SyncResponse } from "../../../core/models/response/syncResponse"

type SessionSnapshot = {
    access_token: string
    refresh_token: string
    key: string
    private_key: string
}

// Response
export type SessionLoginResult = { kind: "ok"; data: SessionSnapshot } | GeneralApiProblem
export type GetUserResult = { kind: "ok"; user: UserSnapshot } | GeneralApiProblem
export type EmptyResult = { kind: "ok" } | GeneralApiProblem
export type SyncResult = { kind: "ok", data: SyncResponse } | GeneralApiProblem

// Request data
export type SessionLoginData = {
    client_id: 'mobile'
    password: string
    device_name: string
    device_type: DeviceType
    device_identifier: string
}