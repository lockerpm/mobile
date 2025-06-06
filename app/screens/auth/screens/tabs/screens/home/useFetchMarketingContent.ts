import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { TabsScreenProps } from "app/navigators"
import { useEffect } from "react"

/**
 * Custom hook to fetch marketing content and navigate to the marketing modal if applicable.
 */
export const useFetchMarketingContent = () => {
  const navigation = useNavigation<TabsScreenProps<"homeTab">["navigation"]>()
  const { user, uiStore } = useStores()

  const fetchMarketingContent = async () => {
    const res = await user.fetchMarketingContent()
    if (res.kind === "ok" && Object.keys(res.data).length !== 0) {
      if (!!res.data && res.data.status === "active") {
        navigation.navigate("marketingModal", { data: res.data })
      }
    }
  }

  useEffect(() => {
    if (
      !uiStore.isShowedPopupMarketing &&
      !user.isLifeTimeFamilyPlan &&
      !user.isLifeTimePremiumPlan &&
      user.pwd_user_type !== "enterprise"
    ) {
      fetchMarketingContent()
    }
  }, [])
}
