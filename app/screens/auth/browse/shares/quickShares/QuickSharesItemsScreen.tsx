/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { QuickSharesList } from './QuickSharesList'
import { PushNotifier } from 'app/utils/pushNotification'
import { CipherListHeader, EmptyCipherList, SortActionConfigModal } from 'app/components/ciphers'
import { useStores } from 'app/models'
import { Screen } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

const SHARE_EMPTY = require('assets/images/emptyCipherList/share-empty-img.png')

export const QuickShareItemsScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { translate } = useHelper()
  // --------------------- PARAMS -------------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc',
  })
  const [sortOption, setSortOption] = useState('last_updated')

  // --------------------- COMPUTED -------------------------

  const isFreeAccount = user.isFreePlan

  // --------------------- EFFECTS -------------------------

  // Clear noti
  useEffect(() => {
    PushNotifier.cancelNotification('share_confirm')
  }, [navigation])

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

  // --------------------- RENDER -------------------------

  return (
    <Screen
      safeAreaEdges={['top']}
      header={
        <CipherListHeader
          header={translate('quick_shares.share_option.quick.tl')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('mainTab', { screen: 'homeTab' })
          }}
          onSearch={setSearchText}
          searchText={searchText}
          navigation={navigation}
          isSelecting={false}
          setIsLoading={setIsLoading}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
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

      <QuickSharesList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        emptyContent={
          <EmptyCipherList
            img={SHARE_EMPTY}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('shares.empty.title')}
            desc={translate('shares.empty.desc_share')}
            buttonText={translate('shares.start_sharing')}
            addItem={() => navigation.navigate('mainTab', { screen: 'homeTab' })}
          />
        }
      />
    </Screen>
  )
})
