import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import find from 'lodash/find'
import { useStores } from "../../../models"
import { OwnershipAction } from "../cipher-action/ownership-action"
import { color, commonStyles } from "../../../theme"
import { FloatingInput } from "../../floating-input/floating-input"
import { translate } from "../../../i18n"


export interface CipherOthersInfoProps {
  navigation: any,
  hasNote?: boolean,
  note?: string,
  onChangeNote?: Function,
  folderId?: string
}

/**
 * Describe your component here
 */
export const CipherOthersInfo = observer(function CipherOthersInfo(props: CipherOthersInfoProps) {
  const { navigation, hasNote, note, onChangeNote, folderId = null } = props
  const { folderStore } = useStores()

  const [showOwnershipAction, setShowOwnershipAction] = useState(false)

  const folder = (() => {
    return folderId ? find(folderStore.folders, e => e.id === folderId) || {} : {}
  })()

  return (
    <View>
      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('common.others')}
          style={{ fontSize: 10 }}
        />
      </View>

      {/* Others */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {/* Folder */}
        <Button
          preset="link"
          onPress={() => {
            navigation.navigate('folders__select', {
              mode: 'add',
              initialId: folderId
            })
          }}
        >
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%'
            }]}
          >
            <View>
              <Text
                text={translate('common.folder')}
                style={{ fontSize: 10 }}
              />
              <Text
                preset="black"
                text={folder.name || translate('common.none')}
              />
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </Button>
        {/* Folder end */}

        {/* Ownership */}
        <Button
          preset="link"
          onPress={() => setShowOwnershipAction(true)}
          style={{
            marginTop: 20
          }}
        >
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%'
            }]}
          >
            <View>
              <Text
                text={translate('common.ownership')}
                style={{ fontSize: 10 }}
              />
              <Text
                preset="black"
                text={translate('common.none')}
              />
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </Button>
        {/* Ownership end */}

        {/* Note */}
        {
          hasNote && (
            <View style={{ flex: 1, marginTop: 20 }}>
              <FloatingInput
                fixedLabel
                textarea
                label={translate('common.notes')}
                value={note}
                onChangeText={(text) => onChangeNote(text)}
              />
            </View>
          )
        }
        {/* Note end */}
      </View>
      {/* Others end */}

      <OwnershipAction
        isOpen={showOwnershipAction}
        onClose={() => setShowOwnershipAction(false)}
      />
    </View>
  )
})
