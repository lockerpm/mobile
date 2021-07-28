import { ApiResponse, ApisauceInstance, create } from "apisauce"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"
import { getGeneralApiProblem } from "./api-problem"

/**
 * Manages all requests to the API.
 */
export class Api {
  /**
   * The underlying apisauce instance which performs the requests.
   */
  apisauce: ApisauceInstance

  /**
   * Configurable options.
   */
  config: ApiConfig

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }

  /**
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */
  setup() {
    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
    
    // add monitor for error logging
    const monitor = (response : ApiResponse<any>) => {
      if (__DEV__) {
        console.log(`Calling ${response.config.baseURL}${response.config.url}`)
        const problem = getGeneralApiProblem(response)
        if (problem) {
          console.log(`URL: ${response.config.url} - Status: ${response.status} - Message: ${response.data}`)
        }
      }
    }
    this.apisauce.addMonitor(monitor)
  }
}
