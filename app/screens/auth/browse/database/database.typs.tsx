export type DatabaseData = {
    host: string,
    port: string
    username: string
    password: string
    default: string
    notes: string
}

export const toDatabaseData = (str: string) => {
    let res: DatabaseData = {
        host: "",
        port: "",
        username: "",
        password: "",
        default: "",
        notes: ""
    }
    try {
        const parsed: DatabaseData = JSON.parse(str)
        res = {
            ...res,
            ...parsed
        }
    } catch (e) {
    }
    return res
}
