import { useCallback, useEffect, useRef } from "react"
import { useNavigation } from "@react-navigation/native"

import { TabsScreenProps } from "app/navigators"
import { KdfType } from "core/enums/kdfType"

import { useCoreService } from "@/services/coreService"
import { MPEncodeConfig } from "@/static/types"

/**
 * Custom hook to handle back navigation in the home tab.
 */
export const useShowRecommendEncryption = () => {
  const { userService } = useCoreService()
  const navigation = useNavigation<TabsScreenProps<"homeTab">["navigation"]>()

  const config = useRef<MPEncodeConfig>({
    kdf: userService.getKdf(),
    kdf_iterations: userService.getKdfIterations(),
    kdf_version: userService.getKdfVersion(),
  })

  const navigateToUpdateEncryption = useCallback(() => {
    navigation.navigate("updateEncryption")
  }, [navigation])

  // ------------------------ EFFECT ----------------------------
  useEffect(() => {
    navigateToUpdateEncryption()
    if (config.current.kdf_version) {
    }
    // if (config.current.kdf === KdfType.PBKDF2_SHA256 && config.current.kdf_iterations < 600000) {
    //   navigateToUpdateEncryption()
    // }
  }, [navigateToUpdateEncryption])
}
