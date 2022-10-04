export type PassportData = {
    passportID: string,
    type: string
    code: string
    fullName: string
    dob: string
    sex: string
    nationality: string,
    idNumber: string
    dateOfIssue: string
    dateOfExpiry: string
    placeOfIssue: string
    notes: string
}

export const toPassportData = (str: string) => {
    let res: PassportData = {
        passportID: "",
        type: "",
        code: "",
        fullName: "",
        dob: "",
        sex: "",
        nationality: "",
        idNumber: "",
        dateOfIssue: "",
        dateOfExpiry: "",
        placeOfIssue: "",
        notes: ""
    }
    try {
        const parsed: PassportData = JSON.parse(str)
        res = {
            ...res,
            ...parsed
        }
    } catch (e) {
    }
    return res
}
