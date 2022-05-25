import React from 'react'
import { WebViewModal } from '../../../components'
import { GITHUB_CONFIG } from '../../../config/constants'
import { useMixins } from '../../../services/mixins'


type Props = {
  isOpen: boolean
  onClose: () => void
  onDone: (code: string) => void
}

export const GitHubLoginModal = (props: Props) => {
  const { isOpen, onClose, onDone } = props
  const { randomString } = useMixins()

  const url = `${GITHUB_CONFIG.authorizationEndpoint}?client_id=${GITHUB_CONFIG.clientId}&redirect_uri=${encodeURIComponent(GITHUB_CONFIG.redirectUrl)}&scope=${encodeURIComponent(GITHUB_CONFIG.scopes.join(' '))}&state=${randomString()}`

  const onURLChange = (url: string) => {
    if (url.startsWith(GITHUB_CONFIG.redirectUrl)) {
      const code = getParameterByName('code', url)
      onClose()
      onDone(code)
    }
  }

  const getParameterByName = (name: string, url: string) => {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  return (
    <WebViewModal
      url={url}
      isOpen={isOpen}
      onClose={onClose}
      onURLChange={onURLChange}
    />
  )
}
