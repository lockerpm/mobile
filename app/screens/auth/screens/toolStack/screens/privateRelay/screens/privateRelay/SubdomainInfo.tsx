/* eslint-disable react-native/no-inline-styles */
import { memo } from "react"
import { StyleSheet, View } from "react-native"
import { Text, PressableScale, Icon, Button } from "app/components/cores"
import { colorTransparency } from "app/theme"
import { SubdomainData } from "app/static/types"
import { useAppTheme } from "@/utils/useAppTheme"

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
      theme: { colors },
    } = useAppTheme()
    const title = subdomain ? `${subdomain.subdomain}.maily.org` : ""
    return (
      <PressableScale onPress={onPressInfo}>
        <View
          style={[
            styles.container,
            {
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.email}>
              <Icon
                icon={"at-fill"}
                size={24}
                color={colors.primary}
                containerStyle={{
                  backgroundColor: colorTransparency(colors.primary, 20),
                  borderRadius: 24,
                  padding: 8,
                }}
              />
              <View style={styles.ml8}>
                <Text
                  tx={
                    subdomain
                      ? "private_relay:manage_subdomain.your_subdomain"
                      : "private_relay:no_subdomain"
                  }
                />
                {!!title && <Text preset="bold" text={title} />}
              </View>
            </View>
            <Icon icon={"info"} size={24} color={colorTransparency(colors.link, 50)} />
          </View>
          {!!subdomain && (
            <View style={styles.manageDomain}>
              <Button preset="secondary" tx={"common:edit"} style={styles.mr8} onPress={onEdit} />
              <Button
                tx={"private_relay:manage_subdomain.manage"}
                style={styles.ml8}
                onPress={onManage}
              />
            </View>
          )}
          {!subdomain && <Button tx={"common:create"} style={styles.mt24} onPress={onCreate} />}
        </View>
      </PressableScale>
    )
  }
)
SubdomainInfo.displayName = "SubdomainInfo"

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  email: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  manageDomain: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 24,
  },
  ml8: { flex: 1, marginHorizontal: 8 },
  mr8: { flex: 1, marginRight: 8 },
  mt24: { marginTop: 24 },
})
