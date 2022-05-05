import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { CryptoFunctionService } from "../../../../core/abstractions/cryptoFunction.service"
import { SymmetricCryptoKey } from "../../../../core/models/domain"
import { DecryptParameters } from "../../../../core/models/domain/decryptParameters"
import { Utils } from "../../../../core/misc/utils"
import RNSimpleCrypto from "react-native-simple-crypto"
import { NativeModules } from 'react-native';
import { IS_IOS } from '../../../config/constants';

const { RNCryptoServiceIos, RNCryptoServiceAndroid } = NativeModules

export class MobileCryptoFunctionService implements CryptoFunctionService {
  // DONE
  pbkdf2(password: string | ArrayBuffer, salt: string | ArrayBuffer, algorithm: 'sha256' | 'sha512',
    iterations: number): Promise<ArrayBuffer> {
    const len = algorithm === 'sha256' ? 32 : 64;
    const nodePassword = this.toNodeValue(password);
    const nodeSalt = this.toNodeValue(salt);
    return new Promise<ArrayBuffer>(async (resolve, reject) => {
      // crypto.pbkdf2(nodePassword, nodeSalt, iterations, len, algorithm, (error, key) => {
      //   if (error != null) {
      //     reject(error);
      //   } else {
      //     resolve(this.toArrayBuffer(key));
      //   }
      // });
      const key = await RNSimpleCrypto.PBKDF2.hash(nodePassword, nodeSalt, iterations, len, algorithm === 'sha256' ? 'SHA256' : 'SHA512')
      resolve(this.toArrayBuffer(key))
    });
  }

  // ref: https://tools.ietf.org/html/rfc5869
  // TODO: not calling very much -> ignore for now
  async hkdf(ikm: ArrayBuffer, salt: string | ArrayBuffer, info: string | ArrayBuffer,
    outputByteSize: number, algorithm: 'sha256' | 'sha512'): Promise<ArrayBuffer> {
    const saltBuf = this.toArrayBuffer(salt);
    const prk = await this.hmac(ikm, saltBuf, algorithm);
    console.log(`-------- HKDF ---------`)
    return this.hkdfExpand(prk, info, outputByteSize, algorithm);
  }

  // ref: https://tools.ietf.org/html/rfc5869
  // TODO: not calling very much -> ignore for now
  async hkdfExpand(prk: ArrayBuffer, info: string | ArrayBuffer, outputByteSize: number,
    algorithm: 'sha256' | 'sha512'): Promise<ArrayBuffer> {
    const hashLen = algorithm === 'sha256' ? 32 : 64;
    // console.log(`-------- HKDF expand ---------`)
    if (outputByteSize > 255 * hashLen) {
      throw new Error('outputByteSize is too large.');
    }
    const prkArr = new Uint8Array(prk);
    if (prkArr.length < hashLen) {
      throw new Error('prk is too small.');
    }
    const infoBuf = this.toArrayBuffer(info);
    const infoArr = new Uint8Array(infoBuf);
    let runningOkmLength = 0;
    let previousT = new Uint8Array(0);
    const n = Math.ceil(outputByteSize / hashLen);
    const okm = new Uint8Array(n * hashLen);
    for (let i = 0; i < n; i++) {
      const t = new Uint8Array(previousT.length + infoArr.length + 1);
      t.set(previousT);
      t.set(infoArr, previousT.length);
      t.set([i + 1], t.length - 1);
      previousT = new Uint8Array(await this.hmac(t.buffer, prk, algorithm));
      okm.set(previousT, runningOkmLength);
      runningOkmLength += previousT.length;
      if (runningOkmLength >= outputByteSize) {
        break;
      }
    }
    return okm.slice(0, outputByteSize).buffer;
  }

  // DONE (can ignore md5)
  hash(value: string | ArrayBuffer, algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5'): Promise<ArrayBuffer> {
    const nodeValue = this.toNodeValue(value);

    switch (algorithm) {
      case 'sha1':
        // @ts-ignore
        return RNSimpleCrypto.SHA.sha1(nodeValue)
      case 'sha256':
        // @ts-ignore
        return RNSimpleCrypto.SHA.sha256(nodeValue)
      case 'sha512':
        // @ts-ignore
        return RNSimpleCrypto.SHA.sha512(nodeValue)
      default:
        // Default
        const hash = crypto.createHash(algorithm);
        hash.update(nodeValue);
        return Promise.resolve(this.toArrayBuffer(hash.digest()));
    }
  }

  // DONE: mostly sha256
  hmac(value: ArrayBuffer, key: ArrayBuffer, algorithm: 'sha1' | 'sha256' | 'sha512'): Promise<ArrayBuffer> {
    const nodeValue = this.toNodeBuffer(value);
    const nodeKey = this.toNodeBuffer(key);

    if (algorithm === 'sha256') {
      return RNSimpleCrypto.HMAC.hmac256(nodeValue, nodeKey)
    }

    // Default
    const hmac = crypto.createHmac(algorithm, nodeKey);
    hmac.update(nodeValue);
    return Promise.resolve(this.toArrayBuffer(hmac.digest()));
  }

