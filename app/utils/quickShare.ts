import Config from "@/config"

export const getPublicShareUrl = (accessId: string, key: any) => {
  return `${Config.QUICK_SHARE_BASE_URL}/quick-shares/${accessId}#${encodeURIComponent(key)}`
}
