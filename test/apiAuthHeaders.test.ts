import { api } from "../app/services/api/api"
import { attachmentApi } from "../app/services/api/attachmentApi"
import { toolApi } from "../app/services/api/toolApi"
import { userApi } from "../app/services/api/userApi"

describe("API authentication headers", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    api.apisauce.deleteHeader("Authorization")
    api.apisauce.deleteHeader("Locker-Session-Token")
  })

  it("sends the API token and vault token as separate Bearer headers", async () => {
    jest.spyOn(api.apisauce, "post").mockResolvedValue({ ok: true, data: {} } as any)

    await attachmentApi.getAttachmentUrl("api-token", "vault-token", "attachment-path")

    expect(api.apisauce.headers.Authorization).toBe("Bearer api-token")
    expect(api.apisauce.headers["Locker-Session-Token"]).toBe("Bearer vault-token")
  })

  it("removes a stale vault header before a bootstrap request", async () => {
    api.apisauce.setHeader("Locker-Session-Token", "Bearer stale-vault-token")
    jest.spyOn(api.apisauce, "get").mockResolvedValue({ ok: true, data: {} } as any)

    await userApi.getUser("bootstrap-token")

    expect(api.apisauce.headers.Authorization).toBe("Bearer bootstrap-token")
    expect(api.apisauce.headers["Locker-Session-Token"]).toBeUndefined()
  })

  it("sends both Bearer tokens when syncing scam phone data", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)

    await toolApi.scamSyncPhones("api-token", "vault-token", { cursor: "cursor" })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer api-token",
          "Locker-Session-Token": "Bearer vault-token",
        }),
      })
    )
  })
})
