import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, BrowseItemHeader, BrowseItemEmptyContent } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../home/all-item/sort-action"
import { useMixins } from "../../../services/mixins"
import { BackHandler, NativeModules } from "react-native"
import { useStores } from "../../../models"
import { RouteProp, useRoute } from "@react-navigation/native"
import { PrimaryParamList } from "../../../navigators"
import { useCipherToolsMixins } from "../../../services/mixins/cipher/tools"
import { AutoFillList } from "./autofill-list"
import { MAX_CIPHER_SELECTION } from "../../../config/constants"

const { RNAutofillServiceAndroid } = NativeModules

type PasswordEditScreenProp = RouteProp<PrimaryParamList, "autofill">

export const AutoFillScreen = observer(function AutoFillScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { uiStore } = useStores()
  const { checkLoginIdExist } = useCipherToolsMixins()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode } = route.params
  // -------------------- PARAMS ----------------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState(uiStore.deepLinkUrl || '')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
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

  // Suggest save
  useEffect(() => {
    if (mode === 'item') {
      const check = async () => {
        const id = uiStore.saveLastId;
        const res = await checkLoginIdExist(id);
        if (res) {
          RNAutofillServiceAndroid.useLastItem();
        } else {
          RNAutofillServiceAndroid.removeLastItem();
          BackHandler.exitApp();
        }
      }
      check()
    }
  }, [])

  // -------------------- RENDER ----------------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          isAutoFill
          header={translate('common.password')}
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
      )}
      borderBottom
      noScroll
    >
      <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
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
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('password.empty.title')}
            desc={translate('password.empty.desc')}
            buttonText={translate('password.empty.btn')}
            addItem={() => {
              navigation.navigate('passwords__edit', { mode: 'add', initialUrl: uiStore.deepLinkUrl })
            }}
          />
        )}
      />
    </Layout>
  )
})
