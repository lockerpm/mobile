import { getGeneralApiProblem } from "@/services/api/apiProblem"
import { Logger } from "@/utils/logger"
import { ApiResponse } from "apisauce"
import { navigationRef } from "./navigationUtilities"
import { RootStore } from "@/models"
import { autofillKeyChain } from "@/utils/autofillData"
import { CommonActions } from "@react-navigation/native"
import { api } from "@/services/api"

export const useMonitorApiResponse = (rootStore: RootStore) => {
  // Set up API listener
  const monitorApiResponse = (response: ApiResponse<any>) => {
    const problem = getGeneralApiProblem(response)

    if (problem) {
      Logger.debug(
        `URL:${response.config?.baseURL}${response.config?.url} - Status: ${
          response.status
        } - Message: ${JSON.stringify(response.data)}`
      )
    }

    if (problem) {
      if (problem.kind === "unauthorized") {
        const ignoredUrls = ["/users/logout", "/sso/auth"]
        const ignoredRoute = ["init", "intro", "onBoarding", "login", "forgotPassword", "signup"]
        const currentRoute = navigationRef.current?.getCurrentRoute()

        if (
          !ignoredUrls.includes(response.config?.url || "") &&
          !ignoredRoute.includes(currentRoute?.name || "")
        ) {
          rootStore.user.setApiToken("")
          rootStore.user.setLoggedIn(false)
          rootStore.user.setLoggedInPw(false)
          rootStore.cipherStore.lock()
          rootStore.collectionStore.lock()
          rootStore.folderStore.lock()
          rootStore.toolStore.lock()

          if (navigationRef.current) {
            autofillKeyChain.resetAll()
            navigationRef.current.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "init" }],
              })
            )
          }
        }
      }
    }
  }
  // const monitorApiRequest = (request: any) => async () => {
  //   Logger.debug(
  //     `Sending API ${request.method}  ${request.baseURL}${request.url} -- ${
  //       request.params ? JSON.stringify(request.params) : ""
  //     }`,
  //   )
  // }

  api.apisauce.addMonitor(monitorApiResponse)
  // api.apisauce.addAsyncRequestTransform(monitorApiRequest)
}
