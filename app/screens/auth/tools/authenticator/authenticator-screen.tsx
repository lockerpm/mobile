import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/core"
import { useMixins } from "../../../../services/mixins"
import { Layout, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { SortAction } from "../../home/all-item/sort-action"
import { AuthenticatorAddAction } from "./authenticator-add-action"
import { OtpList } from "./otp-list"
import { useStores } from "../../../../models"
import { BackHandler } from "react-native"


export const AuthenticatorScreen = observer(function AuthenticatorScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation()
  const { uiStore } = useStores()

  // -------------------- PARAMS ----------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')
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
    BackHandler.addEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    }
  }, [isSelecting])

  // -------------------- RENDER ----------------------

  return (
    <Layout
      noScroll
      borderBottom
      hasBottomNav
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          isAuthenticator
          header={translate('authenticator.title')}
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
            if (selectedItems.length < allItems.length) {
              setSelectedItems(allItems)
            } else {
              setSelectedItems([])
            }
          }}
        />
      )}
    >
      {/* Actions */}
      <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <AuthenticatorAddAction 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
      />
      {/* Actions end */}

      {/* OTP list */}
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
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 120 }}
            title={translate('authenticator.empty.title')}
            desc={translate('authenticator.empty.desc')}
            buttonText={translate('authenticator.empty.btn')}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
      {/* OTP list end */}
    </Layout>
  )
})
