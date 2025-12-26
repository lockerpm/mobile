import { useEffect } from "react"
import InAppReview from "react-native-in-app-review"

import { useStores } from "@/models"
import { Logger } from "@/utils/logger"
/**
 * Request in-app review
 * This function checks if the in-app review is available and if the user has not already been shown the review prompt.
 * If the conditions are met, it schedules the review prompt to be shown after approximately 6 days of app usage.
 */
export const useInAppReview = () => {
  const { uiStore } = useStores()

  const requestInAppReview = () => {
    if (!InAppReview.isAvailable()) return

    if (uiStore.isShowedAppReview) return

    const currentTime = new Date().getTime()

    // set InAppreview UI display after ~ 6 days  of using this app
    if (uiStore.inAppReviewShowDate) {
      if (uiStore.inAppReviewShowDate < currentTime)
        // trigger UI InAppreview
        InAppReview.RequestInAppReview()
          .then((hasFlowFinishedSuccessfully) => {
            if (hasFlowFinishedSuccessfully) {
              // display ui only 1 time
              uiStore.setIsShowedAppReview(true)
            }
          })
          .catch((error: any) => {
            Logger.error(error)
          })
    } else {
      uiStore.setInAppReviewShowDate(currentTime + 6e8)
    }
  }

  useEffect(() => {
    requestInAppReview()
  }, [])
}
