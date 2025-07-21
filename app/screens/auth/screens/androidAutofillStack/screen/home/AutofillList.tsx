import { useState, useEffect, useCallback } from "react"
import { View, FlatList, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "app/components/cores"
import { useCipherData } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { CipherAppView } from "@/static/types"
import { AutofillListItem } from "./ListItem"
import { parseSearchText } from "@/utils/autofillHelper"
import { getCipherLogo } from "@/utils/cipherHelper"
import { EmptyCipherList } from "@/components/ciphers"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { useAppLocale } from "@/i18n"
import { SearchBar } from "@/components/utils"

const EMPTY_CIPHER = require("assets/images/emptyCipherList/autofill-empty-cipher.png")

interface AutoFillListProps {
  domain: string
  openActionMenu: (item: CipherAppView) => void
  navigateToAddCipher: () => void
}

/**
 * Describe your component here
 */
export const AutoFillList = observer(
  ({ domain, openActionMenu, navigateToAddCipher }: AutoFillListProps) => {
    const { getCiphersFromCache } = useCipherData()
    const { themed } = useAppTheme()
    const { cipherStore } = useStores()
    const { translate } = useAppLocale()

    // ------------------------ PARAMS ----------------------------
    const suggestSearch = parseSearchText(domain)

    const [searchText, setSearchText] = useState(suggestSearch.length > 0 ? suggestSearch[0] : "")
    const [ciphers, setCiphers] = useState<CipherAppView[]>([])
    const [isLoadingDone, setIsLoadingDone] = useState(false)

    // ------------------------ METHODS ----------------------------

    // Get ciphers list
    const loadData = async () => {
      setIsLoadingDone(true)
      // Search
      const searchRes = await getCiphersFromCache({
        filters: [(c: CipherView) => c.type === CipherType.Login],
        searchText,
        deleted: false,
      })

      // Add image
      const res = searchRes.map((c: CipherView) => {
        const cipherLogo = getCipherLogo(c)
        const data = {
          ...c,
          imgLogo: cipherLogo,
          notSync: false,
          isDeleted: c.isDeleted,
        }
        return data
      })

      // Done
      setCiphers(res)
      setIsLoadingDone(false)
    }
    // ------------------------ WATCHERS ----------------------------

    useEffect(() => {
      loadData()
    }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate])

    // ------------------------ RENDER ----------------------------
    const renderEmptyComponents = useCallback(() => {
      if (isLoadingDone) return null

      if (!searchText.trim()) {
        return (
          <View style={styles.emptyContainer}>
            <EmptyCipherList
              image={EMPTY_CIPHER}
              titleTx="password:empty.title"
              descTx="password:empty.desc"
              buttonTx="password:empty.btn"
              addItem={navigateToAddCipher}
            />
          </View>
        )
      }
      return (
        <View style={styles.emptyContainer}>
          <Text preset="label" text={translate("error:no_results_found") + ` '${searchText}'`} />
          {suggestSearch.length > 1 && searchText === suggestSearch[0] && (
            <View>
              <Text preset="label" tx="autofill_service:searchFor" style={styles.searchDesc} />

              <View style={themed($suggestContainer)}>
                {suggestSearch.slice(1).map((text, index) => (
                  <TouchableOpacity
                    key={text}
                    style={[
                      themed($suggest),
                      // eslint-disable-next-line react-native/no-inline-styles
                      {
                        borderBottomWidth: index !== suggestSearch.length - 2 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      setSearchText(text)
                    }}
                  >
                    <Text text={text} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )
    }, [isLoadingDone, searchText])

    return (
      <FlatList
        data={ciphers}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AutofillListItem item={item} openActionMenu={openActionMenu} />}
        ListHeaderComponent={
          <SearchBar
            containerStyle={styles.searchContainer}
            onChangeText={setSearchText}
            value={searchText}
          />
        }
        ItemSeparatorComponent={() => <View style={themed($divider)} />}
        ListEmptyComponent={renderEmptyComponents}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
    )
  }
)

const $suggest: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderBottomColor: colors.disable,
})

const $suggestContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.block,
  borderRadius: 12,
  paddingVertical: 4,
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 16 + StaticSafeAreaInsets.safeAreaInsetsBottom,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 2,
    marginTop: 10,
  },
  searchDesc: {
    marginBottom: 16,
    marginTop: 8,
  },
})
