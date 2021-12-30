import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { CipherType, SecureNoteType } from '../../../../core/enums'
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from '../../../../core/models/view'
import { useCoreService } from '../../core-service'


const defaultData = {
  newCipher: (type: CipherType) => { return new CipherView() },
  getPasswordStrength: (password: string) => ({ score: 0 }),
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
  
  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    newCipher,
    getPasswordStrength
  }

  return (
    <CipherHelpersMixinsContext.Provider value={data}>
      {props.children}
    </CipherHelpersMixinsContext.Provider>
  )
})

export const useCipherHelpersMixins = () => useContext(CipherHelpersMixinsContext)
