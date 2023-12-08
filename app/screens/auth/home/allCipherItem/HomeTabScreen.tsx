import React, { useState, useEffect, useRef } from "react"
import { Alert, BackHandler, View, AppState, LayoutAnimation } from "react-native"
import { Logger } from "app/utils/utils"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { useTheme } from "app/services/context"
import { AutofillServiceEnabled } from "app/utils/autofillHelper"
import { useStores } from "app/models"
import { useAuthentication, useHelper } from "app/services/hook"
import { useNavigation } from "@react-navigation/native"
import { Icon, Screen, Text } from "app/components/cores"

import { HomeHeader } from "./HomeHeader"
import {
  SortActionConfigModal,
  EmptyCipherList,
  CipherList,
  AddCipherActionModal,
} from "app/components/ciphers"
import { observer } from "mobx-react-lite"
import { SuggestEnableFaceID } from "./SuggestEnableFaceID"

const HOME_EMPTY_CIPHER = require("assets/images/emptyCipherList/home-empty-cipher.png")

export const HomeTabScreen = observer(() => {
  const navigation: any = useNavigation()
  const { uiStore, user } = useStores()
  const { translate, isBiometricAvailable } = useHelper()
  const { lock } = useAuthentication()

  // -------------- PARAMS ------------------
  const [isAutofillEnabled, setIsAutofillEnabled] = useState(true)
  const [isShowAutofillSuggest, setShowAutofillSuggest] = useState(true)
  const [isShowFaceIDSuggest, setShowFaceIDSuggest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [sortList, setSortList] = useState({
    orderField: "revisionDate",
    order: "desc",
  })
  const [sortOption, setSortOption] = useState("last_updated")
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const handleShowFaceIDSuggest = async () => {
    if (!user.isBiometricUnlock) {
      const available = await isBiometricAvailable()
      if (available) setShowFaceIDSuggest(true)
    }
  }
  // ------------------------ EFFECT ----------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  useEffect(() => {
    // set Most relevant by defalt when users search
    if (searchText) {
      if (searchText.trim().length === 1) {
        setSortList(null)
        setSortOption("most_relevant")
      }
    } else {
      setSortList({
        orderField: "revisionDate",
        order: "desc",
      })
      setSortOption("last_updated")
    }
  }, [searchText])

  // Navigation event listener
  useEffect(() => {
    const handleBack = (e) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()

      Alert.alert(translate("alert.lock_app"), "", [
        {
          text: translate("common.cancel"),
          style: "cancel",
          onPress: () => null,
        },
        {
          text: translate("common.lock"),
          style: "destructive",
          onPress: async () => {
            await lock()
            navigation.navigate("lock")
          },
        },
      ])
    }
    navigation.addListener("beforeRemove", handleBack)
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
    BackHandler.addEventListener("hardwareBackPress", checkSelectBeforeLeaving)
  }, [isSelecting])

  // Mounted
  useEffect(() => {
    handleShowFaceIDSuggest()
    if (uiStore.deepLinkAction === "add") {
      if (["add", "save"].includes(uiStore.deepLinkAction)) {
        navigation.navigate("passwords__edit", { mode: "add" })
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      AutofillServiceEnabled((isActived, androidNotSupport) => {
        setIsAutofillEnabled(isActived)
        if (androidNotSupport) {
          setShowAutofillSuggest(false)
        }
      })
    }
  }, [appStateVisible, isLoading])

  // -------------- RENDER ------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <HomeHeader
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
            const maxLength = Math.min(allItems.length, MAX_CIPHER_SELECTION)
            if (selectedItems.length < maxLength) {
              setSelectedItems(allItems.slice(0, maxLength))
            } else {
              setSelectedItems([])
            }
          }}
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

      <AddCipherActionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
      />

      <SuggestEnableAutofill
        isShow={isShowAutofillSuggest && !isAutofillEnabled && !isShowFaceIDSuggest}
        onClose={() => {
          LayoutAnimation.configureNext({
            duration: 250,
            update: {
              type: LayoutAnimation.Types.easeInEaseOut,
            },
          })
          setShowAutofillSuggest(false)
        }}
      />

      <SuggestEnableFaceID
        isShow={isShowFaceIDSuggest}
        onClose={() => {
          LayoutAnimation.configureNext({
            duration: 250,
            update: {
              type: LayoutAnimation.Types.easeInEaseOut,
            },
          })
          setShowFaceIDSuggest(false)
        }}
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
        emptyContent={
          <EmptyCipherList
            img={HOME_EMPTY_CIPHER}
            imgStyle={{ height: 55, width: 120 }}
            title={translate("all_items.empty.title")}
            desc={translate("all_items.empty.desc")}
            buttonText={translate("all_items.empty.btn")}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        }
      />
    </Screen>
  )
})

const SuggestEnableAutofill = ({ isShow, onClose }) => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { translate } = useHelper()
  return (
    isShow && (
      <View
        style={{
          borderWidth: 1,
          marginVertical: 12,
          marginHorizontal: 16,
          borderColor: colors.palette.orange8,
          backgroundColor: colors.palette.orange3,
          flexDirection: "row",
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 12,
        }}
      >
        <Icon
          icon="keyboard"
          size={32}
          containerStyle={{
            marginRight: 16,
          }}
        />

        <View style={{ marginRight: 80 }}>
          <Text text={translate("all_items.enable_autofill.content")} />
          <Text
            preset="bold"
            text={translate("all_items.enable_autofill.btn")}
            color={colors.link}
            style={{
              marginTop: 10,
            }}
            onPress={() => {
              navigation.navigate("autofillService")
            }}
          />
        </View>
        <View
          style={{
            position: "absolute",
            top: 20,
            right: 20,
          }}
        >
          <Icon
            icon="x"
            size={20}
            onPress={() => {
              onClose(true)
            }}
          />
        </View>
      </View>
    )
  )
}
