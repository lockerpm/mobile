import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { FlatList } from "react-native"
import { LoadingHeader } from "../LoadingHeader"
import { ListItem } from "../reusePasswordList/ListItem"
import { useStores } from "app/models"
import { useCipherHelper, useHelper } from "app/services/hook"
import { CipherView } from "core/models/view"
import { Header, Screen, Text } from "app/components/cores"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"

export const ExposedPasswordList = observer(() => {
  const navigation = useNavigation() as any
  const { toolStore, cipherStore } = useStores()
  const { translate } = useHelper()
  const { getWebsiteLogo } = useCipherHelper()

  // -------------- COMPUTED ------------------

  const listData = toolStore.exposedPasswords.map((c: CipherView) => {
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
      imgLogo,
      count: toolStore.exposedPasswordMap && toolStore.exposedPasswordMap.get(c.id),
    }
  })

  // -------------- METHODS ------------------

  // Go to detail
  const goToDetail = (item) => {
    cipherStore.setSelectedCipher(item)
    navigation.navigate("passwords__info")
  }

  // -------------- RENDER ------------------

  const renderItem = ({ item }) => <ListItem item={item} goToDetail={goToDetail} />

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          title={translate("pass_health.exposed_passwords.name")}
          onLeftPress={() => navigation.goBack()}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <LoadingHeader />

      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={listData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text
            text={translate("common.nothing_here")}
            style={{
              textAlign: "center",
              marginTop: 20,
            }}
          />
        }
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
    </Screen>
  )
})
