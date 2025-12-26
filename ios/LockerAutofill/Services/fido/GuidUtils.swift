//
//  UuidUtils.swift
//  Locker
//
//  Created by Nguyen Thinh on 9/12/25.
//
import Foundation

// MARK: - TS-equivalent GUID utilities wrapped in a struct

struct GuidUtils {
  // TS: static newGuid(): string { ... }
  static func newGuid() -> String {
    var chars: [Character] = []
    chars.reserveCapacity(36)

    // Template: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    let template = Array("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
    for c in template {
      switch c {
      case "x":
        // r = (Math.random() * 16) | 0  -> 0...15 uniform
        let r = Int.random(in: 0..<16)
        chars.append(Character(String(r, radix: 16)))
      case "y":
        // v = (r & 0x3) | 0x8  -> 8..11
        let r = Int.random(in: 0..<16)
        let v = (r & 0x3) | 0x8
        chars.append(Character(String(v, radix: 16)))
      default:
        // keep hyphens and the literal "4" as-is
        chars.append(c)
      }
    }

    // Ensure lowercase like TS .toString(16)
    return String(chars).lowercased()
  }

  // TS: static guidRegex = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/
  private static let guidPattern = #"^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$"#

  // Precompiled case-insensitive regex (TS RegExp(..., "i"))
  private static let guidRegex: NSRegularExpression = {
    try! NSRegularExpression(pattern: guidPattern, options: [.caseInsensitive])
  }()

  // TS: static isGuid(id: string) { return RegExp(Utils.guidRegex, "i").test(id) }
  static func isGuid(_ id: String) -> Bool {
    let range = NSRange(id.startIndex..<id.endIndex, in: id)
    return guidRegex.firstMatch(in: id, options: [], range: range) != nil
  }
  
  /** Convert standard format (XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX) UUID to raw 16 byte array. */
  static func guidToRawFormat(_ guid: String) throws -> Data {
    guard isGuid(guid) else {
      throw NSError(domain: "GUID", code: 1, userInfo: [NSLocalizedDescriptionKey: "GUID parameter is invalid"])
    }

    // Helper to parse hex substring into UInt64
    func parseHex<S: StringProtocol>(_ s: S) throws -> UInt64 {
      guard let v = UInt64(s, radix: 16) else {
        throw NSError(domain: "GUID", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid hex in GUID"])
      }
      return v
    }

    var arr = [UInt8](repeating: 0, count: 16)

    // Indices for slices
    let s = guid

    // ########-....-....-....-............
    let p0 = s.index(s.startIndex, offsetBy: 0)
    let p8 = s.index(s.startIndex, offsetBy: 8)
    var v32 = UInt32(try parseHex(s[p0..<p8]))
    arr[0] = UInt8((v32 >> 24) & 0xff)
    arr[1] = UInt8((v32 >> 16) & 0xff)
    arr[2] = UInt8((v32 >> 8) & 0xff)
    arr[3] = UInt8(v32 & 0xff)

    // ........-####-....-....-............
    let p9 = s.index(s.startIndex, offsetBy: 9)
    let p13 = s.index(s.startIndex, offsetBy: 13)
    var v16 = UInt16(try parseHex(s[p9..<p13]))
    arr[4] = UInt8((v16 >> 8) & 0xff)
    arr[5] = UInt8(v16 & 0xff)

    // ........-....-####-....-............
    let p14 = s.index(s.startIndex, offsetBy: 14)
    let p18 = s.index(s.startIndex, offsetBy: 18)
    v16 = UInt16(try parseHex(s[p14..<p18]))
    arr[6] = UInt8((v16 >> 8) & 0xff)
    arr[7] = UInt8(v16 & 0xff)

    // ........-....-....-####-............
    let p19 = s.index(s.startIndex, offsetBy: 19)
    let p23 = s.index(s.startIndex, offsetBy: 23)
    v16 = UInt16(try parseHex(s[p19..<p23]))
    arr[8] = UInt8((v16 >> 8) & 0xff)
    arr[9] = UInt8(v16 & 0xff)

    // ........-....-....-....-############
    let p24 = s.index(s.startIndex, offsetBy: 24)
    let p36 = s.index(s.startIndex, offsetBy: 36)
    let v64 = try parseHex(s[p24..<p36]) // 12 hex digits => 48 bits max

    // Use division for high-order bytes to mirror JS behavior and avoid 32-bit truncation
    arr[10] = UInt8((v64 / 0x10000000000) & 0xff) // 2^40
    arr[11] = UInt8((v64 / 0x100000000) & 0xff)   // 2^32
    arr[12] = UInt8((v64 >> 24) & 0xff)
    arr[13] = UInt8((v64 >> 16) & 0xff)
    arr[14] = UInt8((v64 >> 8) & 0xff)
    arr[15] = UInt8(v64 & 0xff)

    return Data(arr)
  }

  /** Convert raw 16 byte array to standard format (XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX) UUID. */
  static func guidToStandardFormat(_ raw: Data) throws -> String {
    guard raw.count == 16 else {
      throw NSError(domain: "GUID", code: 3, userInfo: [NSLocalizedDescriptionKey: "Raw GUID must be 16 bytes"])
    }
    let a = [UInt8](raw)

    @inline(__always) func hex2(_ b: UInt8) -> String {
      let digits = Array("0123456789abcdef".utf8)
      let hi = digits[Int(b >> 4)]
      let lo = digits[Int(b & 0x0f)]
      return String(bytes: [hi, lo], encoding: .utf8)!
    }

    let guid =
      hex2(a[0]) + hex2(a[1]) + hex2(a[2]) + hex2(a[3]) + "-" +
      hex2(a[4]) + hex2(a[5]) + "-" +
      hex2(a[6]) + hex2(a[7]) + "-" +
      hex2(a[8]) + hex2(a[9]) + "-" +
      hex2(a[10]) + hex2(a[11]) + hex2(a[12]) + hex2(a[13]) + hex2(a[14]) + hex2(a[15])

    // Validate using your Utils.isGuid (not Foundation UUID)
    guard isGuid(guid) else {
      throw NSError(domain: "GUID", code: 4, userInfo: [NSLocalizedDescriptionKey: "Converted GUID is invalid"])
    }
    return guid
  }

}

