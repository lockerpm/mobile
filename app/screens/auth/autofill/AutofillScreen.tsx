import React, { FC, useEffect, useState } from "react"
import { BackHandler, NativeModules } from "react-native"
import { AutoFillList } from "./AutofillList"
import { AndroidAutofillServiceType, parseSearchText } from "app/utils/autofillHelper"
import { useCipherData, useHelper } from "app/services/hook"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { Screen } from "app/components/cores"
import { CipherListHeader, EmptyCipherList, SortActionConfigModal } from "app/components/ciphers"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "app/navigators/navigators.types"

const { RNAutofillServiceAndroid } = NativeModules

const EMPTY_CIPHER = require("assets/images/emptyCipherList/autofill-empty-cipher.png")

export const AutoFillScreen: FC<AppStackScreenProps<"autofill">> = observer((props) => {
  const navigation = props.navigation
  const { data } = props.route.params
  const { copyToClipboard, translate } = useHelper()
  const { getCiphersFromCache } = useCipherData()
  // -------------------- PARAMS ----------------------------
  const suggestSearch = parseSearchText(data.domain)

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState(suggestSearch.length > 0 ? suggestSearch[0] : "")
  const [sortList, setSortList] = useState({
    orderField: "revisionDate",
    order: "desc",
  })
  const [sortOption, setSortOption] = useState("last_updated")

  // -------------------- EFFECT ----------------------------

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

  // Suggest save
  useEffect(() => {
    if (data.type === AndroidAutofillServiceType.AUTOFILL_ITEM) {
      const check = async () => {
        const id = data.lastUserPasswordID
        const allLogins = await getCiphersFromCache({
          deleted: false,
          searchText: "",
          filters: [(c: CipherView) => c.type === CipherType.Login && c.id === id],
        })

        if (allLogins.length > 0) {
          RNAutofillServiceAndroid.useLastItem()
          if (allLogins[0].login.hasTotp) {
            const otp = getTOTP(parseOTPUri(allLogins[0].login.totp))
            copyToClipboard(otp)
          }
        } else {
          RNAutofillServiceAndroid.removeLastItem()
          BackHandler.exitApp()
        }
      }
      check()
    }
  }, [])

  // -------------------- RENDER ----------------------------

  return (
    <Screen
      safeAreaEdges={["bottom", "top"]}
      header={
        <CipherListHeader
          isAutoFill
          header={translate("common.passwords")}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate("passwords__edit", { mode: "add", initialUrl: data.domain })
          }}
          onSearch={setSearchText}
          searchText={searchText}
          isSelecting={false}
          navigation={navigation}
          setIsLoading={() => ""}
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

      <AutoFillList
        navigation={navigation}
        searchText={searchText}
        suggestSearch={suggestSearch}
        setSearchText={setSearchText}
        sortList={sortList}
        emptyContent={
          <EmptyCipherList
            img={EMPTY_CIPHER}
            imgStyle={{ height: 55, width: 120 }}
            title={translate("password.empty.title")}
            desc={translate("password.empty.desc")}
            buttonText={translate("password.empty.btn")}
            addItem={() => {
              navigation.navigate("passwords__edit", {
                mode: "add",
                initialUrl: data.domain,
              })
            }}
          />
        }
      />
    </Screen>
  )
})
