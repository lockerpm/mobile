//
//  RSAUtils.swift
//  CyStackLocker
//
//  Created by Nguyen Thinh on 29/03/2022.
//

import UIKit
import Security

class RSAUtils: NSObject {
    
    public class RSAUtilsError: NSError {
        init(_ message: String) {
            super.init(domain: "com.cystack.lockerapp.RSAUtils", code: 500, userInfo: [
                NSLocalizedDescriptionKey: message
                ])
        }
        
        @available(*, unavailable)
        required public init?(coder aDecoder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }
    }
    
    public func base64Decode(_ strBase64: String) -> Data {
        
        let data = Data(base64Encoded: strBase64, options: [])
        return data!
        
    }
  
    public func base64KeyToSecKey(_ keyBase64: String) -> SecKey? {
      let keyData = Data(base64Encoded: keyBase64)!
      let key = SecKeyCreateWithData(keyData as NSData, [
          kSecAttrKeyType: kSecAttrKeyTypeRSA,
          kSecAttrKeyClass: kSecAttrKeyClassPrivate,
      ] as NSDictionary, nil)!
      return key
    }
 
  
    public func addRSAPublicKey(_ pubkeyBase64: String, tagName: String) throws -> SecKey? {
        
        let regExp = try! NSRegularExpression(pattern: "(-----BEGIN.*?-----)|(-----END.*?-----)|\\s+", options: [])
        
        let myPubkeyBase64 = regExp.stringByReplacingMatches(in: pubkeyBase64, options: [], range: NSRange(location: 0, length: pubkeyBase64.count), withTemplate: "")
        
        return try addRSAPublicKey(base64Decode(myPubkeyBase64), tagName: tagName)
        
    }
    
    private func addRSAPublicKey(_ pubkey: Data, tagName: String) throws -> SecKey? {
        
        // Delete any old lingering key with the same tag
        deleteRSAKeyFromKeychain(tagName)
        
        let pubkeyData = try stripPublicKeyHeader(pubkey)
        if ( pubkeyData == nil ) {
            return nil
        }
        
        // Add persistent version of the key to system keychain
        //var prt1: Unmanaged<AnyObject>?
        let queryFilter: [String : Any] = [
            (kSecClass as String)              : kSecClassKey,
            (kSecAttrKeyType as String)        : kSecAttrKeyTypeRSA,
            (kSecAttrApplicationTag as String) : tagName,
            (kSecValueData as String)          : pubkeyData!,
            (kSecAttrKeyClass as String)       : kSecAttrKeyClassPublic,
            (kSecReturnPersistentRef as String): true
            ] as [String : Any]
        let result = SecItemAdd(queryFilter as CFDictionary, nil)
        if ((result != noErr) && (result != errSecDuplicateItem)) {
            return nil
        }
        
        return getRSAKeyFromKeychain(tagName)
    }
    
    private func stripPublicKeyHeader(_ pubkey: Data) throws -> Data? {
        if ( pubkey.count == 0 ) {
            return nil
        }
        
        var keyAsArray = [UInt8](repeating: 0, count: pubkey.count / MemoryLayout<UInt8>.size)
        (pubkey as NSData).getBytes(&keyAsArray, length: pubkey.count)
        
        var idx = 0
        if (keyAsArray[idx] != 0x30) {
            throw RSAUtilsError("Provided key doesn't have a valid ASN.1 structure (first byte should be 0x30).")
            //return nil
        }
        idx += 1
        
        if (keyAsArray[idx] > 0x80) {
            idx += Int(keyAsArray[idx]) - 0x80 + 1
        } else {
            idx += 1
        }
        
        /*
         * If current byte is 0x02, it means the key doesn't have a X509 header (it contains only modulo & public exponent). In this case, we can just return the provided DER data as is
         */
        if (Int(keyAsArray[idx]) == 0x02) {
            return pubkey
        }
        
        let seqiod = [UInt8](arrayLiteral: 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00)
        
        for i in idx..<idx+seqiod.count {
            if ( keyAsArray[i] != seqiod[i-idx] ) {
                throw RSAUtilsError("Provided key doesn't have a valid X509 header.")
                //return nil
            }
        }
        idx += seqiod.count
        
        if (keyAsArray[idx] != 0x03) {
            throw RSAUtilsError("Invalid byte at index \(idx) (\(keyAsArray[idx])) for public key header.")
            //return nil
        }
        idx += 1
        
        if (keyAsArray[idx] > 0x80) {
            idx += Int(keyAsArray[idx]) - 0x80 + 1;
        } else {
            idx += 1
        }
        
        if (keyAsArray[idx] != 0x00) {
            throw RSAUtilsError("Invalid byte at index \(idx) (\(keyAsArray[idx])) for public key header.")
            //return nil
        }
        idx += 1
        return pubkey.subdata(in: idx..<keyAsArray.count)
        //return pubkey.subdata(in: NSMakeRange(idx, keyAsArray.count - idx).toRange()!)
    }
    
    
    //MARK: Private KEY
    public func addRSAPrivateKey(_ privkeyBase64: String, tagName: String) throws -> SecKey? {
        let fullRange = NSRange(location: 0, length: privkeyBase64.count)
        let regExp = try! NSRegularExpression(pattern: "(-----BEGIN.*?-----)|(-----END.*?-----)|\\s+", options: [])
        let myPrivkeyBase64 = regExp.stringByReplacingMatches(in: privkeyBase64, options: [], range: fullRange, withTemplate: "")
        return try addRSAPrivateKey(base64Decode(myPrivkeyBase64), tagName: tagName)
    }
    
