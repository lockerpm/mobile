import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { FlatList, StyleSheet } from "react-native"
import { LoadingHeader } from "../LoadingHeader"
import { ListItem } from "./ListItem"
import { useStores } from "app/models"
import { useCipherHelper } from "app/services/hook"
import { CipherView } from "core/models/view"
import { Header, Screen, Text } from "app/components/cores"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { PasswordHealthStackScreenProps } from "app/navigators"

export const ReusePasswordList: FC<PasswordHealthStackScreenProps<"reusePasswordList">> = observer(
  () => {
    const navigation = useNavigation() as any
    const { toolStore, cipherStore } = useStores()
    const { getWebsiteLogo } = useCipherHelper()

    // -------------- COMPUTED ------------------

    const listData = toolStore.reusedPasswords.map((c: CipherView) => {
      let imgLogo
      if (c.login.uri) {
        const { uri } = getWebsiteLogo(c.login.uri)
        if (uri) {
          imgLogo = { uri }
        } else {
          imgLogo = BROWSE_ITEMS.password.icon
        }
      }
      return {
        ...c,
        logo: BROWSE_ITEMS.password.icon,
        imgLogo,
        count: toolStore.passwordUseMap && toolStore.passwordUseMap.get(c.login.password),
      }
    })

    // -------------- METHODS ------------------

    // Go to detail
    const goToDetail = (item: CipherView) => {
      cipherStore.setSelectedCipher(item)
      navigation.navigate("passwords__info")
    }

    // -------------- RENDER ------------------

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            titleTx="pass_health.reused_passwords.name"
            onLeftPress={navigation.goBack}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <LoadingHeader />

        <FlatList
          style={styles.ph16}
          data={listData}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text tx="common.nothing_here" style={styles.emptyText} />}
          renderItem={({ item }) => <ListItem item={item} goToDetail={goToDetail} />}
          getItemLayout={(data, index) => ({
            length: 71,
            offset: 71 * index,
            index,
          })}
        />
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  emptyText: {
    marginTop: 20,
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
