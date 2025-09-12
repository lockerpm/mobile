import { parse } from "tldts"

export function isValidRpId(rpId: string, origin: string) {
  const parsedOrigin = parse(origin, { allowPrivateDomains: true })
  const parsedRpId = parse(rpId, { allowPrivateDomains: true })

  // Handle localhost case (no domain)
  const isLocalhostValid =
    parsedOrigin.domain == null &&
    parsedOrigin.hostname === parsedRpId.hostname &&
    parsedOrigin.hostname === "localhost"

  // Handle domain case with subdomain validation
  const isDomainValid =
    parsedOrigin.domain != null &&
    parsedOrigin.domain === parsedRpId.domain &&
    parsedOrigin.subdomain != null &&
    parsedRpId.subdomain != null &&
    parsedOrigin.subdomain.endsWith(parsedRpId.subdomain)

  return isLocalhostValid || isDomainValid
}
