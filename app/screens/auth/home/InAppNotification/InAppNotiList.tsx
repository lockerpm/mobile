import React, { FC } from "react"
import { FlatList, View } from "react-native"
import { Screen, Header, Text } from "app/components/cores"
import { NotiListItem } from "./InAppNotiItem"
import { AppStackScreenProps } from "app/navigators"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"

export const InAppListNotificationScreen: FC<AppStackScreenProps<"app_list_noti">> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route
    const { translate } = useHelper()
    const { user } = useStores()

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => {
              navigation.goBack()
            }}
            title={translate("common.notifications")}
          />
        }
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <FlatList
          data={route.params?.notifications?.results}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center" }}>
              <Text text="(no data)" />
            </View>
          )}
          ListFooterComponent={() => <View style={{ height: 50 }} />}
          style={{
            paddingHorizontal: 20,
          }}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => <NotiListItem lang={user.language} {...item} />}
        />
      </Screen>
    )
  },
)
