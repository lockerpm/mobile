import { useState, useEffect, useCallback } from "react"
import { StyleSheet, View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { OtpListItem } from "./OtpListItem"
import { Text } from "app/components/cores"
import { useCipherData } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { useAppLocale } from "@/i18n"
import { EmptyCipherList } from "@/components/ciphers"
import { SearchBar } from "@/components/utils"
import { CipherAppView } from "@/static/types"
import { orderBy } from "lodash"

const EMPTY = require("assets/images/emptyCipherList/password-empty-img.png")

interface Props {
  isPasswordEdit?: boolean
  selectedOtp?: string
  setOtpCount: (val: number) => void
  openActionMenu: (val: CipherAppView) => void
  openAddMenu?: () => void
  ListHeaderComponent?: JSX.Element
}

/**
 * Describe your component here
 */
export const OtpList = observer(
  ({
    isPasswordEdit,
    selectedOtp,
    setOtpCount,
    openActionMenu,
    openAddMenu,
    ListHeaderComponent,
  }: Props) => {
    const { translate } = useAppLocale()
    const { getCiphersFromCache } = useCipherData()
    const { cipherStore } = useStores()

    // ------------------------ PARAMS ----------------------------

    const [searchText, setSearchText] = useState("")
    const [ciphers, setCiphers] = useState<CipherAppView[]>([])

    // ------------------------ METHODS ----------------------------

    // Get ciphers list
    const loadData = useCallback(async () => {
      // Filter
      const filters = [(c: CipherView) => c.type === CipherType.TOTP]

      // Search
      const searchRes = await getCiphersFromCache({
        filters,
        searchText,
        deleted: false,
        includeExtensions: true,
      })

      const res = orderBy(searchRes, [(c: CipherView) => c.revisionDate], ["desc"]) || []

      setCiphers(
        res.map((e) => ({
          ...e,
          imgLogo: { uri: "" },
          notSync: false,
          isDeleted: false,
        }))
      )
      setOtpCount(searchRes.length)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, setOtpCount])

    // ------------------------ EFFECT ----------------------------

    useEffect(() => {
      loadData()
    }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, loadData])

    const data = isPasswordEdit ? ciphers.sort((c) => (c.notes === selectedOtp ? -1 : 1)) : ciphers
    // ------------------------ RENDER ----------------------------

    return (
      <FlatList
        contentContainerStyle={styles.content}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OtpListItem seletedOtp={selectedOtp} item={item} openActionMenu={openActionMenu} />
        )}
        ListHeaderComponent={
          !isPasswordEdit ? (
            <SearchBar
              onChangeText={setSearchText}
              value={searchText}
              containerStyle={styles.search}
            />
          ) : (
            ListHeaderComponent
          )
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          !searchText.trim() ? (
            <View>
              <EmptyCipherList
                image={EMPTY}
                titleTx="authenticator:empty.title"
                descTx="authenticator:empty.desc"
                buttonTx="authenticator:empty.btn"
                addItem={openAddMenu}
              />
            </View>
          ) : (
            <View>
              <Text
                text={translate("error:no_results_found") + ` '${searchText}'`}
                style={styles.centerText}
              />
            </View>
          )
        }
      />
    )
  }
)

const styles = StyleSheet.create({
  centerText: {
    marginTop: 16,
    textAlign: "center",
  },
  content: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  divider: {
    height: 12,
  },
  search: {
    marginBottom: 16,
  },
})
