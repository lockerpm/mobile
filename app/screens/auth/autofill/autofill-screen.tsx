import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Layout, BrowseItemHeader, BrowseItemEmptyContent } from '../../../components'
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native'
import { useMixins } from '../../../services/mixins'
import { BackHandler, NativeModules } from 'react-native'
import { useStores } from '../../../models'
import { PrimaryParamList } from '../../../navigators'
import { AutoFillList } from './autofill-list'
import { MAX_CIPHER_SELECTION } from '../../../config/constants'
import { useCipherDataMixins } from '../../../services/mixins/cipher/data'
import { CipherView } from '../../../../core/models/view'
import { CipherType } from '../../../../core/enums'
import { getTOTP, parseOTPUri } from '../../../utils/totp'
import { parseSearchText } from 'app/utils/autofillHelper'
import { SortActionConfigModal } from 'app/components-v2/ciphers'

const { RNAutofillServiceAndroid } = NativeModules

type PasswordEditScreenProp = RouteProp<PrimaryParamList, 'autofill'>

export const AutoFillScreen = observer(function AutoFillScreen() {
  const navigation = useNavigation()
  const { translate, copyToClipboard } = useMixins()
  const { uiStore } = useStores()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode } = route.params
  const { getCiphersFromCache } = useCipherDataMixins()
  // -------------------- PARAMS ----------------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState(parseSearchText(uiStore.deepLinkUrl) || '')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc',
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  // -------------------- EFFECT ----------------------------

  // If is selecting -> close it instead of exit
  // Quit app on back press
  useEffect(() => {
    uiStore.setIsSelecting(isSelecting)
    const checkSelectBeforeLeaving = () => {
      if (isSelecting) {
        setIsSelecting(false)
        setSelectedItems([])
        return true
      }
      BackHandler.exitApp()
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

  // Suggest save
  useEffect(() => {
    if (mode === 'item') {
      const check = async () => {
        const id = uiStore.saveLastId
        const allLogins = await getCiphersFromCache({
          deleted: false,
          searchText: '',
          filters: [(c: CipherView) => c.type === CipherType.Login && c.id === id],
        })

        if (allLogins.length > 0) {
          RNAutofillServiceAndroid.useLastItem()
          if (allLogins[0].login.hasTotp) {
            const otp = getTOTP(parseOTPUri(allLogins[0].login.totp))
            copyToClipboard(otp)
          }
        } else {
          RNAutofillServiceAndroid.removeLastItem()
          BackHandler.exitApp()
        }
      }
      check()
    }
  }, [])

  // -------------------- RENDER ----------------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={
        <BrowseItemHeader
          isAutoFill
          header={translate('common.passwords')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('passwords__edit', { mode: 'add', initialUrl: uiStore.deepLinkUrl })
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
      borderBottom
      noScroll
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

      <AutoFillList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('password.empty.title')}
            desc={translate('password.empty.desc')}
            buttonText={translate('password.empty.btn')}
            addItem={() => {
              navigation.navigate('passwords__edit', {
                mode: 'add',
                initialUrl: uiStore.deepLinkUrl,
              })
            }}
          />
        }
      />
    </Layout>
  )
})
