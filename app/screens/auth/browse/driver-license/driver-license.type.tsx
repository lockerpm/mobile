export type DriverLicenseData = {
    idNO: string,
    fullName: string
    dob: string
    address: string
    nationality: string
    class: string
    validUntil: string,
    vehicleClass: string
    beginningDate: string
    issuedBy: string
    notes: string
}

export const toDriverLicenseData = (str: string) => {
    let res: DriverLicenseData = {
        idNO: "",
        fullName: "",
        dob: "",
        address: "",
        nationality: "",
        class: "",
        validUntil: "",
        vehicleClass: "",
        beginningDate: "",
        issuedBy: "",
        notes: ""
    }
    try {
        const parsed: DriverLicenseData = JSON.parse(str)
        res = {
            ...res,
            ...parsed
        }
    } catch (e) {
    }
    return res
}
