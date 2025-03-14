import React, { useState, useEffect } from "react"
import { Alert } from "react-native"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { useStores } from "app/models"
import { useAuthentication, useHelper } from "app/services/hook"
import { useNavigation } from "@react-navigation/native"
import { Screen } from "app/components/cores"

import { HomeHeader } from "./HomeHeader"
import { SortActionConfigModal, CipherList, AddCipherActionModal } from "app/components/ciphers"
import { observer } from "mobx-react-lite"
import { HomeSlider } from "./slider-bar/HomeSlider"
import { EmptyCipherList } from "./EmptyCipherList"

export const HomeTabScreen = observer(() => {
  const navigation: any = useNavigation()
  const { uiStore, user } = useStores()
  const { translate } = useHelper()
  const { lock } = useAuthentication()

  // -------------- PARAMS ------------------
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const fetchMarketingContent = async () => {
    const res = await user.fetchMarketingContent()
    if (res.kind === "ok" && Object.keys(res.data).length !== 0) {
      if (!!res.data && res.data.status === "active") {
        navigation.navigate("marketing", { data: res.data })
      }
    }
  }

  const onImport = async () => {
    navigation.navigate("import")
  }

  // ------------------------ EFFECT ----------------------------
  useEffect(() => {
    if (
      !uiStore.isShowedPopupMarketing &&
      !user.isLifeTimeFamilyPlan &&
      !user.isLifeTimePremiumPlan &&
      user.pwd_user_type !== "enterprise"
    ) {
      fetchMarketingContent()
    }
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
      <HomeSlider />

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
            onAdd={() => {
              setIsAddOpen(true)
            }}
            onImport={onImport}
          />
        }
      />
    </Screen>
  )
})
