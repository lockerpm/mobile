import React, { useState, useEffect, useRef  } from "react"
import { observer } from "mobx-react-lite"
import { CipherList, Layout, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { ItemsHeader } from "./items-header"
import { SortAction } from "./sort-action"
import { AddAction } from "./add-action"
import { useMixins } from "../../../../services/mixins"
import { Alert, BackHandler, Image, View, Text, TouchableOpacity, Linking, AppState } from "react-native"
import { useStores } from "../../../../models"
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"
import AntDesign from 'react-native-vector-icons/AntDesign'
import { IS_IOS } from "../../../../config/constants"
import RNAndroidSettingsTool from "react-native-android-settings-tool"
import { AutofillServiceEnabled } from "../../../../utils/Autofill"

export const AllItemScreen = observer(() => {
  const navigation = useNavigation()
  const { uiStore } = useStores()
  const { translate } = useMixins()
  const { lock } = useCipherAuthenticationMixins()

  // -------------- PARAMS ------------------
  const [isAutofillEnabled, setIsAutofillEnabled] = useState(true)
  const [isShowAutofillSuggest, setShowAutofillSuggest] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  // -------------- EFFECT ------------------

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      setAppStateVisible(nextAppState);
    });

    return () => {
      subscription == null;
    };
  }, []);

  // Navigation event listener
  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()

      Alert.alert(
        translate('alert.lock_app'),
        '',
        [
          {
            text: translate('common.cancel'),
            style: 'cancel',
            onPress: () => { }
          },
          {
            text: translate('common.lock'),
            style: 'destructive',
            onPress: async () => {
              await lock()
              navigation.navigate('lock')
            }
          },
        ]
      )
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])



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

  // Mounted
  useEffect(() => {
    if (uiStore.deepLinkAction === 'add') {
      if (['add', 'save'].includes(uiStore.deepLinkAction)) {
        navigation.navigate('passwords__edit', { mode: 'add' })
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      AutofillServiceEnabled(isActived => {
        setIsAutofillEnabled(isActived)
      })
    }
  }, [appStateVisible])
  // -------------- RENDER ------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <ItemsHeader
          navigation={navigation}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          onSearch={setSearchText}
          searchText={searchText}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setIsLoading={setIsLoading}
          toggleSelectAll={() => {
            if (selectedItems.length < allItems.length) {
              setSelectedItems(allItems)
            } else {
              setSelectedItems([])
            }
          }}
        />
      )}
      borderBottom
      noScroll
      hasBottomNav
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

      <AddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
      />
      <SuggestEnableAutofill
        isShow={isShowAutofillSuggest && !isAutofillEnabled}
        onClose={() => setShowAutofillSuggest(false)}
      />

      <CipherList
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
            title={translate('all_items.empty.title')}
            desc={translate('all_items.empty.desc')}
            buttonText={translate('all_items.empty.btn')}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
    </Layout>
  )
})


const SuggestEnableAutofill = ({ isShow, onClose }) => {
  const { translate } = useMixins()
  const handleOpenAutofillSetting = () => {
    if (IS_IOS) {
      Linking.canOpenURL('app-settings:').then(supported => {
        if (supported) {
          Linking.openURL('App-prefs:root=General&path=Passwords')
        }
      })
    } else {
      RNAndroidSettingsTool.ACTION_REQUEST_SET_AUTOFILL_SERVICE('packge:com.cystack.locker')
    }
  }

  return isShow && <View
    style={{
      borderWidth: 1,
      borderColor: "orange",
      backgroundColor: "#FCFAF0",
      flexDirection: "row",
      paddingVertical: 16,
      paddingHorizontal: 20,
      width: "100%",
    }}>

    <Image
      source={require("./Keyboard.png")}
      style={{
        width: 32,
        height: 32,
        marginRight: 16
      }}></Image>
    <View>
      <Text>{translate("all_items.enable_autofill.title")}</Text>
      <Text>{translate("all_items.enable_autofill.content")}</Text>
      <TouchableOpacity
        onPress={() => {
          handleOpenAutofillSetting()
        }}>
        <Text style={{
          color: "#007AFF",
          fontWeight: "700"
        }}>{translate("all_items.enable_autofill.btn")}</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      style={{
        alignItems: "flex-end"
      }}
      onPress={() => {
        onClose(true)
      }}>
      <AntDesign name="close" size={20} color={"black"} />
    </TouchableOpacity>

  </View>

}