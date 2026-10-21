
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "crews": {
                  Row: {
                    "created_at": string,"id": string,"invite_code": string,"name": string,"settings": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"invite_code": string,"name": string,"settings"?: NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"invite_code"?: string,"name"?: string,"settings"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"members": {
                  Row: {
                    "avatar": string,"color": string,"created_at": string,"crew_id": string,"display_name": string,"id": string,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar"?: string,"color"?: string,"created_at"?: string,"crew_id": string,"display_name": string,"id"?: string,"role"?: string,"user_id": string
                  }
                  Update: {
                    "avatar"?: string,"color"?: string,"created_at"?: string,"crew_id"?: string,"display_name"?: string,"id"?: string,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "members_crew_id_fkey"
      columns: ["crew_id"]
isOneToOne: false
      referencedRelation: "crews"
      referencedColumns: ["id"]
    }
                  ]
                },"ratings": {
                  Row: {
                    "comment": string | null,"created_at": string,"extra_scores": Json | null,"id": string,"member_id": string,"taste_score": number,"updated_at": string,"visit_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "comment"?: string | null,"created_at"?: string,"extra_scores"?: Json | null,"id"?: string,"member_id"?: string,"taste_score": number,"updated_at"?: string,"visit_id": string
                  }
                  Update: {
                    "comment"?: string | null,"created_at"?: string,"extra_scores"?: Json | null,"id"?: string,"member_id"?: string,"taste_score"?: number,"updated_at"?: string,"visit_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ratings_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ratings_visit_id_fkey"
      columns: ["visit_id"]
isOneToOne: false
      referencedRelation: "visits"
      referencedColumns: ["id"]
    }
                  ]
                },"spots": {
                  Row: {
                    "address": string,"created_at": string,"created_by": string | null,"crew_id": string,"id": string,"lat": number,"lng": number,"name": string,"note": string | null,"photo_url": string | null,"price": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string,"created_at"?: string,"created_by"?: string | null,"crew_id"?: string,"id"?: string,"lat": number,"lng": number,"name": string,"note"?: string | null,"photo_url"?: string | null,"price"?: number | null
                  }
                  Update: {
                    "address"?: string,"created_at"?: string,"created_by"?: string | null,"crew_id"?: string,"id"?: string,"lat"?: number,"lng"?: number,"name"?: string,"note"?: string | null,"photo_url"?: string | null,"price"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "spots_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "spots_crew_id_fkey"
      columns: ["crew_id"]
isOneToOne: false
      referencedRelation: "crews"
      referencedColumns: ["id"]
    }
                  ]
                },"visit_participants": {
                  Row: {
                    "member_id": string,"visit_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "member_id": string,"visit_id": string
                  }
                  Update: {
                    "member_id"?: string,"visit_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "visit_participants_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visit_participants_visit_id_fkey"
      columns: ["visit_id"]
isOneToOne: false
      referencedRelation: "visits"
      referencedColumns: ["id"]
    }
                  ]
                },"visits": {
                  Row: {
                    "created_at": string,"created_by": string | null,"crew_id": string,"id": string,"meal_type": string | null,"photo_url": string | null,"spot_id": string,"visited_on": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"crew_id"?: string,"id"?: string,"meal_type"?: string | null,"photo_url"?: string | null,"spot_id": string,"visited_on"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"crew_id"?: string,"id"?: string,"meal_type"?: string | null,"photo_url"?: string | null,"spot_id"?: string,"visited_on"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "visits_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visits_crew_id_fkey"
      columns: ["crew_id"]
isOneToOne: false
      referencedRelation: "crews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visits_spot_id_fkey"
      columns: ["spot_id"]
isOneToOne: false
      referencedRelation: "spots"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_crew":
{ Args: { "avatar": string,"color": string,"crew_name": string,"display_name": string }; Returns: {
              "avatar": string,
"color": string,
"created_at": string,
"crew_id": string,
"display_name": string,
"id": string,
"role": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "members"
        isOneToOne: true
        isSetofReturn: false
      } },
"generate_invite_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"is_captain":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"join_crew":
{ Args: { "avatar": string,"code": string,"color": string,"display_name": string }; Returns: {
              "avatar": string,
"color": string,
"created_at": string,
"crew_id": string,
"display_name": string,
"id": string,
"role": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "members"
        isOneToOne: true
        isSetofReturn: false
      } },
"my_crew_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"my_member_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"regenerate_invite_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"remove_member":
{ Args: { "target_member": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
