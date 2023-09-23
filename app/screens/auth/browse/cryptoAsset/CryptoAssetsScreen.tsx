/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { BackHandler } from 'react-native'
import { SortActionConfigModal, EmptyCipherList, CipherList, CipherListHeader } from 'app/components-v2/ciphers'
import { MAX_CIPHER_SELECTION } from 'app/static/constants'
import { Screen } from 'app/components-v2/cores'
import { useStores } from 'app/models'
import { CipherType } from 'core/enums'
import { translate } from 'app/i18n'

const EMPTY_IMG = require('assets/images/emptyCipherList/crypto-empty-img.png')

export const CryptoAssetsScreen = observer(() => {
  const navigation = useNavigation()
  const { uiStore } = useStores()

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc',
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

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

  useEffect(() => {
    // set Most relevant by defalt when users search
    if (searchText) {
      if (searchText.trim().length === 1) {
        setSortList(null)
        setSortOption('most_relevant')
      }
    } else {
      setSortList({
        orderField: 'revisionDate',
        order: 'desc',
      })
      setSortOption('last_updated')
    }
  }, [searchText])

  return (
    <Screen
      padding
      safeAreaEdges={['bottom', 'top']}
      contentContainerStyle={{
        flex: 1
      }}
      header={
        <CipherListHeader
          header={translate('common.crypto_asset')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('cryptoWallets__edit', { mode: 'add' })
          }}
          onSearch={setSearchText}
          searchText={searchText}
          navigation={navigation}
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

      <CipherList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        cipherType={CipherType.CryptoWallet}
        sortList={sortList}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={
          <EmptyCipherList
            img={EMPTY_IMG}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('crypto_asset.empty.title')}
            desc={translate('crypto_asset.empty.desc')}
            buttonText={translate('crypto_asset.empty.btn')}
            addItem={() => {
              navigation.navigate('cryptoWallets__edit', { mode: 'add' })
            }}
          />
        }
      />
    </Screen>
  )
})
