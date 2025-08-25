export type BreanchResult = {
  added_date: string
  breach_date: string
  data_classes: string[]
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
}

export type RelayAddress = {
  address: string
  created_time: number
  description: string
  domain: string
  enabled: boolean
  full_address: string
  id: number
  num_blocked: number
  num_forwarded: number
  num_replied: number
  num_spam: number
  updated_time: null
  subdomain: string
  block_spam: boolean
}

export type SubdomainData = {
  id: number
  subdomain: string
  created_time: number
  num_alias: number
  num_spam: number
  num_forwarded: number
}

export enum ScamPhoneType {
  FakePolice = "fake_police",
  FakeElectricityCompany = "fake_electricity_company",
  FakeBanking = "fake_bank_credit_securities",
  PhoneSpam = "phone_spam",
  OnlineDelivery = "online_delivery",
  FakePrize = "fake_ads_prize",
  Other = "other",
}

export type ScamLookupResult = {
  result: {
    data_sources: any[]
    id: string
    phishing_type: ScamPhoneType
    reports: number
    status: string
    target_entity: null
    type: ScamType
    value: string
    value_information: any
  }
}

export enum ScamType {
  Phone = "phone",
  Url = "url",
}

export type ScamMyReportParams = {
  type: ScamType
  value: string
  description: string
  phishing_type: string
  target_entity: string
  is_anonymous: boolean
}

export type ScamMyReportData = {
  created_time: number
  description: string
  id: string
  is_anonymous: boolean
  phishing_type: string
  type: ScamType
  user: any
  value: string
}
