export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      incidents: {
        Row: {
          id: string
          created_at: string
          expires_at: string
          lat: number
          lng: number
          geohash: string
          category: 'suspicious_activity' | 'disturbance' | 'property_damage' | 'noise' | 'road_incident' | 'other' | 'fly_tipping' | 'vandalism' | 'travellers_in_area' | 'fire'
          description: string
          created_by_user_id: string
          like_count: number
          is_active: boolean
          archived_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          expires_at?: string
          lat: number
          lng: number
          geohash: string
          category: 'suspicious_activity' | 'disturbance' | 'property_damage' | 'noise' | 'road_incident' | 'other' | 'fly_tipping' | 'vandalism' | 'travellers_in_area' | 'fire'
          description: string
          created_by_user_id: string
          like_count?: number
          is_active?: boolean
          archived_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          expires_at?: string
          lat?: number
          lng?: number
          geohash?: string
          category?: 'suspicious_activity' | 'disturbance' | 'property_damage' | 'noise' | 'road_incident' | 'other' | 'fly_tipping' | 'vandalism' | 'travellers_in_area' | 'fire'
          description?: string
          created_by_user_id?: string
          like_count?: number
          is_active?: boolean
          archived_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      incident_likes: {
        Row: {
          id: string
          incident_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_likes_incident_id_fkey"
            columns: ["incident_id"]
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          }
        ]
      }
      crime_alerts: {
        Row: {
          alert_date: string
          created_at: string | null
          created_by: string | null
          crime_type: string | null
          description: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          postcode: string | null
          severity_level: string | null
          source: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_date: string
          created_at?: string | null
          created_by?: string | null
          crime_type?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          postcode?: string | null
          severity_level?: string | null
          source?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_date?: string
          created_at?: string | null
          created_by?: string | null
          crime_type?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          postcode?: string | null
          severity_level?: string | null
          source?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          sent_at: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          created_at: string | null
          formatted_address: string | null
          id: string
          is_current_location: boolean | null
          is_favorite: boolean | null
          latitude: number | null
          location_name: string
          location_type: string | null
          longitude: number | null
          postcode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          is_current_location?: boolean | null
          is_favorite?: boolean | null
          latitude?: number | null
          location_name: string
          location_type?: string | null
          longitude?: number | null
          postcode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          is_current_location?: boolean | null
          is_favorite?: boolean | null
          latitude?: number | null
          location_name?: string
          location_type?: string | null
          longitude?: number | null
          postcode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          preference_key: string
          preference_type: string | null
          preference_value: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          preference_key: string
          preference_type?: string | null
          preference_value: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          preference_key?: string
          preference_type?: string | null
          preference_value?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          device_token: string | null
          email: string
          fcm_token: string | null
          first_name: string | null
          id: string
          is_remember_login: boolean | null
          is_survey_completed: boolean | null
          last_name: string | null
          notification_permission: boolean | null
          phone_number: string | null
          profile_image_url: string | null
          selected_language: string | null
          selected_video_language: string | null
          social_login_id: string | null
          social_login_provider: string | null
          updated_at: string | null
          user_role: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          device_token?: string | null
          email: string
          fcm_token?: string | null
          first_name?: string | null
          id: string
          is_remember_login?: boolean | null
          is_survey_completed?: boolean | null
          last_name?: string | null
          notification_permission?: boolean | null
          phone_number?: string | null
          profile_image_url?: string | null
          selected_language?: string | null
          selected_video_language?: string | null
          social_login_id?: string | null
          social_login_provider?: string | null
          updated_at?: string | null
          user_role?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          device_token?: string | null
          email?: string
          fcm_token?: string | null
          first_name?: string | null
          id?: string
          is_remember_login?: boolean | null
          is_survey_completed?: boolean | null
          last_name?: string | null
          notification_permission?: boolean | null
          phone_number?: string | null
          profile_image_url?: string | null
          selected_language?: string | null
          selected_video_language?: string | null
          social_login_id?: string | null
          social_login_provider?: string | null
          updated_at?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          postcode: string | null
          severity_level: string | null
          source: string | null
          title: string
          updated_at: string | null
          valid_from: string
          valid_until: string | null
          weather_condition: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          postcode?: string | null
          severity_level?: string | null
          source?: string | null
          title: string
          updated_at?: string | null
          valid_from: string
          valid_until?: string | null
          weather_condition: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          postcode?: string | null
          severity_level?: string | null
          source?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
          weather_condition?: string
        }
        Relationships: []
      }
      threat_levels: {
        Row: {
          id: string
          level_key: string
          display_name: string
          description: string | null
          guidance_url: string | null
          additional_guidance: string | null
          severity_index: number
          max_scale_value: number
          is_active: boolean
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          level_key: string
          display_name: string
          description?: string | null
          guidance_url?: string | null
          additional_guidance?: string | null
          severity_index: number
          max_scale_value: number
          is_active?: boolean
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          level_key?: string
          display_name?: string
          description?: string | null
          guidance_url?: string | null
          additional_guidance?: string | null
          severity_index?: number
          max_scale_value?: number
          is_active?: boolean
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      current_threat_status: {
        Row: {
          id: string
          scope: string
          threat_level_id: string
          threat_level_key: string
          severity_index: number
          max_scale_value: number
          source: string | null
          notes: string | null
          last_updated_at: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          scope?: string
          threat_level_id: string
          threat_level_key: string
          severity_index: number
          max_scale_value: number
          source?: string | null
          notes?: string | null
          last_updated_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          scope?: string
          threat_level_id?: string
          threat_level_key?: string
          severity_index?: number
          max_scale_value?: number
          source?: string | null
          notes?: string | null
          last_updated_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "current_threat_status_threat_level_id_fkey"
            columns: ["threat_level_id"]
            referencedRelation: "threat_levels"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enforce_device_limit: {
        Args: { max_sessions?: number; target_user_id: string }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Convenience type aliases for common use
export type CrimeAlert = Tables<'crime_alerts'>
export type CrimeAlertInsert = TablesInsert<'crime_alerts'>
export type CrimeAlertUpdate = TablesUpdate<'crime_alerts'>

export type WeatherAlert = Tables<'weather_alerts'>
export type WeatherAlertInsert = TablesInsert<'weather_alerts'>
export type WeatherAlertUpdate = TablesUpdate<'weather_alerts'>

export type UserLocation = Tables<'user_locations'>
export type UserLocationInsert = TablesInsert<'user_locations'>
export type UserLocationUpdate = TablesUpdate<'user_locations'>

export type Notification = Tables<'notifications'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationUpdate = TablesUpdate<'notifications'>

export type UserPreference = Tables<'user_preferences'>
export type UserPreferenceInsert = TablesInsert<'user_preferences'>
export type UserPreferenceUpdate = TablesUpdate<'user_preferences'>

export type UserProfile = Tables<'user_profiles'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>

export type Incident = Tables<'incidents'>
export type IncidentInsert = TablesInsert<'incidents'>
export type IncidentUpdate = TablesUpdate<'incidents'>

export type IncidentLike = Tables<'incident_likes'>
export type IncidentLikeInsert = TablesInsert<'incident_likes'>
export type IncidentLikeUpdate = TablesUpdate<'incident_likes'>

// Incident category type for convenience
export type IncidentCategory = Incident['category']

// Threat level types
export type ThreatLevel = Tables<'threat_levels'>
export type ThreatLevelInsert = TablesInsert<'threat_levels'>
export type ThreatLevelUpdate = TablesUpdate<'threat_levels'>

export type CurrentThreatStatus = Tables<'current_threat_status'>
export type CurrentThreatStatusInsert = TablesInsert<'current_threat_status'>
export type CurrentThreatStatusUpdate = TablesUpdate<'current_threat_status'>







