import { memo } from "react"
import { StyleSheet, View } from "react-native"

import { Text, PressableScale, Icon, Button } from "app/components/cores"
import { SubdomainData } from "app/static/types"
import { colorTransparency } from "app/theme"

import { useAppTheme } from "@/utils/useAppTheme"

import { $card, $iconContainer } from "./RootEmailInfo"
import { SectionHeader } from "./SectionHeader"

interface ItemProps {
  subdomain: SubdomainData | null
  onPressInfo: () => void
  onCreate: () => void
  onManage: () => void
  onEdit: () => void
}

export const SubdomainInfo = memo(
  ({ subdomain, onPressInfo, onCreate, onManage, onEdit }: ItemProps) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    return (
      <View>
        <SectionHeader tx="private_relay:manage_subdomain.your_subdomain" />
        <PressableScale onPress={onPressInfo} style={themed($card)}>
          <View style={styles.content}>
            <Icon
              icon="at-fill"
              size={24}
              color={colors.primary}
              containerStyle={themed($iconContainer)}
            />
            {subdomain ? (
              <Text preset="bold" text={`${subdomain.subdomain}.maily.org`} style={styles.text} />
            ) : (
              <Text tx="private_relay:no_subdomain" style={styles.text} />
            )}
            <Icon icon="info" size={24} color={colorTransparency(colors.link, 50)} />
          </View>
          {subdomain ? (
            <View style={styles.actions}>
              <Button
                preset="secondary"
                tx="common:edit"
                style={styles.actionButton}
                onPress={onEdit}
              />
              <Button
                tx="private_relay:manage_subdomain.manage"
                style={styles.actionButton}
                onPress={onManage}
              />
            </View>
          ) : (
            <Button tx="common:create" style={styles.mt16} onPress={onCreate} />
          )}
        </PressableScale>
      </View>
    )
  }
)

SubdomainInfo.displayName = "SubdomainInfo"

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
  mt16: { marginTop: 16 },
  text: {
    flex: 1,
    marginHorizontal: 12,
  },
})
