/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { BackHandler } from 'react-native'
import {
  CipherList,
  CipherListHeader,
  EmptyCipherList,
  SortActionConfigModal,
} from 'app/components-v2/ciphers'
import { Screen } from 'app/components-v2/cores'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'
import { MAX_CIPHER_SELECTION } from 'app/static/constants'
import { CipherType } from 'core/enums'

const EMPTY_LIST = require('assets/images/emptyCipherList/note-empty-img.png')

export const NotesScreen = observer(() => {
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
      safeAreaEdges={['bottom']}
      preset="auto"
      header={
        <CipherListHeader
          header={translate('common.note')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('notes__edit', { mode: 'add' })
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
        cipherType={CipherType.SecureNote}
        sortList={sortList}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={
          <EmptyCipherList
            img={EMPTY_LIST}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('note.empty.title')}
            desc={translate('note.empty.desc')}
            buttonText={translate('note.empty.btn')}
            addItem={() => {
              navigation.navigate('notes__edit', { mode: 'add' })
            }}
          />
        }
      />
    </Screen>
  )
})
