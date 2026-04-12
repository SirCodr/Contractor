import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getContractConfig, getFileMetadata } from '@/lib/google-drive'

import { EditClientLoader } from './EditClientLoader'

export default async function EditContractPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  try {
    const metadata = await getFileMetadata(session.accessToken, params.id)
    const configFileId = metadata.properties?.config_file_id

    if (!configFileId) {
      return (
        <div className="p-8 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-destructive">Imposible Editar</h1>
          <p className="text-muted-foreground mt-2">Este contrato es de una versión anterior a esta actualización y no tiene archivo de configuración pre-guardado. No puede editarse desde el Wizard.</p>
        </div>
      )
    }

    const configData = await getContractConfig(session.accessToken, configFileId)

    return <EditClientLoader data={configData} fileId={params.id} configId={configFileId} />
  } catch (error) {
    console.error(error)
    return <div className="p-8">Ocurrió un error al cargar el contrato. Verifica permisos.</div>
  }
}
