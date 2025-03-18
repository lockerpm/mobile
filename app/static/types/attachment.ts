export enum UploadAction {
  PRIVATE_ATTACHMENT = "message_attachment",
}

export enum AttachmentCategory {
  MEDIA = "media",
  FILE = "file",
}

export type GetUploadFormData = {
  file_name: string
  metadata: {
    cipher_id: string
  }
}

export type GetUploadFormResult = {
  upload_id: string
  upload_form: {
    url: string
    fields: {
      success_action_status: string
      acl: string
      key: string
      "x-amz-algorithm": string
      "x-amz-credential": string
      "x-amz-date": string
      policy: string
      "x-amz-signature": string
    }
  }
}

export type GetAttachmentUrlResult = {
  url: string
  thumb_url: string
  type: number
  category: AttachmentCategory
  created_time: number
  name: string
  size: number
  metadata: string
}
