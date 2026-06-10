import { google } from 'googleapis'

const ROOT_FOLDER_NAME = 'Contratos de Arrendamiento'
const TEMPLATES_FOLDER_NAME = '_plantillas'
const PROPERTIES_FOLDER_NAME = 'inmuebles'

function getAuth(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return auth
}

export function getDriveClient(accessToken: string) {
  return google.drive({ version: 'v3', auth: getAuth(accessToken) })
}

export function getDocsClient(accessToken: string) {
  return google.docs({ version: 'v1', auth: getAuth(accessToken) })
}

export async function findFolder(
  drive: ReturnType<typeof getDriveClient>,
  name: string,
  parentId?: string,
) {
  const conditions = [
    `name = '${name}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `trashed = false`,
  ]
  if (parentId) conditions.push(`'${parentId}' in parents`)

  const res = await drive.files.list({
    q: conditions.join(' and '),
    fields: 'files(id, name)',
    spaces: 'drive',
  })
  return res.data.files?.[0]?.id ?? null
}

export async function findOrCreateFolder(
  drive: ReturnType<typeof getDriveClient>,
  name: string,
  parentId?: string,
) {
  const existing = await findFolder(drive, name, parentId)
  if (existing) return existing

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id',
  })
  return res.data.id!
}

export async function initRootStructure(accessToken: string) {
  const drive = getDriveClient(accessToken)
  const rootId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME)
  await findOrCreateFolder(drive, TEMPLATES_FOLDER_NAME, rootId)
  await findOrCreateFolder(drive, PROPERTIES_FOLDER_NAME, rootId)
  return rootId
}

export async function getRootFolderId(accessToken: string) {
  const drive = getDriveClient(accessToken)
  return findOrCreateFolder(drive, ROOT_FOLDER_NAME)
}

export async function getPropertiesFolderId(accessToken: string) {
  const drive = getDriveClient(accessToken)
  const rootId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME)
  return findOrCreateFolder(drive, PROPERTIES_FOLDER_NAME, rootId)
}

export async function getTemplatesFolderId(accessToken: string) {
  const drive = getDriveClient(accessToken)
  const rootId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME)
  return findOrCreateFolder(drive, TEMPLATES_FOLDER_NAME, rootId)
}

export async function createPropertyFolder(accessToken: string, address: string, isTemplate: boolean = false) {
  const drive = getDriveClient(accessToken)
  const parentId = isTemplate 
    ? await getTemplatesFolderId(accessToken)
    : await getPropertiesFolderId(accessToken)
  return findOrCreateFolder(drive, address, parentId)
}

export async function createDocFromText(
  accessToken: string,
  title: string,
  body: string,
  parentFolderId: string,
) {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentFolderId],
    },
    fields: 'id,webViewLink',
  })
  const fileId = res.data.id!

  const docs = getDocsClient(accessToken)
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: body,
          },
        },
      ],
    },
  })
  return { fileId, webViewLink: res.data.webViewLink! }
}

export async function saveFileMetadata(
  accessToken: string,
  fileId: string,
  metadata: Record<string, string>,
) {
  const drive = getDriveClient(accessToken)
  await drive.files.update({
    fileId,
    requestBody: {
      properties: metadata,
    },
  })
}

export async function getFileMetadata(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.get({
    fileId,
    fields: 'id,name,properties,webViewLink,createdTime,modifiedTime',
  })
  return res.data
}

export async function listContractsInFolder(accessToken: string, folderId: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
    fields: 'files(id,name,properties,webViewLink,createdTime,modifiedTime)',
    orderBy: 'createdTime desc',
  })
  return res.data.files ?? []
}

export async function saveContractConfig(
  accessToken: string,
  folderId: string,
  docName: string,
  configData: any,
  existingConfigFileId?: string,
) {
  const drive = getDriveClient(accessToken)
  
  if (existingConfigFileId) {
    const res = await drive.files.update({
      fileId: existingConfigFileId,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(configData, null, 2),
      },
      fields: 'id',
    })
    return res.data.id!
  }

  const res = await drive.files.create({
    requestBody: {
      name: `${docName} - Config.json`,
      mimeType: 'application/json',
      parents: [folderId],
    },
    media: {
      mimeType: 'application/json',
      body: JSON.stringify(configData, null, 2),
    },
    fields: 'id',
  })
  return res.data.id!
}

export async function getContractConfig(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.get({
    fileId,
    alt: 'media',
  })
  return res.data
}

// ============= MDX Template functions =============

export async function listMdxTemplates(accessToken: string) {
  const drive = getDriveClient(accessToken)
  const templatesFolderId = await getTemplatesFolderId(accessToken)

  const res = await drive.files.list({
    q: `'${templatesFolderId}' in parents and name contains '.mdx' and trashed = false`,
    fields: 'files(id,name,createdTime,modifiedTime)',
    orderBy: 'createdTime desc',
  })
  return res.data.files ?? []
}

/** Lists Google Docs created via the wizard (old format) stored in _plantillas/ subfolders. */
export async function listDocTemplates(accessToken: string) {
  const drive = getDriveClient(accessToken)
  const templatesFolderId = await getTemplatesFolderId(accessToken)

  // Get subfolders inside _plantillas
  const foldersRes = await drive.files.list({
    q: `'${templatesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id,name)',
  })
  const folders = foldersRes.data.files ?? []
  if (folders.length === 0) return []

  // Get Google Docs from each subfolder
  const results = await Promise.all(
    folders.map(async (folder) => {
      const res = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
        fields: 'files(id,name,properties,webViewLink,createdTime,modifiedTime)',
        orderBy: 'createdTime desc',
      })
      return (res.data.files ?? []).map((f) => ({ ...f, sourceType: 'doc' as const }))
    }),
  )
  return results.flat()
}

export async function getMdxTemplateContent(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.get({
    fileId,
    fields: 'id,name,createdTime,modifiedTime',
  })
  
  const contentRes = await drive.files.get({
    fileId,
    alt: 'media',
  })

  return {
    id: res.data.id,
    name: res.data.name,
    source: contentRes.data as string,
    createdTime: res.data.createdTime,
    modifiedTime: res.data.modifiedTime,
  }
}

export async function createMdxTemplate(
  accessToken: string,
  name: string,
  source: string,
): Promise<{ fileId: string }> {
  const drive = getDriveClient(accessToken)
  const templatesFolderId = await getTemplatesFolderId(accessToken)

  const fileName = name.endsWith('.mdx') ? name : `${name}.mdx`
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [templatesFolderId],
    },
    media: {
      mimeType: 'text/markdown',
      body: source,
    },
    fields: 'id',
  })

  return { fileId: res.data.id! }
}

export async function updateMdxTemplate(
  accessToken: string,
  fileId: string,
  source: string,
): Promise<{ fileId: string }> {
  const drive = getDriveClient(accessToken)

  const res = await drive.files.update({
    fileId,
    media: {
      mimeType: 'text/markdown',
      body: source,
    },
    fields: 'id',
  })

  return { fileId: res.data.id! }
}

export async function deleteMdxTemplate(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken)
  await drive.files.update({
    fileId,
    requestBody: { trashed: true },
  })
  return { success: true }
}
