import React, { useState, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { CipherList, Layout, BrowseItemEmptyContent, Header } from "../../../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
// import { ItemsHeader } from "./items-header"
// import { SortAction } from "./sort-action"
import { useMixins } from "../../../../../../services/mixins"
import { useStores } from "../../../../../../models"
import { useCipherAuthenticationMixins } from "../../../../../../services/mixins/cipher/authentication"
import AntDesign from 'react-native-vector-icons/AntDesign'
import { MAX_CIPHER_SELECTION } from "../../../../../../config/constants"
import { EmergencyAccessParamList } from "../emergency-access-screen"
import { View } from "react-native"
import { TrustedContact } from "../../../../../../services/api"

type ViewScreenProp = RouteProp<EmergencyAccessParamList, "viewEA">

export const ViewEAScreen = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { user } = useStores()
  const route = useRoute<ViewScreenProp>()
  const { lock } = useCipherAuthenticationMixins()

  const trustContact: TrustedContact = route.params.trusted
  // -------------- PARAMS ------------------
  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  // -------------- METHOD ------------------
  const mount = async () => {
    const fetchKeyRes = await user.viewEA(trustContact.id)
    if (fetchKeyRes.kind !== "ok") return

    console.log(fetchKeyRes.data.ciphers)
  }

  // -------------- EFFECT ------------------
  useEffect(() => {
    mount()
  }, [])


  // -------------- RENDER ------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title={"View EA"}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      borderBottom
      noScroll
      hasBottomNav
    >
      {/* <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      /> */}

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
      // emptyContent={}
      />
    </Layout>
  )
})