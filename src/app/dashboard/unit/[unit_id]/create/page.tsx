// Server Component — อ่าน params ฝั่ง Server แล้วส่ง unitId ลงมาให้ Client
import { CreatePostForm } from './CreatePostForm'

type Props = {
    params: Promise<{ unit_id: string }>
}

export default async function CreatePostPage({ params }: Props) {
    const { unit_id } = await params

    return <CreatePostForm unitId={unit_id} />
}