  async compare(a: ArrayBuffer, b: ArrayBuffer): Promise<boolean> {
    const key = await this.randomBytes(32);
    const mac1 = await this.hmac(a, key, 'sha256');
    const mac2 = await this.hmac(b, key, 'sha256');
    if (mac1.byteLength !== mac2.byteLength) {
      return false;
    }

    const arr1 = new Uint8Array(mac1);
    const arr2 = new Uint8Array(mac2);
    for (let i = 0; i < arr2.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  hmacFast(value: ArrayBuffer, key: ArrayBuffer, algorithm: 'sha1' | 'sha256' | 'sha512'): Promise<ArrayBuffer> {
    return this.hmac(value, key, algorithm);
  }

  compareFast(a: ArrayBuffer, b: ArrayBuffer): Promise<boolean> {
    return this.compare(a, b);
  }

  // DONE
  aesEncrypt(data: ArrayBuffer, iv: ArrayBuffer, key: ArrayBuffer): Promise<ArrayBuffer> {
    const nodeData = this.toNodeBuffer(data);
    const nodeIv = this.toNodeBuffer(iv);
    const nodeKey = this.toNodeBuffer(key);
    // const cipher = crypto.createCipheriv('aes-256-cbc', nodeKey, nodeIv);
    // const encBuf = Buffer.concat([cipher.update(nodeData), cipher.final()]);
    // return Promise.resolve(this.toArrayBuffer(encBuf));

    return RNSimpleCrypto.AES.encrypt(nodeData, nodeKey, nodeIv)
  }

  aesDecryptFastParameters(data: string, iv: string, mac: string, key: SymmetricCryptoKey):
    DecryptParameters<ArrayBuffer> {
    const p = new DecryptParameters<ArrayBuffer>();
    p.encKey = key.encKey;
    p.data = Utils.fromB64ToArray(data).buffer;
    p.iv = Utils.fromB64ToArray(iv).buffer;

    const macData = new Uint8Array(p.iv.byteLength + p.data.byteLength);
    macData.set(new Uint8Array(p.iv), 0);
    macData.set(new Uint8Array(p.data), p.iv.byteLength);
    p.macData = macData.buffer;

    if (key.macKey != null) {
      p.macKey = key.macKey;
    }
    if (mac != null) {
      p.mac = Utils.fromB64ToArray(mac).buffer;
    }

    return p;
  }

  async aesDecryptFast(parameters: DecryptParameters<ArrayBuffer>): Promise<string> {
    const decBuf = await this.aesDecrypt(parameters.data, parameters.iv, parameters.encKey);
    return Utils.fromBufferToUtf8(decBuf);
  }

  // DONE
  aesDecrypt(data: ArrayBuffer, iv: ArrayBuffer, key: ArrayBuffer): Promise<ArrayBuffer> {
    const nodeData = this.toNodeBuffer(data);
    const nodeIv = this.toNodeBuffer(iv);
    const nodeKey = this.toNodeBuffer(key);
    // const decipher = crypto.createDecipheriv('aes-256-cbc', nodeKey, nodeIv);
    // const decBuf = Buffer.concat([decipher.update(nodeData), decipher.final()]);
    // return Promise.resolve(this.toArrayBuffer(decBuf));

    return RNSimpleCrypto.AES.decrypt(nodeData, nodeKey, nodeIv)
  }

  // DONE
  rsaEncrypt(data: ArrayBuffer, publicKey: ArrayBuffer, algorithm: 'sha1' | 'sha256'): Promise<ArrayBuffer> {
    if (algorithm === 'sha256') {
      throw new Error('Node crypto does not support RSA-OAEP SHA-256');
    }

    const pem = this.toPemPublicKey(publicKey);
    const decipher = crypto.publicEncrypt(pem, this.toNodeBuffer(data));
    return Promise.resolve(this.toArrayBuffer(decipher));
  }

  // DONE
  async rsaDecrypt(data: ArrayBuffer, privateKey: ArrayBuffer, algorithm: 'sha1' | 'sha256'): Promise<ArrayBuffer> {
    if (algorithm === 'sha256') {
      throw new Error('Node crypto does not support RSA-OAEP SHA-256');
    }

    const CryptoServiceModule = IS_IOS ? RNCryptoServiceIos : RNCryptoServiceAndroid
    const decipher = await CryptoServiceModule.decryptOAEPSHA1(Utils.fromBufferToB64(data), Utils.fromBufferToB64(privateKey))
    return Utils.fromB64ToArray(decipher).buffer
  }

  rsaExtractPublicKey(privateKey: ArrayBuffer): Promise<ArrayBuffer> {
    const privateKeyByteString = Utils.fromBufferToByteString(privateKey);
    const privateKeyAsn1 = forge.asn1.fromDer(privateKeyByteString);
    const forgePrivateKey = (forge as any).pki.privateKeyFromAsn1(privateKeyAsn1);
    const forgePublicKey = (forge.pki as any).setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
    const publicKeyAsn1 = (forge.pki as any).publicKeyToAsn1(forgePublicKey);
    const publicKeyByteString = forge.asn1.toDer(publicKeyAsn1).data;
    const publicKeyArray = Utils.fromByteStringToArray(publicKeyByteString);
    return Promise.resolve(publicKeyArray.buffer);
  }

  // DONE
  async rsaGenerateKeyPair(length: 1024 | 2048 | 4096): Promise<[ArrayBuffer, ArrayBuffer]> {
    return new Promise<[ArrayBuffer, ArrayBuffer]>(async (resolve, reject) => {
      try {
        const keyPair = await RNSimpleCrypto.RSA.generateKeys(length)

        const pubKey = forge.pki.publicKeyFromPem(keyPair.public)
        const publicKeyAsn1 = (forge.pki as any).publicKeyToAsn1(pubKey);
        const publicKeyByteString = forge.asn1.toDer(publicKeyAsn1).getBytes();
        const publicKey = Utils.fromByteStringToArray(publicKeyByteString);

        const privKey = forge.pki.privateKeyFromPem(keyPair.private)
        const privateKeyAsn1 = (forge.pki as any).privateKeyToAsn1(privKey);
        const privateKeyPkcs8 = (forge.pki as any).wrapRsaPrivateKey(privateKeyAsn1);
        const privateKeyByteString = forge.asn1.toDer(privateKeyPkcs8).getBytes();
        const privateKey = Utils.fromByteStringToArray(privateKeyByteString);
        resolve([publicKey.buffer, privateKey.buffer]);
      } catch (e) {
        reject(e)
      }

      // forge.pki.rsa.generateKeyPair({
      //   bits: length,
      //   workers: -1,
      //   e: 0x10001, // 65537
      // }, (error, keyPair) => {
      //   if (error != null) {
      //     reject(error);
      //     return;
      //   }
      //   const publicKeyAsn1 = (forge.pki as any).publicKeyToAsn1(keyPair.publicKey);
      //   const publicKeyByteString = forge.asn1.toDer(publicKeyAsn1).getBytes();
      //   const publicKey = Utils.fromByteStringToArray(publicKeyByteString);

      //   const privateKeyAsn1 = (forge.pki as any).privateKeyToAsn1(keyPair.privateKey);
      //   const privateKeyPkcs8 = (forge.pki as any).wrapRsaPrivateKey(privateKeyAsn1);
      //   const privateKeyByteString = forge.asn1.toDer(privateKeyPkcs8).getBytes();
      //   const privateKey = Utils.fromByteStringToArray(privateKeyByteString);
      //   resolve([publicKey.buffer, privateKey.buffer]);
      // });
    });
  }

  // TODO: replaced in react-native-crypto shim -> ignore
  randomBytes(length: number): Promise<ArrayBuffer> {
    // console.log(`-------- Randombytes ---------`)
    return new Promise<ArrayBuffer>((resolve, reject) => {
      crypto.randomBytes(length, (error, bytes) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(this.toArrayBuffer(bytes));
        }
      });
    });
  }

