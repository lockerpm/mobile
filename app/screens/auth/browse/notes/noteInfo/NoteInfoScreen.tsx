/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { Image, View } from "react-native"
import { NoteAction } from "../NoteAction"
import { useStores } from "app/models"
import { Header, Icon, Screen, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { CipherInfoCommon, DeletedAction } from "app/components/ciphers"
import { Textarea } from "app/components/utils"
import { useHelper } from "app/services/hook"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { AppStackScreenProps } from "app/navigators/navigators.types"

export const NoteInfoScreen: FC<AppStackScreenProps<"notes__info">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { colors } = useTheme()
  const { translate } = useHelper()

  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
    selectedCipher.id,
  )

  const [showAction, setShowAction] = useState(false)

  const fromQuickShare = route.params?.quickShare
  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          rightIcon={!fromQuickShare ? "dots-three" : undefined}
          onRightPress={() => setShowAction(true)}
        />
      }
    >
      {selectedCipher.deletedDate ? (
        <DeletedAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      ) : (
        <NoteAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      )}

      <Image
        source={BROWSE_ITEMS.note.icon}
        style={{
          height: 55,
          width: 55,
          alignSelf: "center",
        }}
      />

      <Text preset="bold" size="xxl" style={{ margin: 20, textAlign: "center" }}>
        {selectedCipher.name}
        {notSync && (
          <View style={{ paddingLeft: 10 }}>
            <Icon icon="wifi-slash" size={22} />
          </View>
        )}
      </Text>

      <Textarea
        label={translate("common.notes")}
        value={selectedCipher.notes}
        editable={false}
        copyAble
      />

      <CipherInfoCommon cipher={selectedCipher} />
    </Screen>
  )
})
