'use server'

import { marked } from 'marked'

import { auth } from '@/lib/auth'
import { createDocFromContent, createDocFromHtml } from '@/lib/google-docs'
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
import { replaceVariables, numberToSpanishText, formatCurrency } from '@/lib/template-engine'
import { BASE_CLAUSES } from '@/constants/clauses'
import type { ContractFormData } from '@/types/contract'
import { generateContractMarkdown } from '@/lib/markdown-generator'

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
    // (Pasamos la data que cumple con la misma estructura requerida)
    const markdown = generateContractMarkdown(data as any)

    // 3. Convertir Markdown a HTML
    // Docs formatea el texto nativamente al recibir HTML estructurado
    const fallbackTitle = isTemplate 
      ? `Plantilla - ${data.property.address}`
      : `${data.startDate.slice(0, 4)} - ${data.tenant.name}`
      
    const docTitle = data.contractName?.trim() || fallbackTitle
    const htmlContent = await marked.parse(markdown)

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

    // 1. Convert to Markdown then HTML
    const markdown = generateContractMarkdown(data as any)
    const htmlContent = await marked.parse(markdown)

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
