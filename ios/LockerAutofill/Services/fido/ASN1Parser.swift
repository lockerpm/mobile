import Foundation
import Security

struct RSAComponents {
    let modulus: Data
    let exponent: Data
}

enum RSAParseError: Error {
    case exportFailed
    case invalidASN1
    case parseError(String)
}

func extractRSAComponents(from publicKey: SecKey) throws -> RSAComponents {
    // Export the key in DER SubjectPublicKeyInfo format
    guard let pubRaw = SecKeyCopyExternalRepresentation(publicKey, nil) as Data? else {
        throw RSAParseError.exportFailed
    }
    
    // Parse ASN.1
    let top = try parseASN1(pubRaw)              // SubjectPublicKeyInfo (SEQUENCE)
    guard top.sub.count >= 2 else {
        throw RSAParseError.invalidASN1
    }
    
    let bitString = top.sub[1]                   // subjectPublicKey (BIT STRING)
    // BIT STRING starts with 0x00 padding byte → drop it
    let rsaData = bitString.data.dropFirst()
    
    let rsaKey = try parseASN1(rsaData)          // RSAPublicKey (SEQUENCE)
    guard rsaKey.sub.count == 2 else {
        throw RSAParseError.invalidASN1
    }
    
    var modulus = rsaKey.sub[0].data             // INTEGER n
    let exponent = rsaKey.sub[1].data            // INTEGER e
    
    // Strip leading 0x00 if modulus starts with padding
    if modulus.first == 0x00 { modulus = modulus.dropFirst() }
    
    return RSAComponents(modulus: modulus, exponent: exponent)
}

struct ASN1Object {
    var tag: UInt8
    var length: Int
    var data: Data
    var sub: [ASN1Object] = []
}

func parseASN1(_ data: Data) throws -> ASN1Object {
    var offset = 0
    return try parseOne(data, &offset)
}

private func parseOne(_ data: Data, _ offset: inout Int) throws -> ASN1Object {
    guard offset < data.count else {
        throw RSAParseError.parseError("Unexpected end of data")
    }
    let tag = data[offset]
    offset += 1
    
    guard offset < data.count else {
        throw RSAParseError.parseError("Invalid length encoding")
    }
    var length = Int(data[offset])
    offset += 1
    
    if length & 0x80 != 0 {
        let count = length & 0x7F
        length = 0
        for _ in 0..<count {
            guard offset < data.count else {
                throw RSAParseError.parseError("Length exceeds data size")
            }
            length = (length << 8) | Int(data[offset])
            offset += 1
        }
    }
    
    guard offset + length <= data.count else {
        throw RSAParseError.parseError("Invalid ASN.1 length")
    }
    
    let subdata = data.subdata(in: offset ..< offset+length)
    offset += length
    
    var obj = ASN1Object(tag: tag, length: length, data: subdata)
    
    // SEQUENCE (0x30) means nested objects
    if tag == 0x30 {
        var innerOffset = 0
        while innerOffset < subdata.count {
            let child = try parseOne(subdata, &innerOffset)
            obj.sub.append(child)
        }
    }
    
    return obj
}
