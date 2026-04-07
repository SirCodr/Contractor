import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDriveClient, getPropertiesFolderId, createPropertyFolder } from '@/lib/google-drive'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const drive = getDriveClient(session.accessToken)
    const propertiesFolderId = await getPropertiesFolderId(session.accessToken)

    const res = await drive.files.list({
      q: `'${propertiesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id,name,createdTime)',
      orderBy: 'createdTime desc',
    })

    return NextResponse.json(res.data.files ?? [])
  } catch (error) {
    console.error('[API GET /api/properties]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address } = await req.json()
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const folderId = await createPropertyFolder(session.accessToken, address)
    return NextResponse.json({ success: true, folderId, name: address }, { status: 201 })
  } catch (error) {
    console.error('[API POST /api/properties]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
