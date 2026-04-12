import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getDriveClient, getFileMetadata } from '@/lib/google-drive'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const metadata = await getFileMetadata(session.accessToken, id)
    return NextResponse.json(metadata)
  } catch (error) {
    console.error(`[API GET /api/contracts/[id]]`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const drive = getDriveClient(session.accessToken)
    
    // Get metadata to find the parent folder and config file
    const metadata = await drive.files.get({
      fileId: id,
      fields: 'parents, properties'
    })
    const parents = metadata.data.parents
    const properties = metadata.data.properties

    // Trash the contract doc
    await drive.files.update({
      fileId: id,
      requestBody: { trashed: true },
    })

    // Trash the config file if it exists
    if (properties?.config_file_id) {
      await drive.files.update({
        fileId: properties.config_file_id,
        requestBody: { trashed: true },
      }).catch(e => console.error('Failed to trash config File:', e))
    }

    // Check parent folder and trash it if it's empty
    if (parents && parents.length > 0) {
      const parentId = parents[0]
      const filesInParent = await drive.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'files(id)'
      })
      if (!filesInParent.data.files || filesInParent.data.files.length === 0) {
        await drive.files.update({
          fileId: parentId,
          requestBody: { trashed: true }
        }).catch(e => console.error('Failed to trash empty folder:', e))
      }
    }

    return NextResponse.json({ success: true, message: 'Contract moved to trash' })
  } catch (error) {
    console.error(`[API DELETE /api/contracts/[id]]`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
