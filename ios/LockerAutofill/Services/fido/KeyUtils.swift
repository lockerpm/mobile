import Foundation
import CryptoKit


// Tiny ASN.1 DER builder helpers (robust)
enum ASN1 {
  static func makeLength(_ length: Int) -> Data {
    if length < 0x80 {
      return Data([UInt8(length)])
    }
    var x = length
    var bytes: [UInt8] = []
    while x > 0 {
      bytes.insert(UInt8(x & 0xff), at: 0)
      x >>= 8
    }
    return Data([0x80 | UInt8(bytes.count)] + bytes)
  }
  
  static func sequence(_ parts: [Data]) -> Data {
    let body = parts.reduce(Data(), +)
    var d = Data([0x30])
    d.append(makeLength(body.count))
    d.append(body)
    return d
  }
  
  static func integer(_ v: Int) -> Data {
    var v = v
    var bytes: [UInt8] = []
    repeat {
      bytes.insert(UInt8(v & 0xff), at: 0)
      v >>= 8
    } while v > 0
    if bytes.isEmpty { bytes = [0x00] }
    if bytes[0] & 0x80 != 0 { bytes.insert(0x00, at: 0) } // ensure positive
    var d = Data([0x02])
    d.append(makeLength(bytes.count))
    d.append(contentsOf: bytes)
    return d
  }
  
  static func octetString(_ data: Data) -> Data {
    var d = Data([0x04])
    d.append(makeLength(data.count))
    d.append(data)
    return d
  }
  
  static func bitString(_ data: Data) -> Data {
    // prepend unused bits byte = 0x00
    var content = Data([0x00])
    content.append(data)
    var d = Data([0x03])
    d.append(makeLength(content.count))
    d.append(content)
    return d
  }
  
  static func oid(from dotted: String) -> Data {
    let parts = dotted.split(separator: ".").map { Int($0)! }
    var body = Data()
    body.append(UInt8(parts[0] * 40 + parts[1]))
    for p in parts.dropFirst(2) {
      var val = p
      var stack: [UInt8] = []
      repeat {
        stack.append(UInt8(val & 0x7f))
        val >>= 7
      } while val > 0
      for i in (0..<stack.count).reversed() {
        let byte = stack[i] | (i == 0 ? 0x00 : 0x80)
        body.append(byte)
      }
    }
    var d = Data([0x06])
    d.append(makeLength(body.count))
    d.append(body)
    return d
  }
  
  static func contextExplicit(tag: UInt8, _ inner: Data) -> Data {
    var d = Data([0xA0 + tag]) // small tags only
    d.append(makeLength(inner.count))
    d.append(inner)
    return d
  }
}

// Final function: export P256 private -> PKCS#8 compatible with WebCrypto
func exportP256ToPKCS8(_ privateKey: P256.Signing.PrivateKey) -> Data {
  let privScalar = privateKey.rawRepresentation                 // 32 bytes
  let pubX963 = privateKey.publicKey.x963Representation         // 65 bytes (0x04||X||Y)
  
  // ECPrivateKey (RFC5915): SEQ { INTEGER 1, OCTET STRING priv, [0] params OPTIONAL, [1] pub OPTIONAL }
  let ver = ASN1.integer(1)
  let privOctet = ASN1.octetString(privScalar)
  
  // parameters OID prime256v1
  let oidPrime = ASN1.oid(from: "1.2.840.10045.3.1.7")
  let paramsCtx = ASN1.contextExplicit(tag: 0, oidPrime)
  
  // publicKey [1] EXPLICIT BIT STRING (contains 0x04||X||Y)
  let pubBitStr = ASN1.bitString(pubX963)
  let pubCtx = ASN1.contextExplicit(tag: 1, pubBitStr)
  
  let ecPrivateSeq = ASN1.sequence([ver, privOctet, paramsCtx, pubCtx])
  
  // PrivateKeyInfo (PKCS#8)
  let pkcs8Ver = ASN1.integer(0)
  let oidEcPub = ASN1.oid(from: "1.2.840.10045.2.1")
  let algId = ASN1.sequence([oidEcPub, oidPrime])
  let privKeyOctet = ASN1.octetString(ecPrivateSeq)
  
  let pkcs8 = ASN1.sequence([pkcs8Ver, algId, privKeyOctet])
  
  return pkcs8
}


// Extract 32-byte private scalar from inner ECPrivateKey
func extractPrivateScalar(from pkcs8: Data) -> Data? {
  let bytes = [UInt8](pkcs8)
  var i = 0
  while i + 34 <= bytes.count {
    if bytes[i] == 0x04 && bytes[i+1] == 0x20 { // OCTET STRING length 32
      return Data(bytes[(i+2)..<(i+34)])
    }
    i += 1
  }
  return nil
}

// Main: WebCrypto PKCS8 Base64URL -> CryptoKit P256.Signing.PrivateKey
func fromPKCS8ToP256(_ pkcs8: Data) -> P256.Signing.PrivateKey? {
  guard let scalar = extractPrivateScalar(from: pkcs8) else { return nil }
  
  do {
    return try P256.Signing.PrivateKey(rawRepresentation: scalar)
  } catch {
    return nil
  }
}
