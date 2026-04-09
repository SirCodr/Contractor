import { getDocsClient, getDriveClient } from '@/lib/google-drive'

/**
 * Creates a new Google Doc with the given plain-text content inside a Drive folder.
 * The content is inserted via the Docs API batchUpdate after file creation.
 */
export async function createDocFromContent(
  accessToken: string,
  title: string,
  content: string,
  parentFolderId: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient(accessToken)

  // 1. Create an empty Google Doc in the target folder
  const createRes = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentFolderId],
    },
    fields: 'id,webViewLink',
  })

  const fileId = createRes.data.id!
  const webViewLink = createRes.data.webViewLink!

  // 2. Insert the full text via Docs API
  const docs = getDocsClient(accessToken)
  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content,
          },
        },
      ],
    },
  })

  return { fileId, webViewLink }
}

/**
 * Creates a new Google Doc from HTML content, uploading it as a file
 * and letting Drive convert it automatically (preserves formatting).
 */
export async function createDocFromHtml(
  accessToken: string,
  title: string,
  htmlContent: string,
  parentFolderId: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient(accessToken)

  // When uploading text/html with mimeType = vnd.google-apps.document,
  // Google Drive automatically converts the HTML tags into Docs formatting!
  const createRes = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentFolderId],
    },
    media: {
      mimeType: 'text/html',
      body: htmlContent,
    },
    fields: 'id,webViewLink',
  })

  return { 
    fileId: createRes.data.id!, 
    webViewLink: createRes.data.webViewLink! 
  }
}


/**
 * Reads a Google Doc's full plain text by retrieving its body content
 * and concatenating all paragraph text runs.
 */
export async function getDocContent(accessToken: string, fileId: string): Promise<string> {
  const docs = getDocsClient(accessToken)
  const res = await docs.documents.get({ documentId: fileId })

  const body = res.data.body?.content ?? []
  const lines: string[] = []

  for (const element of body) {
    if (!element.paragraph) continue
    const text = (element.paragraph.elements ?? [])
      .map((el) => el.textRun?.content ?? '')
      .join('')
    lines.push(text)
  }

  return lines.join('')
}

/**
 * Replaces all occurrences of a target string in a Google Doc
 * using the Docs API replaceAllText request.
 * Useful for template-based doc generation where variables are pre-inserted as placeholders.
 */
export async function replaceInDoc(
  accessToken: string,
  fileId: string,
  substitutions: Record<string, string>,
): Promise<void> {
  const docs = getDocsClient(accessToken)

  const requests = Object.entries(substitutions).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: false,
      },
      replaceText: value,
    },
  }))

  if (requests.length === 0) return

  await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: { requests },
  })
}

/**
 * Returns the human-readable URL to open a Google Doc in the browser.
 */
export function getDocViewUrl(fileId: string): string {
  return `https://docs.google.com/document/d/${fileId}/edit`
}
