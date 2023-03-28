import { SendData } from '../models/data/sendData';

import { Send } from '../models/domain/send';
import { SymmetricCryptoKey } from '../models/domain/symmetricCryptoKey';


import { SendView } from '../models/view/sendView';

import { CryptoService } from '../abstractions/crypto.service';
import { CryptoFunctionService } from '../abstractions/cryptoFunction.service';
import { I18nService } from '../abstractions/i18n.service';
import { SendService as SendServiceAbstraction } from '../abstractions/send.service';
import { StorageService } from '../abstractions/storage.service';
import { UserService } from '../abstractions/user.service';

import { Utils } from '../misc/utils';
import { CipherService } from '../abstractions';

const Keys = {
    sendsPrefix: 'sends_',
};

export class SendService implements SendServiceAbstraction {
    decryptedSendCache: SendView[]
  
    // eslint-disable-next-line no-useless-constructor
    constructor (
      private cryptoService: CryptoService,
      private cipherService: CipherService,
      private userService: UserService,
      private storageService: StorageService,
      private i18nService: I18nService,
      private cryptoFunctionService: CryptoFunctionService
    ) {}
  
    clearCache (): void {
      // @ts-ignore
      this.decryptedSendCache = null
    }
  
    async encrypt (
      model: SendView,
      password: string,
      key?: SymmetricCryptoKey
    ): Promise<Send> {
      const send = new Send()
      send.id = model.id
      send.disabled = model.disabled
      send.cipherId = model.cipherId
      send.expirationDate = model.expirationDate
      send.requireOtp = model.requireOtp
      send.eachEmailAccessCount = model.eachEmailAccessCount
      send.maxAccessCount = model.maxAccessCount
      send.emails = model.emails
      if (model.key == null) {
        model.key = await this.cryptoFunctionService.randomBytes(16)
        model.cryptoKey = await this.cryptoService.makeSendKey(model.key)
      }
      if (password != null) {
        const passwordHash = await this.cryptoFunctionService.pbkdf2(
          password,
          model.key,
          'sha256',
          100000
        )
        send.password = Utils.fromBufferToB64(passwordHash)
      }
      send.key = await this.cryptoService.encrypt(model.key, key)
      send.cipher = await this.cipherService.encrypt(
        model.cipher,
        model.cryptoKey
      )
  
      return send
    }
  
    async get (id: string): Promise<Send> {
      const userId = await this.userService.getUserId()
      const sends = await this.storageService.get<{ [id: string]: SendData }>(
        Keys.sendsPrefix + userId
      )
      if (sends == null || !sends.hasOwnProperty(id)) {
        // @ts-ignore
        return null
      }
  
      return new Send(sends[id])
    }
  
    async getAll (): Promise<Send[]> {
      const userId = await this.userService.getUserId()
      const sends = await this.storageService.get<{ [id: string]: SendData }>(
        Keys.sendsPrefix + userId
      )
      const response: Send[] = []
      for (const id in sends) {
        if (sends.hasOwnProperty(id)) {
          response.push(new Send(sends[id]))
        }
      }
      return response
    }
  
    async getAllDecrypted (): Promise<SendView[]> {
      if (this.decryptedSendCache != null) {
        return this.decryptedSendCache
      }
  
      const hasKey = await this.cryptoService.hasKey()
      if (!hasKey) {
        throw new Error('No key.')
      }
  
      const decSends: SendView[] = []
      const promises: Promise<any>[] = []
      const sends = await this.getAll()
      sends.forEach(send => {
        promises.push(send.decrypt().then(f => decSends.push(f)))
      })
  
      await Promise.all(promises)
  
      // TODO: can only sort string
      // decSends.sort(Utils.getSortFunction(this.i18nService, 'expirationDate'))
  
      this.decryptedSendCache = decSends
      return this.decryptedSendCache
    }
  
    async upsert (send: SendData | SendData[]): Promise<any> {
      const userId = await this.userService.getUserId()
      let sends = await this.storageService.get<{ [id: string]: SendData }>(
        Keys.sendsPrefix + userId
      )
      if (sends == null) {
        sends = {}
      }
  
      if (send instanceof SendData) {
        const s = send as SendData
        sends[s.id] = s
      } else {
        ;(send as SendData[]).forEach(s => {
          sends[s.id] = s
        })
      }
  
      await this.storageService.save(Keys.sendsPrefix + userId, sends)
      this.decryptedSendCache = null
    }
  
    async replace (sends: { [id: string]: SendData }): Promise<any> {
      const userId = await this.userService.getUserId()
      await this.storageService.save(Keys.sendsPrefix + userId, sends)
      this.decryptedSendCache = null
    }
  
    async clear (userId: string): Promise<any> {
      await this.storageService.remove(Keys.sendsPrefix + userId)
      this.decryptedSendCache = null
    }
  
    async delete (id: string | string[]): Promise<any> {
      const userId = await this.userService.getUserId()
      const sends = await this.storageService.get<{ [id: string]: SendData }>(
        Keys.sendsPrefix + userId
      )
      if (sends == null) {
        return
      }
  
      if (typeof id === 'string') {
        if (sends[id] == null) {
          return
        }
        delete sends[id]
      } else {
        ;(id as string[]).forEach(i => {
          delete sends[i]
        })
      }
  
      await this.storageService.save(Keys.sendsPrefix + userId, sends)
      this.decryptedSendCache = null
    }
  }
  