  private toNodeValue(value: string | ArrayBuffer): string | Buffer {
    let nodeValue: string | Buffer;
    if (typeof (value) === 'string') {
      nodeValue = value;
    } else {
      nodeValue = this.toNodeBuffer(value);
    }
    return nodeValue;
  }

  private toNodeBuffer(value: ArrayBuffer): Buffer {
    return Buffer.from(new Uint8Array(value) as any);
  }

  private toArrayBuffer(value: Buffer | string | ArrayBuffer): ArrayBuffer {
    let buf: ArrayBuffer;
    if (typeof (value) === 'string') {
      buf = Utils.fromUtf8ToArray(value).buffer;
    } else {
      buf = new Uint8Array(value).buffer;
    }
    return buf;
  }

  private toPemPrivateKey(key: ArrayBuffer): string {
    const byteString = Utils.fromBufferToByteString(key);
    const asn1 = forge.asn1.fromDer(byteString);
    const privateKey = (forge as any).pki.privateKeyFromAsn1(asn1);
    const rsaPrivateKey = (forge.pki as any).privateKeyToAsn1(privateKey);
    const privateKeyInfo = (forge.pki as any).wrapRsaPrivateKey(rsaPrivateKey);
    return (forge.pki as any).privateKeyInfoToPem(privateKeyInfo);
  }

  private toPemPublicKey(key: ArrayBuffer): string {
    const byteString = Utils.fromBufferToByteString(key);
    const asn1 = forge.asn1.fromDer(byteString);
    const publicKey = (forge as any).pki.publicKeyFromAsn1(asn1);
    return (forge.pki as any).publicKeyToPem(publicKey);
  }
}
