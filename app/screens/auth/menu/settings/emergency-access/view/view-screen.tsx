import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Layout, Header, Text } from "../../../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import orderBy from 'lodash/orderBy'
// import { ItemsHeader } from "./items-header"
// import { SortAction } from "./sort-action"
import { useMixins } from "../../../../../../services/mixins"
import { useStores } from "../../../../../../models"
import { View } from "react-native"
import { TrustedContact } from "../../../../../../services/api"
import { CipherList } from "./cipher-list"
import { CipherData } from "../../../../../../../core/models/data/cipherData"
import { Cipher } from "../../../../../../../core/models/domain"
import { CipherView } from "../../../../../../../core/models/view"
import { useCipherHelpersMixins } from "../../../../../../services/mixins/cipher/helpers"
import { useCipherDataMixins } from "../../../../../../services/mixins/cipher/data"
import { PrimaryParamList } from "../../../../../../navigators"

type ViewScreenProp = RouteProp<PrimaryParamList, "viewEA">

export const ViewEAScreen = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { user } = useStores()
  const route = useRoute<ViewScreenProp>()

  const { getEncKeyFromDecryptedKey } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()

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

  const [ciphers, setCiphers] = useState([])

  // -------------- METHOD ------------------
  const mount = async () => {
    setIsLoading(true)
    const fetchKeyRes = await user.viewEA(trustContact.id)
    if (fetchKeyRes.kind !== "ok") return
    try {
      const encKey = await getEncKeyFromDecryptedKey(fetchKeyRes.data.key_encrypted)
      const decCiphers = []
      const promises = []

      fetchKeyRes.data.ciphers.forEach(cipherResponse => {
        const cipherData = new CipherData(cipherResponse)
        const cipher = new Cipher(cipherData)
        promises.push(cipher.decrypt(encKey).then(c => {
          decCiphers.push(c)
        }))
      })

      await Promise.all(promises)
      let res = decCiphers.map((c: CipherView) => {
        const cipherInfo = getCipherInfo(c)
        const data = {
          ...c,
          logo: cipherInfo.backup,
          imgLogo: cipherInfo.img,
          svg: cipherInfo.svg,
        }
        return data
      })

      if (sortList) {
        const { orderField, order } = sortList
        res = orderBy(
          res,
          [c => orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate],
          [order]
        ) || []
      }

      // Delay loading
      setTimeout(() => {
        setIsLoading(false)
      }, 50)

      setCiphers(res)
    } catch (e) {
      //
    }
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
          title={translate('emergency_access.view')}
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
      <Text
        text={translate('emergency_access.view_user_vault', { name: trustContact.full_name })}
        style={{ marginLeft: 20 }}
      />

      <CipherList
        ciphers={ciphers}
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        emptyContent={<View>
          <Text text="No data" />
        </View>}
      />
    </Layout>
  )
})