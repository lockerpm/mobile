import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { TextInput, Text, ImageIcon } from "app/components/cores"
import { useStores } from "app/models"
import { CipherAppView, SharedMemberType } from "app/static/types"
import { getTeam } from "app/utils/cipherHelper"
import { FieldType } from "core/enums"
import { CollectionView } from "core/models/view/collectionView"
import filter from "lodash/filter"
import find from "lodash/find"
import { useState } from "react"
import { StyleProp, View, ViewStyle, Image, TouchableOpacity, StyleSheet } from "react-native"
import { PasswordOtp } from "../passwordOtp/PasswordOtp"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

export interface CipherInfoCommonProps {
  style?: StyleProp<ViewStyle>
  cipher: CipherAppView
}

/**
 * Describe your component here
 */
export const CiphelBaseInfo = (props: CipherInfoCommonProps) => {
  const { style, cipher } = props
  const { translate } = useAppLocale()
  const { user, folderStore, collectionStore, cipherStore } = useStores()

  const [showFullShareMember, setShowFullShareMember] = useState<boolean>(false)

  // ------------- COMPUTED ---------------

  const collections = (() => {
    return (
      filter(
        collectionStore.collections,
        (e) => cipher.collectionIds && cipher.collectionIds.includes(e.id)
      ) || []
    )
  })()

  const folder = (() => {
    return find(folderStore.folders, (e) => e.id === cipher.folderId) || {}
  })()

  const shareMember: { isShared: boolean; member: SharedMemberType[] } = (() => {
    const share = cipherStore.myShares.find((s) => s.id === cipher.organizationId)
    if (share && share.members.length > 0) {
      return { isShared: true, member: share.members }
    }
    return { isShared: false, member: [] }
  })()

  // ------------- RENDER ---------------

  return (
    <View style={[CONTAINER, style]}>
      {/* Custom fields */}
      {(cipher.fields || []).map((item, index) => (
        <View key={index}>
          <TextInput
            isCopyable
            animated
            editable={false}
            isPassword={item.type === FieldType.Hidden}
            label={item.name}
            value={item.value}
          />
          {item.type === FieldType.TOTP && (
            <PasswordOtp data={item.value} secure containerStyle={styles.mt10} />
          )}
        </View>
      ))}

      {/* Owned by */}
      <Text preset="label" size="sm" tx={"common:owned_by"} style={styles.showdBy} />
      <Text
        text={
          getTeam(user.teams, cipher.organizationId).name ||
          getTeam(cipherStore.organizations, cipher.organizationId).name ||
          translate("common:me")
        }
      />

      <SharedWith
        shareMember={shareMember}
        show={showFullShareMember}
        setShow={setShowFullShareMember}
      />

      {/* Folder */}
      <Text preset="label" size="sm" tx={"common:folders"} style={styles.folder} />

      {collections.length > 0
        ? collections.map((c: CollectionView) => (
            <View key={c.id} style={styles.collection}>
              <ImageIcon icon="folder-share" size={30} />
              <Text text={c.name || translate("folder:unassigned")} style={styles.text} />
            </View>
          ))
        : (!cipher.organizationId ||
            !!folder.name ||
            getTeam(user.teams, cipher.organizationId)) && (
            <View style={styles.collection}>
              <ImageIcon icon="folder" size={30} />
              <Text
                text={folder.name || translate("folder:unassigned")}
                numberOfLines={2}
                style={styles.text}
              />
            </View>
          )}
    </View>
  )
}

type SharedWithProps = {
  shareMember: { isShared: boolean; member: SharedMemberType[] }
  show: boolean
  setShow: (show: boolean) => void
}

const SharedWith = ({ shareMember, show, setShow }: SharedWithProps) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const container: ViewStyle = {
    flexDirection: show ? "column" : "row",
    alignItems: !show ? "center" : "flex-start",
  }
  return (
    shareMember.isShared && (
      <View>
        <Text preset="label" tx={"common:share_with"} size="sm" style={styles.label} />

        <View style={container}>
          {shareMember.member.map((element, index) => {
            if (index > 4 && !show) {
              return null
            } else {
              return (
                <View key={index} style={styles.memeber}>
                  <Image
                    resizeMode="contain"
                    source={{ uri: element.avatar }}
                    style={styles.avatar}
                  />
                  {show && <Text text={element.email} />}
                </View>
              )
            }
          })}

          <TouchableOpacity style={styles.show} onPress={() => setShow(!show)}>
            <Text tx={!show ? "common:see_all" : "common:collapse"} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    )
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 30,
    marginRight: 10,
    width: 30,
  },
  collection: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  folder: {
    marginBottom: 10,
    marginTop: 20,
  },
  label: {
    marginBottom: 5,
    marginTop: 20,
  },
  memeber: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 5,
  },
  mt10: {
    marginTop: 10,
  },
  show: {
    marginTop: 10,
  },
  showdBy: {
    marginBottom: 5,
    marginTop: 20,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 10,
  },
})