    private func addRSAPrivateKey(_ privkey: Data, tagName: String) throws -> SecKey? {
        // Delete any old lingering key with the same tag
        deleteRSAKeyFromKeychain(tagName)
        
        let privkeyData = try stripPrivateKeyHeader(privkey)
        if ( privkeyData == nil ) {
            return nil
        }
        
        // Add persistent version of the key to system keychain
        let queryFilter: [String : Any] = [
            (kSecClass as String)              : kSecClassKey,
            (kSecAttrKeyType as String)        : kSecAttrKeyTypeRSA,
            (kSecAttrApplicationTag as String) : tagName,
            //(kSecAttrAccessible as String)     : kSecAttrAccessibleWhenUnlocked,
            (kSecValueData as String)          : privkeyData!,
            (kSecAttrKeyClass as String)       : kSecAttrKeyClassPrivate,
            (kSecReturnPersistentRef as String): true
            ] as [String : Any]
        let result = SecItemAdd(queryFilter as CFDictionary, nil)
        if ((result != noErr) && (result != errSecDuplicateItem)) {
            NSLog("Cannot add key to keychain, status \(result).")
            return nil
        }
        
        return getRSAKeyFromKeychain(tagName)
    }
    
    private func stripPrivateKeyHeader(_ privkey: Data) throws -> Data? {
        if ( privkey.count == 0 ) {
            return nil
        }
        
        var keyAsArray = [UInt8](repeating: 0, count: privkey.count / MemoryLayout<UInt8>.size)
        (privkey as NSData).getBytes(&keyAsArray, length: privkey.count)
        
        //PKCS#8: magic byte at offset 22, check if it's actually ASN.1
        var idx = 22
        if ( keyAsArray[idx] != 0x04 ) {
            return privkey
        }
        idx += 1
        
        //now we need to find out how long the key is, so we can extract the correct hunk
        //of bytes from the buffer.
        var len = Int(keyAsArray[idx])
        idx += 1
        let det = len & 0x80 //check if the high bit set
        if (det == 0) {
            //no? then the length of the key is a number that fits in one byte, (< 128)
            len = len & 0x7f
        } else {
            //otherwise, the length of the key is a number that doesn't fit in one byte (> 127)
            var byteCount = Int(len & 0x7f)
            if (byteCount + idx > privkey.count) {
                return nil
            }
            //so we need to snip off byteCount bytes from the front, and reverse their order
            var accum: UInt = 0
            var idx2 = idx
            idx += byteCount
            while (byteCount > 0) {
                //after each byte, we shove it over, accumulating the value into accum
                accum = (accum << 8) + UInt(keyAsArray[idx2])
                idx2 += 1
                byteCount -= 1
            }
            // now we have read all the bytes of the key length, and converted them to a number,
            // which is the number of bytes in the actual key.  we use this below to extract the
            // key bytes and operate on them
            len = Int(accum)
        }
        return privkey.subdata(in: idx..<idx+len)
        //return privkey.subdata(in: NSMakeRange(idx, len).toRange()!)
    }
    
    //MARK: Shared
    public func getRSAKeyFromKeychain(_ tagName: String) -> SecKey? {
        
        let queryFilter: [String: AnyObject] = [
            String(kSecClass)             : kSecClassKey,
            String(kSecAttrKeyType)       : kSecAttrKeyTypeRSA,
            String(kSecAttrApplicationTag): tagName as AnyObject,
            //String(kSecAttrAccessible)    : kSecAttrAccessibleWhenUnlocked,
            String(kSecReturnRef)         : true as AnyObject
        ]
        
        var keyPtr: AnyObject?
        let result = SecItemCopyMatching(queryFilter as CFDictionary, &keyPtr)
        
        if ( result != noErr || keyPtr == nil ) {
            return nil
        }
        return keyPtr as! SecKey?
        
    }
    
    public func deleteRSAKeyFromKeychain(_ tagName: String) {
        
        let queryFilter: [String: AnyObject] = [
            String(kSecClass)             : kSecClassKey,
            String(kSecAttrKeyType)       : kSecAttrKeyTypeRSA,
            String(kSecAttrApplicationTag): tagName as AnyObject
        ]
        SecItemDelete(queryFilter as CFDictionary)
    }
}
