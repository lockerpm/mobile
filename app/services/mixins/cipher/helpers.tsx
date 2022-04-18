import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { CipherType, SecureNoteType } from '../../../../core/enums'
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from '../../../../core/models/view'
import { toCryptoAccountData, toCryptoWalletData } from '../../../utils/crypto'
import { useCoreService } from '../../core-service'


const defaultData = {
  newCipher: (type: CipherType) => { return new CipherView() },
  getPasswordStrength: (password: string) => ({ score: 0 }),
  getCipherDescription: (cipher: CipherView) => ''
}

export const CipherHelpersMixinsContext = createContext(defaultData)

export const CipherHelpersMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const {
    passwordGenerationService
  } = useCoreService()

  // ------------------ METHODS ---------------------------
  
  const newCipher = (type: CipherType) => {
    const cipher = new CipherView()
    cipher.organizationId = null
    cipher.type = type
    cipher.login = new LoginView()
    cipher.login.uris = [new LoginUriView]
    cipher.card = new CardView()
    cipher.identity = new IdentityView()
    cipher.secureNote = new SecureNoteView()
    cipher.secureNote.type = SecureNoteType.Generic
    cipher.folderId = null
    cipher.collectionIds = []
    return cipher
  }

  // Password strength
  const getPasswordStrength = (password: string) => {
    return passwordGenerationService.passwordStrength(password, ['cystack']) || { score: 0 }
  }

  // Get cipher description
  const getCipherDescription = (item: CipherView) => {
    switch (item.type) {
      case CipherType.Login:
        return item.login.username
      case CipherType.Card:
        return (item.card.brand && item.card.number) 
          ? `${item.card.brand}, *${item.card.number.slice(-4)}`
          : ''
      case CipherType.Identity:
        return item.identity.fullName
      case CipherType.CryptoAccount:
        return toCryptoAccountData(item.notes).username
      case CipherType.CryptoWallet:
        return toCryptoWalletData(item.notes).email
    }
    return ''
  }
  
  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    newCipher,
    getPasswordStrength,
    getCipherDescription
  }

  return (
    <CipherHelpersMixinsContext.Provider value={data}>
      {props.children}
    </CipherHelpersMixinsContext.Provider>
  )
})

export const useCipherHelpersMixins = () => useContext(CipherHelpersMixinsContext)
