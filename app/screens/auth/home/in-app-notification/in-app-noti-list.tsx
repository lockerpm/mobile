import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, View } from "react-native"
import { Layout, Header } from "../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { NotiListItem } from "./in-app-noti-item"
import { commonStyles } from "../../../../theme"
import { PrimaryParamList } from "../../../../navigators"
import { useStores } from "../../../../models"


type FolderSelectScreenProp = RouteProp<PrimaryParamList, 'app_list_noti'>;


export const InAppListNotification = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<FolderSelectScreenProp>()
  const { user } = useStores()
  const { translate, color } = useMixins()

  return (
    <Layout
      noScroll
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('common.notifications')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.background, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.SECTION_PADDING, { flex: 1 }]}>
        <FlatList
          data={route.params?.notifications?.results}
          ListEmptyComponent={() => (
            <View>

            </View>
          )}
          keyExtractor={(_, index) => String(index)}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <NotiListItem
              lang={user.language}
              {...item} />
          )}
        />
      </View>

    </Layout>
  )
})
