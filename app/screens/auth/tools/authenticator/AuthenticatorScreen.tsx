/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/core"
import { AuthenticatorAddAction } from "./AuthenticatorAddAction"
import { BackHandler } from "react-native"
import { OtpList } from "./OtpList"
import { EmptyCipherList, SortActionConfigModal } from "app/components/ciphers"
import { Screen } from "app/components/cores"
import { useStores } from "app/models"
import { FREE_PLAN_LIMIT, MAX_CIPHER_SELECTION } from "app/static/constants"
import { AuthenticatorHeader } from "./AuthenticatorHeader"
import { useHelper } from "app/services/hook"

const EMPTY = require("assets/images/emptyCipherList/password-empty-img.png")

export const AuthenticatorScreen = observer(() => {
  const navigation = useNavigation()
  const { uiStore, user } = useStores()
  const { translate } = useHelper()

  // -------------------- PARAMS ----------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [sortList, setSortList] = useState({
    orderField: "revisionDate",
    order: "desc",
  })
  const [sortOption, setSortOption] = useState("last_updated")
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
    BackHandler.addEventListener("hardwareBackPress", checkSelectBeforeLeaving)
  }, [isSelecting])

  // -------------------- RENDER ----------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <AuthenticatorHeader
          header={translate("authenticator.title")}
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

      <AuthenticatorAddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
        allItemsLength={allItems?.length || 0}
      />

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
          <EmptyCipherList
            img={EMPTY}
            imgStyle={{ height: 55, width: 120 }}
            title={translate("authenticator.empty.title")}
            desc={translate("authenticator.empty.desc")}
            buttonText={translate("authenticator.empty.btn")}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        }
      />
    </Screen>
  )
})
