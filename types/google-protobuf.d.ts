// Type declarations for google-protobuf
declare module "google-protobuf" {
  export class BinaryWriter {
    constructor()
    writeString(field: number, value: string): void
    writeBool(field: number, value: boolean): void
    writeMessage(field: number, writerCallback: () => void): void
    getResultBuffer(): Uint8Array
  }

  export class BinaryReader {
    constructor(bytes: Uint8Array)
    nextField(): boolean
    isEndGroup(): boolean
    getFieldNumber(): number
    readString(): string
    readBool(): boolean
    readMessage(readerCallback: () => void): void
    skipField(): void
  }
}
