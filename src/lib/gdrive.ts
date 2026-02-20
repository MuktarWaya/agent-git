/**
 * แปลง Google Drive share link เป็น direct image URL
 * รองรับ format:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function convertGDriveUrl(url: string): string {
    if (!url) return url

    // ถ้าไม่ใช่ลิงก์ Google Drive → ส่งกลับเหมือนเดิม (อาจเป็น URL รูปภาพทั่วไป)
    if (!url.includes('drive.google.com')) return url

    let fileId: string | null = null

    // Format: /file/d/FILE_ID/
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) {
        fileId = fileMatch[1]
    }

    // Format: ?id=FILE_ID or &id=FILE_ID
    if (!fileId) {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
        if (idMatch) {
            fileId = idMatch[1]
        }
    }

    if (fileId) {
        // ใช้ lh3.googleusercontent.com ซึ่งเป็น direct image URL ที่เสถียรที่สุด
        return `https://lh3.googleusercontent.com/d/${fileId}`
    }

    // ถ้าแปลงไม่ได้ → ส่ง URL เดิมกลับไป
    return url
}
