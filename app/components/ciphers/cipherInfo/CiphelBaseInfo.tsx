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
import { StyleProp, View, ViewStyle, Image, StyleSheet } from "react-native"
import { PasswordOtp } from "../passwordOtp/PasswordOtp"
import { CipherEditActionField } from "../cipherEditActionField"
import { ThemedStyle } from "@/theme"

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
      <TextInput
        animated
        editable={false}
        labelTx={"common:owned_by"}
        value={
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
      <CipherEditActionField disabled labelTx="common:folders" style={styles.mt20}>
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
      </CipherEditActionField>
    </View>
  )
}

type SharedWithProps = {
  shareMember: { isShared: boolean; member: SharedMemberType[] }
  show: boolean
  setShow: (show: boolean) => void
}

const SharedWith = ({ shareMember }: SharedWithProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    shareMember.isShared && (
      <View style={styles.mt20}>
        <Text
          weight="medium"
          color={colors.text}
          tx={"common:share_with"}
          style={[styles.label, { backgroundColor: colors.background }]}
        />

        <View style={themed($container)}>
          {shareMember.member.map((element, index) => {
            return (
              <View key={index}>
                {index !== 0 && <View style={themed($divider)} />}
                <View style={styles.memeber}>
                  <Image
                    resizeMode="contain"
                    source={{ uri: element.avatar }}
                    style={styles.avatar}
                  />
                  <Text text={element.email} />
                </View>
              </View>
            )
          })}
        </View>
      </View>
    )
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  width: "100%",
  backgroundColor: colors.border,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 28,
    marginRight: 10,
    width: 28,
  },
  collection: {
    alignItems: "center",
    flexDirection: "row",
  },
  label: {
    left: 0,
    paddingHorizontal: 4,
    position: "absolute",
    top: -14,
    transform: [{ scale: 0.9 }],
    zIndex: 5,
  },
  memeber: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 48,
    padding: 12,
    paddingHorizontal: 12,
  },
  mt10: {
    marginTop: 10,
  },
  mt20: {
    marginTop: 24,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 10,
  },
})
