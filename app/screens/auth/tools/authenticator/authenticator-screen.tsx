import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/core'
import { useMixins } from '../../../../services/mixins'
import { Layout, BrowseItemHeader, BrowseItemEmptyContent } from '../../../../components'
import { AuthenticatorAddAction } from './authenticator-add-action'
import { useStores } from '../../../../models'
import { BackHandler } from 'react-native'
import { MAX_CIPHER_SELECTION } from '../../../../config/constants'
import { OtpList } from './otp-list'
import { SortActionConfigModal } from 'app/components-v2/ciphers'

export const AuthenticatorScreen = observer(() => {
  const { translate } = useMixins()
  const navigation = useNavigation()
  const { uiStore } = useStores()

  // -------------------- PARAMS ----------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc',
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  // -------------------- EFFECT ----------------------

  // Close select before leave
  useEffect(() => {
    uiStore.setIsSelecting(isSelecting)
    const checkSelectBeforeLeaving = () => {
      if (isSelecting) {
        setIsSelecting(false)
        setSelectedItems([])
        return true
      }
      return false
    }
    BackHandler.addEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    }
  }, [isSelecting])

  // -------------------- RENDER ----------------------

  return (
    <Layout
      noScroll
      borderBottom
      hasBottomNav
      isContentOverlayLoading={isLoading}
      header={
        <BrowseItemHeader
          isAuthenticator
          header={translate('authenticator.title')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          navigation={navigation}
          searchText={searchText}
          onSearch={setSearchText}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setIsLoading={setIsLoading}
          toggleSelectAll={() => {
            const maxLength = Math.min(allItems.length, MAX_CIPHER_SELECTION)
            if (selectedItems.length < maxLength) {
              setSelectedItems(allItems.slice(0, maxLength))
            } else {
              setSelectedItems([])
            }
          }}
        />
      }
    >
      <SortActionConfigModal
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string; order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <AuthenticatorAddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
        allItemsLength={allItems?.length || 0}
      />
      {/* Actions end */}

      {/* OTP list */}
      <OtpList
        navigation={navigation}
        searchText={searchText}
        sortList={sortList}
        onLoadingChange={setIsLoading}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('authenticator.empty.title')}
            desc={translate('authenticator.empty.desc')}
            buttonText={translate('authenticator.empty.btn')}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        }
      />
      {/* OTP list end */}
    </Layout>
  )
})
