import { ApisauceInstance, create } from "apisauce"

import Config from "@/config"

import { ApiConfig, DEFAULT_API_CONFIG } from "./apiConfig"
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
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */
  private _headers = Config.IS_PROD
    ? {
        Accept: "application/json",
      }
    : {
        Accept: "application/json",
        "CF-Access-Client-Id": Config.CF_ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": Config.CF_ACCESS_CLIENT_SECRET,
      }

  /**
   * Set up our API instance. Keep this lightweight!
   * @param config The configuration to use.
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: this._headers,
    })
  }

  setBaseApiUrl(url: string) {
    this.apisauce.setBaseURL(url)
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
