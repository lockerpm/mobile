import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import { Text } from "../../text/text"
import find from 'lodash/find'
import { CipherView } from "../../../../core/models/view"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { commonStyles, fontSize } from "../../../theme"
import { FOLDER_IMG } from "../../../common/mappings"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

export interface CipherInfoCommonProps {
  style?: StyleProp<ViewStyle>,
  cipher: CipherView
}

/**
 * Describe your component here
 */
export const CipherInfoCommon = observer(function CipherInfoCommon(props: CipherInfoCommonProps) {
  const { style, cipher } = props
  const { getTeam, getCollections, translate } = useMixins()
  const { user, folderStore } = useStores()

  const [collections, setCollections] = React.useState([])

  const styles = flatten([CONTAINER, style])

  // Computed
  const collection = (() => {
    return { name: translate('folder.unassigned'), id: 'unassigned' }
  })()

  const folder = (() => {
    return find(folderStore.folders, e => e.id === cipher.folderId) || {}
  })()

  // Mounted
  React.useEffect(() => {
    const mounted = async () => {
      const [collectionRes] = await Promise.all([
        getCollections(),
      ])
      setCollections(collectionRes)
      if (__DEV__) {
        console.log(collections)
      }
    }
    mounted()
  }, [])

  return (
    <View style={styles}>
      {/* Owned by */}
      <Text
        text={translate('common.owned_by')}
        style={{ fontSize: fontSize.small, marginTop: 20, marginBottom: 5 }}
      />
      <Text
        preset="black"
        text={getTeam(user.teams, cipher.organizationId).name || 'Me'}
      />

      {/* Folder */}
      <Text
        text={translate('common.folder')}
        style={{ fontSize: fontSize.small, marginTop: 20, marginBottom: 10 }}
      />
      {
        cipher.organizationId ? (
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              collection.id === 'unassigned' ? (
                <FOLDER_IMG.normal.svg height={30} />
              ) : (
                <FOLDER_IMG.share.svg height={30} />
              )
            }
            <Text
              preset="black"
              text={collection.name}
              style={{ marginLeft: 10 }}
            />
          </View>
        ) : (
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <FOLDER_IMG.normal.svg height={30} />
            <Text
              preset="black"
              text={folder.name || translate('folder.unassigned')}
              style={{ marginLeft: 10 }}
            />
          </View>
        )
      }
    </View>
  )
})
