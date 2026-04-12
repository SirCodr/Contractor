'use server'

import { auth } from '@/lib/auth'
import { createDocFromHtml } from '@/lib/google-docs'
import {
  initRootStructure,
  createPropertyFolder,
  saveFileMetadata,
  getFileMetadata,
  listContractsInFolder,
  getPropertiesFolderId,
  getTemplatesFolderId,
  getDriveClient,
  saveContractConfig,
} from '@/lib/google-drive'
import type { ContractFormData } from '@/types/contract'
import { generateContractMarkdown } from '@/lib/markdown-generator'

/**
 * Converts the contract Markdown to an HTML string with inline styles.
 * Google Drive only respects inline `style` attributes when converting
 * an uploaded HTML file into a Google Doc — CSS classes and <style> tags
 * are stripped. Using inline styles guarantees the font size (14pt),
 * line spacing (1.5) and paragraph justification are preserved in Docs.
 */
function markdownToStyledHtml(markdown: string): string {
  const BODY_STYLE = 'font-family: Arial, sans-serif; font-size: 14pt; line-height: 1.15; color: #000;'
  const PARA_STYLE = 'font-size: 14pt; line-height: 1.15; text-align: justify; margin-top: 0; margin-bottom: 12pt;'
  const TITLE_STYLE = 'font-size: 14pt; font-weight: bold; text-align: center; line-height: 1.15; margin: 0 0 24pt 0;'

  const lines = markdown.split('\n')
  const htmlLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // H1: # Title
    if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      htmlLines.push(`<h1 style="${TITLE_STYLE}">${text}</h1>`)
      continue
    }

    // Raw HTML passthrough (for the signature div)
    if (trimmed.startsWith('<') && !trimmed.startsWith('<b>')) {
      htmlLines.push(line)
      continue
    }

    // Regular paragraph — convert **bold** to <b>
    const text = trimmed.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    htmlLines.push(`<p style="${PARA_STYLE}">${text}</p>`)
  }

  return `<!DOCTYPE html><html><body style="${BODY_STYLE}">${htmlLines.join('')}</body></html>`
}

/** Called once after first login to initialize the root Drive folder structure. */
export async function initDriveAction(): Promise<{ success: boolean; rootFolderId?: string }> {
  const session = await auth()
  if (!session?.accessToken) return { success: false }

  try {
    const rootFolderId = await initRootStructure(session.accessToken)
    return { success: true, rootFolderId }
  } catch (error) {
    console.error('[initDriveAction] Failed:', error)
    return { success: false }
  }
}

/** Lists all contract docs inside a given property folder. */
export async function listContractsAction(propertyFolderId: string) {
  const session = await auth()
  if (!session?.accessToken) return []

  try {
    return await listContractsInFolder(session.accessToken, propertyFolderId)
  } catch (error) {
    console.error('[listContractsAction] Failed:', error)
    return []
  }
}

/** Gets the metadata of a single contract file from Drive. */
export async function getContractAction(fileId: string) {
  const session = await auth()
  if (!session?.accessToken) return null

  try {
    return await getFileMetadata(session.accessToken, fileId)
  } catch (error) {
    console.error('[getContractAction] Failed:', error)
    return null
  }
}

/**
 * Creates a new contract Google Doc from form data.
 * Steps:
 *   1. Ensure property folder exists in Drive
 *   2. Build the contract text from clauses + variables
 *   3. Create the Google Doc
 *   4. Save metadata as Drive file.properties
 */
