import { useState, useEffect, FC, useCallback } from "react"
import { StyleSheet } from "react-native"
import ChatWootWidget from "@chatwoot/react-native-widget"
import { observer } from "mobx-react-lite"

import { Screen, TabHeader } from "app/components/cores"
import { MenuItem, MenuItemContainer, MenuItemProps } from "app/components/utils"
import { useStores } from "app/models"
import { TabsScreenProps } from "app/navigators/navigators.types"
import { useToast } from "app/services/utils"
import { ChatWootUser, PlanType } from "app/static/types"

import Config from "@/config"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { AppUser } from "./appUser"
import { AppVersion } from "./AppVersion"
import { ReferFriendMenuItem } from "./ReferFriendMenuItem"
import { useMenuListNavigation } from "./useMenuListNavigation"

export const MenuListScreen: FC<TabsScreenProps<"menuTab">> = observer(() => {
  const { user } = useStores()
  const {
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()

  const {
    navigateToPayment,
    navigateToFamilyPayment,
    navigateToInviteMember,
    navigateToSettings,
    navigateToHelp,
    navigateToLockScreen,
    navigateToLogoutScreen,
    navigateToReferfriend,
  } = useMenuListNavigation()

  const isFreeAccount = user.isFreePlan
  const isPremiumAccount = user.isPremiumPlan

  const [showChatWootWidget, toggleChatWootWidget] = useState(false)
  const [chatwootUser, setChatwoodUser] = useState<ChatWootUser | null>(null)

  // -------------------METHODS-----------------------

  const getChatWoodIdHash = useCallback(async () => {
    const res = await user.getChatWootIdHash()
    if (res.kind === "ok") {
      setChatwoodUser(res.data)
    } else {
      notifyApiError(res)
    }
  }, [])

  // -------------------EFFECT-----------------------

  useEffect(() => {
    getChatWoodIdHash()
  }, [])

  // ------------------COMPUTED------------------------

  const items: MenuItemProps[] = [
    {
      family: user.plan ? [(PlanType.FREE, PlanType.PREMIUM)].includes(user.plan?.alias) : false,
      icon: "invite",
      name: translate("menu:invite"),
      onPress: () => {
        if (isFreeAccount || (isPremiumAccount && !user.plan?.is_family)) {
          navigateToFamilyPayment()
        } else {
          navigateToInviteMember()
        }
      },
      hide: user.pwd_user_type === "enterprise" || user.isLifeTimePremiumPlan,
    },
    {
      icon: "star",
      name: translate("menu:plan"),
      onPress: navigateToPayment,
      hide:
        user.pwd_user_type === "enterprise" ||
        user.isLifeTimePremiumPlan ||
        user.isLifeTimeFamilyPlan ||
        user.isLifeTimeTeamFamilyPlan,
    },
    {
      icon: "gear",
      name: translate("common:settings"),
      onPress: navigateToSettings,
    },
    {
      icon: "question",
      name: translate("common:help"),
      onPress: navigateToHelp,
    },
  ]

  const items2: MenuItemProps[] = [
    {
      icon: "lock-key",
      name: translate("common:lock"),
      onPress: navigateToLockScreen,
    },
    {
      icon: "sign-out",
      name: translate("common:signout"),
      onPress: navigateToLogoutScreen,
    },
  ]

  // -------------- RENDER --------------------

  return (
    <Screen
      preset="auto"
      backgroundColor={colors.block}
      header={<TabHeader titleTx="common:menu" />}
      contentContainerStyle={styles.ph16}
    >
      <AppUser />

      <MenuItemContainer>
        {items
          .filter((item) => !item.hide)
          .map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
      </MenuItemContainer>

      {
        !(
          user.pwd_user_type === "enterprise" ||
          user.isLifeTimePremiumPlan ||
          (user.isLifeTimeFamilyPlan && <ReferFriendMenuItem onPress={navigateToReferfriend} />)
        )
      }
      <MenuItemContainer>
        <MenuItem
          icon={"headset"}
          name={translate("common:customer_service")}
          onPress={() => toggleChatWootWidget(true)}
        />
      </MenuItemContainer>

      <ChatWootWidget
        colorScheme={themeContext}
        websiteToken={Config.CHATWOOT_WEBSITE_TOKEN}
        locale={chatwootUser?.language_override}
        baseUrl={Config.CHATWOOT_BASE_URL}
        closeModal={() => toggleChatWootWidget(false)}
        isModalVisible={showChatWootWidget}
        user={{
          identifier: chatwootUser?.email || user.email,
          name: chatwootUser?.name || user.full_name,
          avatar_url: user.avatar,
          email: chatwootUser?.email || user.email,
          identifier_hash: chatwootUser?.user_hash || "",
        }}
        customAttributes={{
          pricingPlan: user.pwd_user_type !== "enterprise" ? user.plan : "enterprise",
        }}
      />

      <MenuItemContainer>
        {items2.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </MenuItemContainer>

      <AppVersion />
    </Screen>
  )
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
