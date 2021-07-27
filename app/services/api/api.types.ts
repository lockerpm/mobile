import { GeneralApiProblem } from "./api-problem"
import { UserSnapshot } from "../../models/user/user"


export type GetUserResult = { kind: "ok"; user: UserSnapshot } | GeneralApiProblem
