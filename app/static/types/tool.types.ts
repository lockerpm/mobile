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
