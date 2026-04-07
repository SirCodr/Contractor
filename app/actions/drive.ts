'use server'

import { auth } from '@/lib/auth'
import {
  initRootStructure,
  createPropertyFolder,
  saveFileMetadata,
  getFileMetadata,
  listContractsInFolder,
  getPropertiesFolderId,
  getDriveClient,
} from '@/lib/google-drive'
import { createDocFromContent } from '@/lib/google-docs'
import { replaceVariables, numberToSpanishText, formatCurrency } from '@/lib/template-engine'
import { BASE_CLAUSES } from '@/constants/clauses'
import type { ContractFormData } from '@/types/contract'

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
    // 1. Get or create property folder
    const propertyFolderId = await createPropertyFolder(
      session.accessToken,
      data.property.address,
    )

    // 2. Build variables map
    const variables: Record<string, string> = {
      landlord_name: data.landlord.name,
      landlord_cedula: data.landlord.cedula,
      landlord_city: data.landlord.city,
      landlord_phone: data.landlord.phone ?? '',
      tenant_name: data.tenant.name,
      tenant_cedula: data.tenant.cedula,
      tenant_city: data.tenant.city,
      tenant_phone: data.tenant.phone ?? '',
      municipality: data.property.city,
      property_type: data.property.type,
      property_floor: data.property.floor ?? '',
      property_address: data.property.address,
      property_neighborhood: data.property.neighborhood,
      property_description: data.property.description,
      rent_amount_text: numberToSpanishText(data.monthlyRent),
      rent_amount: formatCurrency(data.monthlyRent),
      bank_name: data.bankName,
      bank_account: data.bankAccount,
      start_date: data.startDate,
      end_date: data.endDate,
      duration_months: data.durationMonths,
      max_occupants: data.maxOccupants ?? 'dos',
      deposit_amount_text: numberToSpanishText(data.depositAmount ?? 0),
      deposit_amount: formatCurrency(data.depositAmount ?? 0),
      signature_city: data.signatureCity,
      signature_day: data.signatureDay,
      signature_month: data.signatureMonth,
      signature_year: data.signatureYear,
    }

    // 3. Build full contract text from enabled clauses
    const enabledClauses = (data.clauses ?? BASE_CLAUSES).filter((c) => c.defaultEnabled)
    const lines: string[] = [
      `CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA\n`,
      `Entre los suscritos, ARRENDADOR: ${variables.landlord_name}, identificado con C.C. No. ${variables.landlord_cedula} de ${variables.landlord_city}; y ARRENDATARIO: ${variables.tenant_name}, identificado con C.C. No. ${variables.tenant_cedula} de ${variables.tenant_city}; se celebra el presente contrato de arrendamiento que se regirá por las siguientes cláusulas:\n`,
    ]

    for (const clause of enabledClauses) {
      lines.push(`\n${clause.title}\n${replaceVariables(clause.content, variables)}\n`)
    }

    lines.push(
      `\nFirmado en ${variables.signature_city}, a los ${variables.signature_day} días del mes de ${variables.signature_month} de ${variables.signature_year}.\n`,
      `\n\n_______________________________\nARRENDADOR\n${variables.landlord_name}\nC.C. ${variables.landlord_cedula}`,
      `\n\n_______________________________\nARRENDATARIO\n${variables.tenant_name}\nC.C. ${variables.tenant_cedula}`,
    )

    const docTitle = `${data.startDate.slice(0, 4)} - ${data.tenant.name}`
    const content = lines.join('')

    // 4. Create the Google Doc
    const { fileId, webViewLink } = await createDocFromContent(
      session.accessToken,
      docTitle,
      content,
      propertyFolderId,
    )

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

/** Returns all contracts across all property folders (for the dashboard list). */
export async function listAllContractsAction() {
  const session = await auth()
  if (!session?.accessToken) return []

  try {
    const propertiesFolderId = await getPropertiesFolderId(session.accessToken)
    const drive = getDriveClient(session.accessToken)

    // List all property sub-folders
    const foldersRes = await drive.files.list({
      q: `'${propertiesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id,name)',
    })

    const folders = foldersRes.data.files ?? []

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
