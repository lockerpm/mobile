import { SendData } from "../models/data/sendData"
import { Send } from "../models/domain/send"
import { SymmetricCryptoKey } from "../models/domain/symmetricCryptoKey"
import { SendView } from "../models/view/sendView"

export abstract class SendService {
  decryptedSendCache: SendView[] | null = null

  abstract clearCache: () => void
  abstract encrypt: (model: SendView, password: string, key?: SymmetricCryptoKey) => Promise<Send>

  abstract get: (id: string) => Promise<Send | null>
  abstract getAll: () => Promise<Send[]>
  abstract getAllDecrypted: () => Promise<SendView[]>
  abstract upsert: (send: SendData | SendData[]) => Promise<any>

  abstract replace: (sends: { [id: string]: SendData }) => Promise<any>
  abstract clear: (userId: string) => Promise<any>
  abstract delete: (id: string | string[]) => Promise<any>
}
