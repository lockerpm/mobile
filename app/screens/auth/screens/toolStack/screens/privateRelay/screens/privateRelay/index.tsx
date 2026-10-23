import { FC, useCallback } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  SectionListRenderItem,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"

import { Screen, Header } from "app/components/cores"
import { PrivateRelayScreenProps } from "app/navigators"
import { RelayAddress } from "app/static/types"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { AliasItem } from "./PrivateRelayItem"
import { RootEmailInfo } from "./RootEmailInfo"
import { SectionHeader } from "./SectionHeader"
import { SubdomainInfo } from "./SubdomainInfo"
import { AliasSection, usePrivateRelayData } from "./usePrivateRelayData"
import { useRelayNavigation } from "./useRelayNavigation"

export const PrivateRelay: FC<PrivateRelayScreenProps<"relay">> = observer(({ navigation }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const {
    userEmail,
    isFreeAccount,
    isReachLimit,
    sections,
    subdomain,
    isLoading,
    isRefreshing,
    isCreating,
    loadMore,
    refresh,
    createAlias,
  } = usePrivateRelayData()

  const {
    navigateCreateSubdomain,
    navigateRootEmailInfo,
    navigateSubdomainInfo,
    navigateManageSubdomain,
    navigateEditSubdomain,
    openRelayActions,
  } = useRelayNavigation(isFreeAccount, userEmail, subdomain, navigation)

  // ----------------------------METHODS----------------------------

  const onPressAlias = useCallback(
    (item: RelayAddress, isEditable: boolean) => openRelayActions(item, isEditable, isFreeAccount),
    [openRelayActions, isFreeAccount]
  )

  const onEditAlias = useCallback(
    (item: RelayAddress) => openRelayActions(item, true, isFreeAccount, true),
    [openRelayActions, isFreeAccount]
  )

  // ----------------------------RENDER----------------------------

  const renderItem: SectionListRenderItem<RelayAddress, AliasSection> = useCallback(
    ({ item, index, section }) => (
      <AliasItem
        item={item}
        isEditable={section.isEditable}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        onPress={onPressAlias}
        onEdit={onEditAlias}
      />
    ),
    [onPressAlias, onEditAlias]
  )

  const renderSectionHeader = useCallback(
    ({ section }: { section: AliasSection }) => <SectionHeader text={section.title} />,
    []
  )

  const renderSeparator = useCallback(() => <View style={themed($divider)} />, [themed])

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      preset="fixed"
      header={
        <Header
          titleTx="private_relay:title"
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleMode="center"
          rightLoading={isCreating}
          rightIcon="plus"
          rightIconColor={colors.primary}
          rightDisabled={isReachLimit}
          onRightPress={createAlias}
        />
      }
      backgroundColor={colors.block}
      contentContainerStyle={styles.container}
    >
      <SectionList
        sections={sections}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={
          <>
            <RootEmailInfo email={userEmail} onPress={navigateRootEmailInfo} />
            {!isFreeAccount && (
              <SubdomainInfo
                subdomain={subdomain}
                onPressInfo={navigateSubdomainInfo}
                onCreate={navigateCreateSubdomain}
                onManage={navigateManageSubdomain}
                onEdit={navigateEditSubdomain}
              />
            )}
          </>
        }
        ListFooterComponent={
          isLoading && !isRefreshing ? <ActivityIndicator style={styles.loader} /> : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </Screen>
  )
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  height: 1,
  marginHorizontal: 16,
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  loader: {
    margin: 12,
  },
})
