import type { Database } from "./database.types";

export type Note = Database['public']['Tables']['notes']['Row']
export type ContentChunk = Database['public']['Tables']['note_contents']['Row']
export type DetailsObject = Database['public']['Tables']['details']['Row']
export type BackreferenceObject = Database['public']['Tables']['backreferences']['Row']
export type SidebarImageObject = Database['public']['Tables']['sidebar_images']['Row']