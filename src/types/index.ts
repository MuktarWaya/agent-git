export type UserRole = 'super_admin' | 'unit_admin' | 'public'

export interface UserProfile {
    id: string
    role: UserRole
    unit_id: string | null
    created_at: string
}
