import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, Text, FloatingInput, CipherInfoCommon } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { NoteAction } from "../note-action"
import { useStores } from "../../../../../models"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { useMixins } from "../../../../../services/mixins"


export const NoteInfoScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(selectedCipher.id)

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
        paddingTop: 0
      }}
      header={(
        <Header
          goBack={() => navigation.goBack()}
          right={(
            <Button
              preset="link"
              onPress={() => setShowAction(true)}
              style={{ 
                height: 35,
                alignItems: 'center',
                paddingLeft: 10
              }}
            >
              <IoniconsIcon
                name="ellipsis-horizontal"
                size={18}
                color={color.title}
              />
            </Button>
          )}
        />
      )}
    >
      {/* Actions */}
      {
        selectedCipher.deletedDate ? (
          <DeletedAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        ) : (
          <NoteAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        )
      }
      {/* Actions end */}

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.background,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          <BROWSE_ITEMS.note.svgIcon height={55} width={55} />
          <Text
            preset="header"
            style={{ marginTop: 10, marginHorizontal: 20, textAlign: 'center' }}
          >
            {selectedCipher.name}
            {
              notSync && (
                <View style={{ paddingLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
          </Text>
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingVertical: 22
      }]}>
        {/* Notes */}
        <FloatingInput
          label={translate('common.notes')}
          value={selectedCipher.notes}
          editable={false}
          textarea
          fixedLabel
          copyAble
        />

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
      </View>
      {/* Info end */}
    </Layout>
  )
})
