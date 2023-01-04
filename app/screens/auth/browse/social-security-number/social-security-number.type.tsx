export type SocialSecurityNumberData = {
  fullName: string,
  socialSecurityNumber: string
  dateOfIssue: string
  contry: string
  notes: string
}

export const toSocialSecurityNumberData = (str: string) => {
  let res: SocialSecurityNumberData = {
    fullName: "",
    socialSecurityNumber: "",
    dateOfIssue: "",
    contry: "",
    notes: ""
  }
  try {
    const parsed: SocialSecurityNumberData = JSON.parse(str)
    res = {
      ...res,
      ...parsed
    }
  } catch (e) {
  }
  return res
}