export async function createContractAction(
  data: ContractFormData,
): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
  const session = await auth()
  if (!session?.accessToken) return { success: false, error: 'No autenticado' }

  try {
    // 1. Get or create property folder (differentiates if it's a template)
    const isTemplate = !data.tenant.name || data.tenant.name.trim() === '';
    const propertyFolderId = await createPropertyFolder(
      session.accessToken,
      data.property.address,
      isTemplate
    )

    // 2. Construir el contrato completo usando nuestro Markdown Generator
    const markdown = generateContractMarkdown(data as any)

    // 3. Convertir Markdown a HTML con estilos inline para Google Docs
    // Google Drive respeta los atributos style inline al convertir a Doc nativo
    const fallbackTitle = isTemplate 
      ? `Plantilla - ${data.property.address}`
      : `${data.startDate.slice(0, 4)} - ${data.tenant.name}`
      
    const docTitle = data.contractName?.trim() || fallbackTitle
    const htmlContent = markdownToStyledHtml(markdown)

    // 4. Crear el Google Doc con formato respetado
    const { fileId, webViewLink } = await createDocFromHtml(
      session.accessToken,
      docTitle,
      htmlContent,
      propertyFolderId,
    )

    // 4.5. Guardar la configuración JSON del Wizard (Estado)
    const configId = await saveContractConfig(session.accessToken, propertyFolderId, docTitle, data)

    // 5. Persist metadata as Drive file.properties
    const metadata: Record<string, string> = {
      landlord_name: data.landlord.name,
      landlord_cedula: data.landlord.cedula,
      tenant_name: data.tenant.name,
      tenant_cedula: data.tenant.cedula,
      property_address: data.property.address,
      property_city: data.property.city,
      monthly_rent: String(data.monthlyRent),
      start_date: data.startDate,
      end_date: data.endDate,
      status: 'active',
      config_file_id: configId, // <-- Vincular el JSON con el Google Doc
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await saveFileMetadata(session.accessToken, fileId, metadata)

    return { success: true, fileId, webViewLink }
  } catch (error) {
    console.error('[createContractAction] Failed:', error)
    return { success: false, error: 'Error al crear el contrato en Drive' }
  }
}

/**
 * Updates an existing contract Google Doc and its config JSON from form data.
 */
export async function updateContractAction(
  data: ContractFormData,
  fileId: string,
  configFileId: string,
): Promise<{ success: boolean; webViewLink?: string; error?: string }> {
  const session = await auth()
  if (!session?.accessToken) return { success: false, error: 'No autenticado' }

  try {
    const isTemplate = !data.tenant.name || data.tenant.name.trim() === '';
    const fallbackTitle = isTemplate 
      ? `Plantilla - ${data.property.address}`
      : `${data.startDate.slice(0, 4)} - ${data.tenant.name}`
      
    const docTitle = data.contractName?.trim() || fallbackTitle
    const propertyFolderId = await createPropertyFolder(session.accessToken, data.property.address, isTemplate)

    // 1. Convert to Markdown then HTML with inline styles
    const markdown = generateContractMarkdown(data as any)
    const htmlContent = markdownToStyledHtml(markdown)

    // 2. Update Google Doc (replace contents)
    const drive = getDriveClient(session.accessToken)
    await drive.files.update({
      fileId,
      requestBody: { name: docTitle },
      media: {
        mimeType: 'text/html',
        body: htmlContent,
      },
    })
    
    // 3. Update configuration JSON
    await saveContractConfig(session.accessToken, propertyFolderId, docTitle, data, configFileId)

    // 4. Update metadata
    const metadata: Record<string, string> = {
      landlord_name: data.landlord.name,
      landlord_cedula: data.landlord.cedula,
      tenant_name: data.tenant.name,
      tenant_cedula: data.tenant.cedula,
      property_address: data.property.address,
      property_city: data.property.city,
      monthly_rent: String(data.monthlyRent),
      start_date: data.startDate,
      end_date: data.endDate,
      status: 'active',
      config_file_id: configFileId,
      updated_at: new Date().toISOString(),
    }
    await saveFileMetadata(session.accessToken, fileId, metadata)

    return { success: true }
  } catch (error) {
    console.error('[updateContractAction] Failed:', error)
    return { success: false, error: 'Error al actualizar el contrato en Drive' }
  }
}

/** Returns all contracts across all property folders (for the dashboard list). */
export async function listAllContractsAction() {
  const session = await auth()
  if (!session?.accessToken) return []

  try {
    const propertiesFolderId = await getPropertiesFolderId(session.accessToken)
    const templatesFolderId = await getTemplatesFolderId(session.accessToken)
    const drive = getDriveClient(session.accessToken)

    // List all property sub-folders and template sub-folders in parallel
    const [foldersRes, templateFoldersRes] = await Promise.all([
      drive.files.list({
        q: `'${propertiesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id,name)',
      }),
      drive.files.list({
        q: `'${templatesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id,name)',
      })
    ])

    const folders = [
      ...(foldersRes.data.files ?? []),
      ...(templateFoldersRes.data.files ?? []).map(f => ({ ...f, name: `${f.name} (Plantilla)` }))
    ]

    // Collect contracts from each property folder
    const allContracts = await Promise.all(
      folders.map(async (folder) => {
        const contracts = await listContractsInFolder(session.accessToken!, folder.id!)
        return contracts.map((c) => ({ ...c, propertyFolderName: folder.name }))
      }),
    )

    return allContracts.flat()
  } catch (error) {
    console.error('[listAllContractsAction] Failed:', error)
    return []
  }
}
