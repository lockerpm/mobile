import React from "react"
import { observer } from "mobx-react-lite"
import { Text, Layout } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"

export const InAppNotificationScreen = observer(() => {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { translate, color } = useMixins()

  return (
    <Layout
      borderBottom
      hasBottomNav
      containerStyle={{ 
        backgroundColor: uiStore.isDark ? color.background : color.block, 
        paddingTop: 0 
      }}
      header={(
        <Text preset="largeHeader" text={translate('common.tools')} />
      )}
    >
      
    </Layout>
  )
})
