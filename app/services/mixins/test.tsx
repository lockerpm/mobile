import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '.'
import { CipherType } from '../../../core/enums'
import { LoginUriView, LoginView } from '../../../core/models/view'
import { useCoreService } from '../core-service'
import { useCipherDataMixins } from './cipher/data'
import { useCipherHelpersMixins } from './cipher/helpers'


const defaultData = {
  createRandomPasswords: async (params: {
    count: number
    length: number
  }) => {}
}

export const TestMixinsContext = createContext(defaultData)

export const TestMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { newCipher, getPasswordStrength } = useCipherHelpersMixins()
  const { createCipher } = useCipherDataMixins()
  const { notify } = useMixins()
  const { passwordGenerationService } = useCoreService()
  
  // ----------------------------- METHODS ---------------------------

  const createRandomPasswords = async (params: {
    count: number
    length: number
  }) => {
    const { count, length } = params
    const opt = {
      length,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      ambiguous: false
    }
    const websites = [
      'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'baidu.com', 'wikipedia.org', 'yandex.ru', 'yahoo.com', 'xvideos.com', 'whatsapp.com', 'xnxx.com', 'amazon.com', 'netflix.com', 'yahoo.co.jp', 'live.com', 'pornhub.com', 'zoom.us', 'office.com', 'reddit.com', 'tiktok.com', 'linkedin.com', 'vk.com', 'xhamster.com', 'discord.com', 'twitch.tv', 'naver.com', 'bing.com', 'bilibili.com', 'mail.ru', 'duckduckgo.com', 'roblox.com', 'microsoftonline.com', 'microsoft.com', 'pinterest.com', 'samsung.com', 'qq.com', 'msn.com', 'globo.com', 'news.yahoo.co.jp', 'google.com.br', 'ebay.com', 'fandom.com', 'bbc.co.uk', 'miguvideo.com', 'accuweather.com', 'docomo.ne.jp', 'realsrv.com', 'powerlanguage.co.uk', 'weather.com'
    ]

    for (let i = 0; i < count; i++) {
      const name = Math.random().toString()
      const username = Math.random().toString()
      const url = 'https://' + websites[Math.floor(Math.random() * websites.length)]
      const note = Math.random().toString()
      const password = await passwordGenerationService.generatePassword(opt)

      const payload = newCipher(CipherType.Login)
      const data = new LoginView()
      data.username = username
      data.password = password
      if (url) {
        const uriView = new LoginUriView()
        uriView.uri = url
        data.uris = [uriView]
      }

      payload.name = name
      payload.notes = note
      payload.folderId = null
      payload.login = data
      payload.organizationId = null
      const passwordStrength = getPasswordStrength(password).score
      await createCipher(payload, passwordStrength, [])
    }

    notify('success', 'Done')
  }
  
  
  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    createRandomPasswords
  }

  return (
    <TestMixinsContext.Provider value={data}>
      {props.children}
    </TestMixinsContext.Provider>
  )
})

export const useTestMixins = () => useContext(TestMixinsContext)
