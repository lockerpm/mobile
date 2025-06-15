import React, { useState, useEffect, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/core"
import { AuthenticatorAddAction } from "./AuthenticatorAddAction"
import { BackHandler } from "react-native"
import { OtpList } from "./OtpList"
import { Screen } from "app/components/cores"
import { useStores } from "app/models"
import { FREE_PLAN_LIMIT, MAX_CIPHER_SELECTION } from "app/static/constants"
import { AuthenticatorHeader } from "./AuthenticatorHeader"
import { useAppLocale } from "app/services/context"
import { EmptyCipherList, SortActionConfigModal, SortConfigType } from "app/components/newCiphers"

const EMPTY = require("assets/images/emptyCipherList/password-empty-img.png")

export const AuthenticatorScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { translate } = useAppLocale()

  // -------------------- PARAMS ----------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfigType>({
    sort: {
      orderField: "revisionDate",
      order: "desc",
    },
    option: "last_updated",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  const disableAddmore = user.isFreePlan && allItems.length === FREE_PLAN_LIMIT.OTP
  // -------------------- EFFECT ----------------------

  // Close select before leave
  useEffect(() => {
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

  const onCloseSortModal = useCallback(() => {
    setIsSortOpen(false)
  }, [])

  const onOpenSortModal = useCallback(() => {
    setIsSortOpen(true)
  }, [])

  // -------------------- RENDER ----------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <AuthenticatorHeader
          header={translate("authenticator.title")}
          openSort={onOpenSortModal}
          openAdd={() => {
            if (disableAddmore) {
              navigation.navigate("payment")
            } else {
              setIsAddOpen(true)
            }
          }}
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
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <SortActionConfigModal
        isOpen={isSortOpen}
        onClose={onCloseSortModal}
        onSelectSortConfig={setSortConfig}
        option={sortConfig.option}
      />

      <AuthenticatorAddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
        allItemsLength={allItems?.length || 0}
      />

      <OtpList
        navigation={navigation}
        searchText={searchText}
        sortList={sortConfig.sort}
        onLoadingChange={setIsLoading}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={
          <EmptyCipherList
            image={EMPTY}
            titleTx="authenticator.empty.title"
            descTx="authenticator.empty.desc"
            buttonTx="authenticator.empty.btn"
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        }
      />
    </Screen>
  )
})
