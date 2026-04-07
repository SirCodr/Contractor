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
    console.error(`[API GET /api/templates/[id]]`, error)
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
    
    await drive.files.update({
      fileId: id,
      requestBody: { trashed: true },
    })

    return NextResponse.json({ success: true, message: 'Template moved to trash' })
  } catch (error) {
    console.error(`[API DELETE /api/templates/[id]]`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
