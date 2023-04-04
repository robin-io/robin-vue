import mime from 'mime'

function createUUID (length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function arrayBufferToBlob (buffer: Uint8Array, type: string) {
  return new Blob([buffer], { type: type })
}

function blobToArrayBuffer (blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('loadend', () => {
      resolve(new Uint8Array(reader.result as ArrayBuffer))
    })
    reader.addEventListener('error', reject)
    reader.readAsArrayBuffer(blob)
  })
}

function checkAttachmentType (attachment: any, message: ObjectType): string {
  let strArr = [] as Array<string>

  if (typeof attachment !== 'string') {
    return message.content.mime_type
  } else {
    strArr = attachment.split('.')
  }

  return `${mime.getType(strArr[strArr.length - 1])}`
}

function convertArrayBufferToFile (buffer: Uint8Array, message: ObjectType): File {
  const type = message.content.mime_type
  const blob = arrayBufferToBlob(buffer, type)
  const file = new File([blob], createUUID(36) + '.' + mime.getExtension(type), { type }) as File

  return file
}

function convertFileToURL (file: File): string {
  return URL.createObjectURL(file)
}

export {
  createUUID,
  arrayBufferToBlob,
  blobToArrayBuffer,
  checkAttachmentType,
  convertArrayBufferToFile,
  convertFileToURL
}
