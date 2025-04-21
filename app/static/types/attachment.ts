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
  limit_size: number
  upload_form: {
    url: string
  }
}

export type GetAttachmentUrlResult = {
  url: string
}
