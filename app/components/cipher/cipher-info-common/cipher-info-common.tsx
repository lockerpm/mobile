import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import find from 'lodash/find'
import { CipherView } from "../../../../core/models/view"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { commonStyles } from "../../../theme"
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
  const { getTeam, getCollections } = useMixins()
  const { user, folderStore } = useStores()

  const [collections, setCollections] = React.useState([])

  const styles = flatten([CONTAINER, style])

  // Computed
  const collection = (() => {
    return { name: 'Unassigned Folder', id: 'unassigned' }
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
    }
    mounted()
  }, [])

  return (
    <View style={styles}>
      {/* Owned by */}
      <Text
        text="Owned by"
        style={{ fontSize: 10, marginTop: 20, marginBottom: 5 }}
      />
      <Text
        preset="black"
        text={getTeam(user.teams, cipher.organizationId).name || 'Me'}
      />

      {/* Folder */}
      <Text
        text="Folder"
        style={{ fontSize: 10, marginTop: 20, marginBottom: 10 }}
      />
      {
        !!cipher.organizationId ? (
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <Image
              source={FOLDER_IMG[collection.id === 'unassigned' ? 'normal' : 'share'].img}
              style={{
                marginRight: 10
              }}
            />
            <Text
              preset="black"
              text={collection.name}
            />
          </View>
        ) : (
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <Image
              source={FOLDER_IMG.normal.img}
              style={{
                marginRight: 10
              }}
            />
            <Text
              preset="black"
              text={folder.name || 'No folder'}
            />
          </View>
        )
      }
    </View>
  )
})
