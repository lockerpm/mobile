export type CitizenIdData = {
    idNo: string,
    fullName: string
    dob: string
    sex: string
    nationality: string
    placeOfOrigin: string
    placeOfResidence: string
    expiryDate: string
    personalId: string
    dateOfIssue: string
    issueBy: string
    notes: string
}

export const toCitizenIdData = (str: string) => {
    let res: CitizenIdData = {
        idNo: "",
        fullName: "",
        dob: "",
        sex: "",
        nationality: "",
        placeOfOrigin: "",
        placeOfResidence: "",
        expiryDate: "",
        personalId: "",
        dateOfIssue: "",
        issueBy: "",
        notes: ""
    }
    try {
        const parsed: CitizenIdData = JSON.parse(str)
        res = {
            ...res,
            ...parsed
        }
    } catch (e) {
    }
    return res
}
