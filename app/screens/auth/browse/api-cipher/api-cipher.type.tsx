export enum API_METHODS {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
    OPTIONS = 'options'
}

export type ApiCipherData = {
    url: string,
    method: API_METHODS
    header: string
    bodyData: string
    response: string
    notes: string
}

export const toApiCipherData = (str: string) => {
    let res: ApiCipherData = {
      url: "",
      method: API_METHODS.GET,
      header: "",
      bodyData: "",
      response: "",
      notes: ""
    }
    try {
        const parsed: ApiCipherData = JSON.parse(str)
        res = {
            ...res,
            ...parsed
        }
    } catch (e) {
    }
    return res
}
