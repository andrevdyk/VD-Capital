export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string | null
          is_group: boolean
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          is_group?: boolean
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          is_group?: boolean
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string
          profile_id: string
          joined_at: string
        }
        Insert: {
          chat_id: string
          profile_id: string
          joined_at?: string
        }
        Update: {
          chat_id?: string
          profile_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          profile_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          profile_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          profile_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_chat: {
        Args: {
          chat_name: string
          is_group: boolean
          participant_ids: string[]
        }
        Returns: string
      }
      add_chat_participant: {
        Args: {
          chat_id: string
          new_participant_id: string
        }
        Returns: undefined
      }
      remove_chat_participant: {
        Args: {
          chat_id: string
          participant_id: string
        }
        Returns: undefined
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

