import { ApisauceInstance, create } from "apisauce"
import { CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET, IS_PROD } from "../../config/constants"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"

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
  private _headers = IS_PROD ? {
    Accept: "application/json",
  } : {
    Accept: "application/json",
    "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
    "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET
  }


  setup() {
    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: this._headers,
    })
  }
}
console.log()