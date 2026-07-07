export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          credits_used: number
          id: string
          role: Database["public"]["Enums"]["ai_message_role"]
          school_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          credits_used?: number
          id?: string
          role: Database["public"]["Enums"]["ai_message_role"]
          school_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          credits_used?: number
          id?: string
          role?: Database["public"]["Enums"]["ai_message_role"]
          school_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          school_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          school_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_credit_usage: {
        Row: {
          credits_limit: number
          credits_used: number
          id: string
          school_id: string
          updated_at: string
          usage_month: string
        }
        Insert: {
          credits_limit?: number
          credits_used?: number
          id?: string
          school_id: string
          updated_at?: string
          usage_month: string
        }
        Update: {
          credits_limit?: number
          credits_used?: number
          id?: string
          school_id?: string
          updated_at?: string
          usage_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_credit_usage_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_knowledge_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          school_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          school_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          school_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_knowledge_articles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          attendance_date: string
          check_in_at: string | null
          check_out_at: string | null
          class_id: string | null
          created_at: string
          id: string
          is_late: boolean
          late_minutes: number
          notes: string | null
          recorded_by: string | null
          school_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          attendance_date: string
          check_in_at?: string | null
          check_out_at?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          is_late?: boolean
          late_minutes?: number
          notes?: string | null
          recorded_by?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in_at?: string | null
          check_out_at?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          is_late?: boolean
          late_minutes?: number
          notes?: string | null
          recorded_by?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          campus_id: string | null
          category: Database["public"]["Enums"]["calendar_event_category"]
          class_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          ends_at: string
          id: string
          notify_on_create: boolean
          remind_days_before: number | null
          school_id: string
          scope_type: Database["public"]["Enums"]["calendar_event_scope"]
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          campus_id?: string | null
          category?: Database["public"]["Enums"]["calendar_event_category"]
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ends_at: string
          id?: string
          notify_on_create?: boolean
          remind_days_before?: number | null
          school_id: string
          scope_type?: Database["public"]["Enums"]["calendar_event_scope"]
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          campus_id?: string | null
          category?: Database["public"]["Enums"]["calendar_event_category"]
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          notify_on_create?: boolean
          remind_days_before?: number | null
          school_id?: string
          scope_type?: Database["public"]["Enums"]["calendar_event_scope"]
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      campuses: {
        Row: {
          address: string | null
          campus_type: Database["public"]["Enums"]["campus_type"]
          created_at: string
          deleted_at: string | null
          id: string
          is_main: boolean
          name: string
          parent_campus_id: string | null
          phone: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          campus_type?: Database["public"]["Enums"]["campus_type"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_main?: boolean
          name: string
          parent_campus_id?: string | null
          phone?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          campus_type?: Database["public"]["Enums"]["campus_type"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_main?: boolean
          name?: string
          parent_campus_id?: string | null
          phone?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_parent_campus_id_fkey"
            columns: ["parent_campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campuses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          created_at: string
          enrolled_at: string
          id: string
          school_id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          school_id: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          school_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          label: string
          school_id: string
          start_time: string
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          label?: string
          school_id: string
          start_time: string
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          label?: string
          school_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          campus_id: string | null
          capacity: number
          classroom_id: string | null
          code: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          school_id: string
          school_year_id: string
          semester_id: string | null
          status: Database["public"]["Enums"]["class_status"]
          teacher_user_id: string | null
          updated_at: string
        }
        Insert: {
          campus_id?: string | null
          capacity?: number
          classroom_id?: string | null
          code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          school_id: string
          school_year_id: string
          semester_id?: string | null
          status?: Database["public"]["Enums"]["class_status"]
          teacher_user_id?: string | null
          updated_at?: string
        }
        Update: {
          campus_id?: string | null
          capacity?: number
          classroom_id?: string | null
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          school_id?: string
          school_year_id?: string
          semester_id?: string | null
          status?: Database["public"]["Enums"]["class_status"]
          teacher_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_year_id_fkey"
            columns: ["school_year_id"]
            isOneToOne: false
            referencedRelation: "school_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          campus_id: string | null
          capacity: number
          created_at: string
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          campus_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          campus_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction: Database["public"]["Enums"]["communication_reaction"]
          school_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction: Database["public"]["Enums"]["communication_reaction"]
          school_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction?: Database["public"]["Enums"]["communication_reaction"]
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "communication_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_message_reactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_messages: {
        Row: {
          attachment_file_name: string | null
          attachment_mime_type: string | null
          attachment_storage_path: string | null
          body: string
          created_at: string
          id: string
          reply_to_message_id: string | null
          school_id: string
          sender_type: string
          sender_user_id: string
          thread_id: string
        }
        Insert: {
          attachment_file_name?: string | null
          attachment_mime_type?: string | null
          attachment_storage_path?: string | null
          body: string
          created_at?: string
          id?: string
          reply_to_message_id?: string | null
          school_id: string
          sender_type: string
          sender_user_id: string
          thread_id: string
        }
        Update: {
          attachment_file_name?: string | null
          attachment_mime_type?: string | null
          attachment_storage_path?: string | null
          body?: string
          created_at?: string
          id?: string
          reply_to_message_id?: string | null
          school_id?: string
          sender_type?: string
          sender_user_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "communication_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "communication_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_thread_reads: {
        Row: {
          last_read_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          last_read_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          last_read_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_thread_reads_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "communication_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_threads: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          class_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["communication_channel"]
          class_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          class_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_threads_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_attachments: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          file_name: string
          file_size: number | null
          id: string
          media_type: string
          mime_type: string | null
          report_id: string
          school_id: string
          storage_path: string
          thumbnail_path: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          media_type?: string
          mime_type?: string | null
          report_id: string
          school_id: string
          storage_path: string
          thumbnail_path?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          media_type?: string
          mime_type?: string | null
          report_id?: string
          school_id?: string
          storage_path?: string
          thumbnail_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_attachments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "student_daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_attachments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_timeline_entries: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          entry_type: string
          id: string
          recorded_at: string
          report_id: string
          school_id: string
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          entry_type: string
          id?: string
          recorded_at?: string
          report_id: string
          school_id: string
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          entry_type?: string
          id?: string
          recorded_at?: string
          report_id?: string
          school_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_timeline_entries_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "student_daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_timeline_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          phone: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          school_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          phone: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          phone?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          allergen_tags: string[]
          created_at: string
          description: string | null
          id: string
          ingredient_items: Json
          is_active: boolean
          meal_category_id: string | null
          name: string
          nutrition_info: Json
          school_id: string
          updated_at: string
        }
        Insert: {
          allergen_tags?: string[]
          created_at?: string
          description?: string | null
          id?: string
          ingredient_items?: Json
          is_active?: boolean
          meal_category_id?: string | null
          name: string
          nutrition_info?: Json
          school_id: string
          updated_at?: string
        }
        Update: {
          allergen_tags?: string[]
          created_at?: string
          description?: string | null
          id?: string
          ingredient_items?: Json
          is_active?: boolean
          meal_category_id?: string | null
          name?: string
          nutrition_info?: Json
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_meal_category_id_fkey"
            columns: ["meal_category_id"]
            isOneToOne: false
            referencedRelation: "meal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_inquiries: {
        Row: {
          campus_count: number
          contact_name: string
          created_at: string
          id: string
          notes: string | null
          phone: string
          school_id: string
          status: string
          submitted_by_user_id: string
          updated_at: string
        }
        Insert: {
          campus_count: number
          contact_name: string
          created_at?: string
          id?: string
          notes?: string | null
          phone: string
          school_id: string
          status?: string
          submitted_by_user_id: string
          updated_at?: string
        }
        Update: {
          campus_count?: number
          contact_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string
          school_id?: string
          status?: string
          submitted_by_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_inquiries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      health_growth_records: {
        Row: {
          bmi: number | null
          created_at: string
          height_cm: number | null
          id: string
          notes: string | null
          record_date: string
          recorded_by: string | null
          school_id: string
          student_id: string
          weight_kg: number | null
        }
        Insert: {
          bmi?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          record_date: string
          recorded_by?: string | null
          school_id: string
          student_id: string
          weight_kg?: number | null
        }
        Update: {
          bmi?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          record_date?: string
          recorded_by?: string | null
          school_id?: string
          student_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_growth_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_growth_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_incidents: {
        Row: {
          created_at: string
          description: string
          id: string
          incident_date: string
          incident_time: string | null
          incident_type: Database["public"]["Enums"]["health_incident_type"]
          parent_notified_at: string | null
          reported_by: string | null
          school_id: string
          severity: Database["public"]["Enums"]["health_incident_severity"]
          student_id: string
          treatment: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          incident_date?: string
          incident_time?: string | null
          incident_type?: Database["public"]["Enums"]["health_incident_type"]
          parent_notified_at?: string | null
          reported_by?: string | null
          school_id: string
          severity?: Database["public"]["Enums"]["health_incident_severity"]
          student_id: string
          treatment?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          incident_date?: string
          incident_time?: string | null
          incident_type?: Database["public"]["Enums"]["health_incident_type"]
          parent_notified_at?: string | null
          reported_by?: string | null
          school_id?: string
          severity?: Database["public"]["Enums"]["health_incident_severity"]
          student_id?: string
          treatment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_incidents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_incidents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_medical_checkups: {
        Row: {
          checkup_date: string
          checkup_type: string
          created_at: string
          dental_result: string | null
          doctor_name: string | null
          hearing_result: string | null
          height_cm: number | null
          id: string
          notes: string | null
          school_id: string
          student_id: string
          vision_result: string | null
          weight_kg: number | null
        }
        Insert: {
          checkup_date: string
          checkup_type?: string
          created_at?: string
          dental_result?: string | null
          doctor_name?: string | null
          hearing_result?: string | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          school_id: string
          student_id: string
          vision_result?: string | null
          weight_kg?: number | null
        }
        Update: {
          checkup_date?: string
          checkup_type?: string
          created_at?: string
          dental_result?: string | null
          doctor_name?: string | null
          hearing_result?: string | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          school_id?: string
          student_id?: string
          vision_result?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_medical_checkups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_medical_checkups_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          school_id: string
          start_date: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          school_id: string
          start_date: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          school_id?: string
          start_date?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_medications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_medications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_vaccinations: {
        Row: {
          administered_on: string
          created_at: string
          dose_number: number
          id: string
          next_due_on: string | null
          notes: string | null
          provider: string | null
          school_id: string
          student_id: string
          vaccine_name: string
        }
        Insert: {
          administered_on: string
          created_at?: string
          dose_number?: number
          id?: string
          next_due_on?: string | null
          notes?: string | null
          provider?: string | null
          school_id: string
          student_id: string
          vaccine_name: string
        }
        Update: {
          administered_on?: string
          created_at?: string
          dose_number?: number
          id?: string
          next_due_on?: string | null
          notes?: string | null
          provider?: string | null
          school_id?: string
          student_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_vaccinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_vaccinations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          allergen_tags: string[]
          created_at: string
          id: string
          inventory_product_id: string | null
          is_active: boolean
          name: string
          notes: string | null
          nutrition_info: Json
          school_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          allergen_tags?: string[]
          created_at?: string
          id?: string
          inventory_product_id?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          nutrition_info?: Json
          school_id: string
          unit?: string
          updated_at?: string
        }
        Update: {
          allergen_tags?: string[]
          created_at?: string
          id?: string
          inventory_product_id?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          nutrition_info?: Json
          school_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_inventory_product_id_fkey"
            columns: ["inventory_product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          school_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          school_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          school_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_products: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          min_quantity: number
          name: string
          notes: string | null
          school_id: string
          sku: string | null
          supplier_id: string | null
          track_expiry: boolean
          unit: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_quantity?: number
          name: string
          notes?: string | null
          school_id: string
          sku?: string | null
          supplier_id?: string | null
          track_expiry?: boolean
          unit?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_quantity?: number
          name?: string
          notes?: string | null
          school_id?: string
          sku?: string | null
          supplier_id?: string | null
          track_expiry?: boolean
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_products_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "inventory_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          product_id: string
          quantity: number
          school_id: string
          updated_at: string
        }
        Insert: {
          product_id: string
          quantity?: number
          school_id: string
          updated_at?: string
        }
        Update: {
          product_id?: string
          quantity?: number
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          reference_number: string | null
          school_id: string
          supplier_id: string | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["inventory_transaction_type"]
          transfer_to_product_id: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_number?: string | null
          school_id: string
          supplier_id?: string | null
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["inventory_transaction_type"]
          transfer_to_product_id?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_number?: string | null
          school_id?: string
          supplier_id?: string | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["inventory_transaction_type"]
          transfer_to_product_id?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "inventory_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_transfer_to_product_id_fkey"
            columns: ["transfer_to_product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_adjustments: {
        Row: {
          adjustment_type: Database["public"]["Enums"]["invoice_adjustment_type"]
          amount: number
          created_at: string
          id: string
          invoice_id: string
          label: string
          school_id: string
        }
        Insert: {
          adjustment_type?: Database["public"]["Enums"]["invoice_adjustment_type"]
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          label: string
          school_id: string
        }
        Update: {
          adjustment_type?: Database["public"]["Enums"]["invoice_adjustment_type"]
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          label?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_adjustments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          school_id: string
          sort_order: number
          tuition_fee_item_id: string | null
          unit_amount: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          school_id: string
          sort_order?: number
          tuition_fee_item_id?: string | null
          unit_amount: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          school_id?: string
          sort_order?: number
          tuition_fee_item_id?: string | null
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_tuition_fee_item_id_fkey"
            columns: ["tuition_fee_item_id"]
            isOneToOne: false
            referencedRelation: "tuition_fee_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          paid_at: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          proof_url: string | null
          receipt_number: string
          reference_note: string | null
          school_id: string
          status: Database["public"]["Enums"]["invoice_payment_status"]
          submitted_by: string | null
          verification_note: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          proof_url?: string | null
          receipt_number: string
          reference_note?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["invoice_payment_status"]
          submitted_by?: string | null
          verification_note?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          proof_url?: string | null
          receipt_number?: string
          reference_note?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["invoice_payment_status"]
          submitted_by?: string | null
          verification_note?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_period: string
          created_at: string
          discount_amount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number
          payment_account_id: string | null
          qr_code_url: string | null
          school_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          subtotal: number
          title: string
          total_amount: number
          transfer_content: string | null
          updated_at: string
        }
        Insert: {
          billing_period: string
          created_at?: string
          discount_amount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          payment_account_id?: string | null
          qr_code_url?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          subtotal?: number
          title: string
          total_amount?: number
          transfer_content?: string | null
          updated_at?: string
        }
        Update: {
          billing_period?: string
          created_at?: string
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          payment_account_id?: string | null
          qr_code_url?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          subtotal?: number
          title?: string
          total_amount?: number
          transfer_content?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "payment_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["lead_activity_type"]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lead_id: string
          metadata: Json
          school_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["lead_activity_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id: string
          metadata?: Json
          school_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["lead_activity_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string
          metadata?: Json
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          school_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          school_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          campus_id: string | null
          child_dob: string | null
          child_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          notes: string | null
          parent_name: string
          phone: string
          school_id: string
          source_id: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campus_id?: string | null
          child_dob?: string | null
          child_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          parent_name: string
          phone: string
          school_id: string
          source_id?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campus_id?: string | null
          child_dob?: string | null
          child_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          parent_name?: string
          phone?: string
          school_id?: string
          source_id?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          start_date: string
          status: Database["public"]["Enums"]["leave_request_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          start_date: string
          status?: Database["public"]["Enums"]["leave_request_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["leave_request_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_categories: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string
          custom_dish_name: string | null
          dish_id: string | null
          id: string
          meal_slot: Database["public"]["Enums"]["meal_slot"]
          menu_date: string
          menu_id: string
          portion_notes: string | null
          school_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          custom_dish_name?: string | null
          dish_id?: string | null
          id?: string
          meal_slot: Database["public"]["Enums"]["meal_slot"]
          menu_date: string
          menu_id: string
          portion_notes?: string | null
          school_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          custom_dish_name?: string | null
          dish_id?: string | null
          id?: string
          meal_slot?: Database["public"]["Enums"]["meal_slot"]
          menu_date?: string
          menu_id?: string
          portion_notes?: string | null
          school_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          items: Json
          name: string
          period_type: Database["public"]["Enums"]["menu_period_type"]
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          items?: Json
          name: string
          period_type?: Database["public"]["Enums"]["menu_period_type"]
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          items?: Json
          name?: string
          period_type?: Database["public"]["Enums"]["menu_period_type"]
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string | null
          period_type: Database["public"]["Enums"]["menu_period_type"]
          published_at: string | null
          published_by: string | null
          school_id: string
          start_date: string
          status: Database["public"]["Enums"]["menu_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          period_type?: Database["public"]["Enums"]["menu_period_type"]
          published_at?: string | null
          published_by?: string | null
          school_id: string
          start_date: string
          status?: Database["public"]["Enums"]["menu_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          period_type?: Database["public"]["Enums"]["menu_period_type"]
          published_at?: string | null
          published_by?: string | null
          school_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["menu_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          ai_credits_monthly: number
          code: string
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_campuses: number
          max_storage_mb: number
          max_students: number
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number
          stripe_price_id: string | null
          stripe_price_yearly_id: string | null
          updated_at: string
        }
        Insert: {
          ai_credits_monthly?: number
          code: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_campuses?: number
          max_storage_mb?: number
          max_students?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          stripe_price_id?: string | null
          stripe_price_yearly_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_credits_monthly?: number
          code?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_campuses?: number
          max_storage_mb?: number
          max_students?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          stripe_price_id?: string | null
          stripe_price_yearly_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parent_student_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_primary: boolean
          relationship: string
          school_id: string
          student_id: string
          student_parent_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary?: boolean
          relationship?: string
          school_id: string
          student_id: string
          student_parent_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary?: boolean
          relationship?: string
          school_id?: string
          student_id?: string
          student_parent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_links_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_links_student_parent_id_fkey"
            columns: ["student_parent_id"]
            isOneToOne: false
            referencedRelation: "student_parents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          branch: string | null
          campus_id: string | null
          created_at: string
          id: string
          is_default: boolean
          logo_url: string | null
          school_id: string
          status: Database["public"]["Enums"]["payment_account_status"]
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          branch?: string | null
          campus_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          logo_url?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["payment_account_status"]
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          branch?: string | null
          campus_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          logo_url?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["payment_account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_accounts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["payment_audit_action"]
          created_at: string
          created_by: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          school_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["payment_audit_action"]
          created_at?: string
          created_by?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          school_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["payment_audit_action"]
          created_at?: string
          created_by?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_instructions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          notes: string | null
          school_id: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          school_id: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          school_id?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_instructions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_refunds: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          payment_id: string
          reason: string | null
          refunded_at: string
          school_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          payment_id: string
          reason?: string | null
          refunded_at?: string
          school_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          payment_id?: string
          reason?: string | null
          refunded_at?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "invoice_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_refunds_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          notes: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["platform_admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      platform_audit_logs: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number
          school_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number
          school_id: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          school_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          received_at: string | null
          school_id: string
          status: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          received_at?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          received_at?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "inventory_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      school_custom_roles: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_custom_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_members: {
        Row: {
          created_at: string
          custom_role_id: string | null
          deleted_at: string | null
          id: string
          role: Database["public"]["Enums"]["school_member_role"]
          school_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_role_id?: string | null
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["school_member_role"]
          school_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_role_id?: string | null
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["school_member_role"]
          school_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_members_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "school_custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_payment_methods: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          is_enabled: boolean
          method: Database["public"]["Enums"]["school_payment_method_type"]
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          method: Database["public"]["Enums"]["school_payment_method_type"]
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          method?: Database["public"]["Enums"]["school_payment_method_type"]
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_payment_methods_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_role_permissions: {
        Row: {
          created_at: string
          custom_role_id: string | null
          granted: boolean
          id: string
          permission: string
          role: Database["public"]["Enums"]["school_member_role"] | null
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_role_id?: string | null
          granted?: boolean
          id?: string
          permission: string
          role?: Database["public"]["Enums"]["school_member_role"] | null
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_role_id?: string | null
          granted?: boolean
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["school_member_role"] | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_role_permissions_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "school_custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_role_permissions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_subscription_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          package_id: string
          previous_package_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_invoice_id: string | null
          stripe_invoice_url: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          package_id: string
          previous_package_id?: string | null
          school_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_invoice_id?: string | null
          stripe_invoice_url?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          package_id?: string
          previous_package_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_invoice_id?: string | null
          stripe_invoice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_subscription_history_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subscription_history_previous_package_id_fkey"
            columns: ["previous_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subscription_history_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_billing_invoices: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          buyer_email: string | null
          created_at: string
          currency: string
          emailed_at: string | null
          id: string
          invoice_number: string
          issued_at: string
          package_id: string | null
          package_name: string
          school_id: string
          school_name: string
          status: string
          stripe_invoice_id: string
          subtotal: number
          total_amount: number
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          buyer_email?: string | null
          created_at?: string
          currency?: string
          emailed_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          package_id?: string | null
          package_name: string
          school_id: string
          school_name: string
          status?: string
          stripe_invoice_id: string
          subtotal: number
          total_amount: number
          vat_amount: number
          vat_rate?: number
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          buyer_email?: string | null
          created_at?: string
          currency?: string
          emailed_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          package_id?: string | null
          package_name?: string
          school_id?: string
          school_name?: string
          status?: string
          stripe_invoice_id?: string
          subtotal?: number
          total_amount?: number
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "saas_billing_invoices_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_billing_invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          school_id: string
          stripe_checkout_session_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          school_id: string
          stripe_checkout_session_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          school_id?: string
          stripe_checkout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "subscription_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_coupon_redemptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_coupons: {
        Row: {
          applicable_package_codes: string[]
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          redemption_count: number
          stripe_coupon_id: string | null
          stripe_promotion_code_id: string | null
          updated_at: string
        }
        Insert: {
          applicable_package_codes?: string[]
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          updated_at?: string
        }
        Update: {
          applicable_package_codes?: string[]
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      school_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          package_id: string
          school_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          past_due_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          package_id: string
          school_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          past_due_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          package_id?: string
          school_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          past_due_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          id: string
          processed_at: string
        }
        Insert: {
          event_type: string
          id: string
          processed_at?: string
        }
        Update: {
          event_type?: string
          id?: string
          processed_at?: string
        }
        Relationships: []
      }
      trial_email_reminders: {
        Row: {
          id: string
          recipient_email: string
          reminder_kind: string
          school_id: string
          sent_at: string
        }
        Insert: {
          id?: string
          recipient_email: string
          reminder_kind: string
          school_id: string
          sent_at?: string
        }
        Update: {
          id?: string
          recipient_email?: string
          reminder_kind?: string
          school_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_email_reminders_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          name: string
          school_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          name: string
          school_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          custom_domain: string | null
          deleted_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          status: Database["public"]["Enums"]["school_status"]
          theme_primary_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          custom_domain?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          status?: Database["public"]["Enums"]["school_status"]
          theme_primary_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          custom_domain?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["school_status"]
          theme_primary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          school_id: string
          school_year_id: string
          sort_order: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          school_id: string
          school_year_id: string
          sort_order?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          school_id?: string
          school_year_id?: string
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semesters_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "semesters_school_year_id_fkey"
            columns: ["school_year_id"]
            isOneToOne: false
            referencedRelation: "school_years"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_attendance: {
        Row: {
          attendance_date: string
          check_in_at: string | null
          check_out_at: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          is_early_leave: boolean
          is_late: boolean
          notes: string | null
          school_id: string
          source: Database["public"]["Enums"]["staff_attendance_source"]
          total_minutes: number | null
          updated_at: string
        }
        Insert: {
          attendance_date: string
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          is_early_leave?: boolean
          is_late?: boolean
          notes?: string | null
          school_id: string
          source?: Database["public"]["Enums"]["staff_attendance_source"]
          total_minutes?: number | null
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          is_early_leave?: boolean
          is_late?: boolean
          notes?: string | null
          school_id?: string
          source?: Database["public"]["Enums"]["staff_attendance_source"]
          total_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_class_assignments: {
        Row: {
          assigned_at: string
          assignment_role: string
          class_id: string
          created_at: string
          employee_id: string
          id: string
          school_id: string
        }
        Insert: {
          assigned_at?: string
          assignment_role?: string
          class_id: string
          created_at?: string
          employee_id: string
          id?: string
          school_id: string
        }
        Update: {
          assigned_at?: string
          assignment_role?: string
          class_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_class_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_class_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_contracts: {
        Row: {
          contract_type: Database["public"]["Enums"]["staff_contract_type"]
          created_at: string
          document_url: string | null
          employee_id: string
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          salary_amount: number
          school_id: string
          start_date: string
          terminated_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["staff_contract_type"]
          created_at?: string
          document_url?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          salary_amount?: number
          school_id: string
          start_date: string
          terminated_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["staff_contract_type"]
          created_at?: string
          document_url?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          salary_amount?: number
          school_id?: string
          start_date?: string
          terminated_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_contracts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_departments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["staff_document_type"]
          employee_id: string
          expires_at: string | null
          file_name: string | null
          file_url: string
          id: string
          notes: string | null
          school_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["staff_document_type"]
          employee_id: string
          expires_at?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          notes?: string | null
          school_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["staff_document_type"]
          employee_id?: string
          expires_at?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          school_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_employees: {
        Row: {
          access_role: Database["public"]["Enums"]["staff_access_role"]
          address: string | null
          campus_id: string | null
          created_at: string
          created_by: string | null
          custom_role_id: string | null
          date_of_birth: string | null
          deleted_at: string | null
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_code: string
          employment_status: Database["public"]["Enums"]["staff_employment_status"]
          full_name: string
          gender: string | null
          grant_system_access: boolean
          hire_date: string | null
          id: string
          id_number: string | null
          invite_accepted_at: string | null
          invite_sent_at: string | null
          is_teacher: boolean
          manager_id: string | null
          member_id: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          position_id: string | null
          school_id: string
          termination_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_role?: Database["public"]["Enums"]["staff_access_role"]
          address?: string | null
          campus_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_role_id?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_code: string
          employment_status?: Database["public"]["Enums"]["staff_employment_status"]
          full_name: string
          gender?: string | null
          grant_system_access?: boolean
          hire_date?: string | null
          id?: string
          id_number?: string | null
          invite_accepted_at?: string | null
          invite_sent_at?: string | null
          is_teacher?: boolean
          manager_id?: string | null
          member_id?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          position_id?: string | null
          school_id: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_role?: Database["public"]["Enums"]["staff_access_role"]
          address?: string | null
          campus_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_role_id?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_code?: string
          employment_status?: Database["public"]["Enums"]["staff_employment_status"]
          full_name?: string
          gender?: string | null
          grant_system_access?: boolean
          hire_date?: string | null
          id?: string
          id_number?: string | null
          invite_accepted_at?: string | null
          invite_sent_at?: string | null
          is_teacher?: boolean
          manager_id?: string | null
          member_id?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          position_id?: string | null
          school_id?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_employees_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employees_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "school_custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "staff_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "staff_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "school_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "staff_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_leave_requests: {
        Row: {
          created_at: string
          created_by: string | null
          days_count: number
          employee_id: string
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["staff_leave_type"]
          reason: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          start_date: string
          status: Database["public"]["Enums"]["staff_leave_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          days_count?: number
          employee_id: string
          end_date: string
          id?: string
          leave_type?: Database["public"]["Enums"]["staff_leave_type"]
          reason?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          start_date: string
          status?: Database["public"]["Enums"]["staff_leave_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["staff_leave_type"]
          reason?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["staff_leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_leave_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_positions: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "staff_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_positions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_count_items: {
        Row: {
          counted_quantity: number | null
          created_at: string
          expected_quantity: number
          id: string
          product_id: string
          school_id: string
          stock_count_id: string
        }
        Insert: {
          counted_quantity?: number | null
          created_at?: string
          expected_quantity?: number
          id?: string
          product_id: string
          school_id: string
          stock_count_id: string
        }
        Update: {
          counted_quantity?: number | null
          created_at?: string
          expected_quantity?: number
          id?: string
          product_id?: string
          school_id?: string
          stock_count_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_items_stock_count_id_fkey"
            columns: ["stock_count_id"]
            isOneToOne: false
            referencedRelation: "stock_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_counts: {
        Row: {
          completed_at: string | null
          count_date: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          school_id: string
          status: Database["public"]["Enums"]["stock_count_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          count_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["stock_count_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          count_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["stock_count_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_counts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_allergies: {
        Row: {
          allergen: string
          created_at: string
          id: string
          notes: string | null
          school_id: string
          severity: string | null
          student_id: string
        }
        Insert: {
          allergen: string
          created_at?: string
          id?: string
          notes?: string | null
          school_id: string
          severity?: string | null
          student_id: string
        }
        Update: {
          allergen?: string
          created_at?: string
          id?: string
          notes?: string | null
          school_id?: string
          severity?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_allergies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_allergies_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_contracts: {
        Row: {
          billing_period: string | null
          contract_number: string
          contract_type: Database["public"]["Enums"]["student_contract_type"]
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          invoice_id: string | null
          school_id: string
          signed_at: string | null
          start_date: string
          status: Database["public"]["Enums"]["student_contract_status"]
          student_id: string
          terms: string | null
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          billing_period?: string | null
          contract_number: string
          contract_type: Database["public"]["Enums"]["student_contract_type"]
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          invoice_id?: string | null
          school_id: string
          signed_at?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["student_contract_status"]
          student_id: string
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          billing_period?: string | null
          contract_number?: string
          contract_type?: Database["public"]["Enums"]["student_contract_type"]
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          invoice_id?: string | null
          school_id?: string
          signed_at?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["student_contract_status"]
          student_id?: string
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_daily_reports: {
        Row: {
          activities: string | null
          created_at: string
          created_by: string | null
          daily_summary: string | null
          health_observation: Json | null
          id: string
          learning_activities: Json
          meal_records: Json
          meals: string | null
          medication_records: Json
          mood: string | null
          nap: string | null
          parent_acknowledged_at: string | null
          published_at: string | null
          report_date: string
          school_id: string
          sleep_record: Json | null
          status: Database["public"]["Enums"]["daily_report_status"]
          student_id: string
          teacher_note: string | null
          toilet_records: Json
          updated_at: string
        }
        Insert: {
          activities?: string | null
          created_at?: string
          created_by?: string | null
          daily_summary?: string | null
          health_observation?: Json | null
          id?: string
          learning_activities?: Json
          meal_records?: Json
          meals?: string | null
          medication_records?: Json
          mood?: string | null
          nap?: string | null
          parent_acknowledged_at?: string | null
          published_at?: string | null
          report_date?: string
          school_id: string
          sleep_record?: Json | null
          status?: Database["public"]["Enums"]["daily_report_status"]
          student_id: string
          teacher_note?: string | null
          toilet_records?: Json
          updated_at?: string
        }
        Update: {
          activities?: string | null
          created_at?: string
          created_by?: string | null
          daily_summary?: string | null
          health_observation?: Json | null
          id?: string
          learning_activities?: Json
          meal_records?: Json
          meals?: string | null
          medication_records?: Json
          mood?: string | null
          nap?: string | null
          parent_acknowledged_at?: string | null
          published_at?: string | null
          report_date?: string
          school_id?: string
          sleep_record?: Json | null
          status?: Database["public"]["Enums"]["daily_report_status"]
          student_id?: string
          teacher_note?: string | null
          toilet_records?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_daily_reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_daily_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_emergency_contacts: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string
          relationship: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone: string
          relationship?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          relationship?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_emergency_contacts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_emergency_contacts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_medical_records: {
        Row: {
          blood_type: string | null
          conditions: string | null
          doctor_name: string | null
          doctor_phone: string | null
          medications: string | null
          notes: string | null
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          blood_type?: string | null
          conditions?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          medications?: string | null
          notes?: string | null
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          blood_type?: string | null
          conditions?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          medications?: string | null
          notes?: string | null
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_medical_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medical_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parents: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          phone: string | null
          relationship: string
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          relationship?: string
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          relationship?: string
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_pickup_persons: {
        Row: {
          created_at: string
          full_name: string
          id: string
          id_number: string | null
          phone: string | null
          photo_url: string | null
          relationship: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          id_number?: string | null
          phone?: string | null
          photo_url?: string | null
          relationship?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          id_number?: string | null
          phone?: string | null
          photo_url?: string | null
          relationship?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_pickup_persons_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_pickup_persons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_timeline: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_type: Database["public"]["Enums"]["student_timeline_event"]
          id: string
          metadata: Json
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type: Database["public"]["Enums"]["student_timeline_event"]
          id?: string
          metadata?: Json
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type?: Database["public"]["Enums"]["student_timeline_event"]
          id?: string
          metadata?: Json
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_timeline_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_timeline_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          campus_id: string | null
          class_name: string | null
          created_at: string
          created_by: string | null
          current_class_id: string | null
          date_of_birth: string | null
          deleted_at: string | null
          enrollment_date: string | null
          full_name: string
          gender: Database["public"]["Enums"]["student_gender"] | null
          id: string
          lead_id: string | null
          notes: string | null
          photo_url: string | null
          school_id: string
          status: Database["public"]["Enums"]["student_status"]
          student_code: string
          updated_at: string
        }
        Insert: {
          campus_id?: string | null
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          current_class_id?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          enrollment_date?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["student_gender"] | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          photo_url?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["student_status"]
          student_code: string
          updated_at?: string
        }
        Update: {
          campus_id?: string | null
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          current_class_id?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          enrollment_date?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["student_gender"] | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          photo_url?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["student_status"]
          student_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_current_class_id_fkey"
            columns: ["current_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_fee_items: {
        Row: {
          amount: number
          billing_cycle: Database["public"]["Enums"]["tuition_billing_cycle"]
          category: Database["public"]["Enums"]["tuition_fee_category"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: Database["public"]["Enums"]["tuition_billing_cycle"]
          category?: Database["public"]["Enums"]["tuition_fee_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: Database["public"]["Enums"]["tuition_billing_cycle"]
          category?: Database["public"]["Enums"]["tuition_fee_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_fee_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_fee_plan_items: {
        Row: {
          amount_override: number | null
          created_at: string
          id: string
          plan_id: string
          school_id: string
          sort_order: number
          tuition_fee_item_id: string
        }
        Insert: {
          amount_override?: number | null
          created_at?: string
          id?: string
          plan_id: string
          school_id: string
          sort_order?: number
          tuition_fee_item_id: string
        }
        Update: {
          amount_override?: number | null
          created_at?: string
          id?: string
          plan_id?: string
          school_id?: string
          sort_order?: number
          tuition_fee_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_fee_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "tuition_fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_fee_plan_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_fee_plan_items_tuition_fee_item_id_fkey"
            columns: ["tuition_fee_item_id"]
            isOneToOne: false
            referencedRelation: "tuition_fee_items"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_fee_plans: {
        Row: {
          academic_year: string | null
          class_id: string | null
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          class_id?: string | null
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          class_id?: string | null
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_fee_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_fee_plans_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_fee_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          body: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          link_url: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          school_id: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          link_url?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          school_id: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          link_url?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          school_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_platform_super_admin: {
        Args: { p_email?: string; p_name?: string; p_password?: string }
        Returns: string
      }
      create_school_for_owner: {
        Args: {
          p_address?: string
          p_campus_name?: string
          p_email?: string
          p_name: string
          p_phone?: string
          p_slug: string
        }
        Returns: string
      }
      expire_expired_trial_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          school_id: string
          subscription_id: string
        }[]
      }
      next_saas_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_school_storage_usage_bytes: {
        Args: { p_school_id: string }
        Returns: number
      }
      default_role_has_permission: {
        Args: {
          p_permission: string
          p_role: Database["public"]["Enums"]["school_member_role"]
        }
        Returns: boolean
      }
      find_account_by_email_for_school: {
        Args: { p_email: string; p_school_id: string }
        Returns: {
          email: string
          id: string
          name: string
        }[]
      }
      get_auth_user_parent_student_ids: { Args: never; Returns: string[] }
      get_auth_user_school_ids: { Args: never; Returns: string[] }
      get_school_member_accounts: {
        Args: { p_school_id: string; p_user_ids?: string[] }
        Returns: {
          email: string
          id: string
          name: string
        }[]
      }
      is_platform_admin: {
        Args: {
          allowed_roles?: Database["public"]["Enums"]["platform_admin_role"][]
        }
        Returns: boolean
      }
      is_school_slug_available: { Args: { p_slug: string }; Returns: boolean }
      seed_custom_role_permissions: {
        Args: { p_custom_role_id: string }
        Returns: undefined
      }
      seed_school_role_permissions: {
        Args: { p_school_id: string }
        Returns: undefined
      }
      upsert_school_role_permission_grants: {
        Args: { p_grants: Json; p_school_id: string }
        Returns: undefined
      }
      user_can_access_communication_media: {
        Args: { object_name: string }
        Returns: boolean
      }
      user_can_access_daily_report_media: {
        Args: { object_name: string }
        Returns: boolean
      }
      user_can_access_student_photo: {
        Args: { object_name: string }
        Returns: boolean
      }
      user_has_school_permission: {
        Args: { p_permission: string; p_school_id: string }
        Returns: boolean
      }
      user_has_school_role: {
        Args: {
          allowed_roles: Database["public"]["Enums"]["school_member_role"][]
          target_school_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ai_action_type:
        | "chat"
        | "daily_comment"
        | "report"
        | "notification_draft"
        | "enrollment_forecast"
        | "revenue_forecast"
      ai_message_role: "user" | "assistant" | "system"
      attendance_status:
        | "present"
        | "absent"
        | "late"
        | "excused"
        | "early_leave"
      calendar_event_category:
        | "learning_activity"
        | "event"
        | "holiday"
        | "parent_meeting"
        | "health_checkup"
        | "other"
      calendar_event_scope: "school" | "campus" | "class"
      campus_type: "campus" | "branch"
      class_status: "active" | "archived"
      communication_channel: "homeroom" | "school_office"
      communication_reaction:
        | "like"
        | "love"
        | "haha"
        | "wow"
        | "sad"
        | "thanks"
      daily_report_status: "draft" | "published"
      health_incident_severity: "minor" | "moderate" | "serious"
      health_incident_type:
        | "injury"
        | "illness"
        | "allergy_reaction"
        | "fall"
        | "other"
      inventory_transaction_type:
        | "receipt"
        | "issue"
        | "adjustment"
        | "transfer"
      invoice_adjustment_type: "discount" | "scholarship"
      invoice_payment_status:
        | "pending"
        | "waiting_verification"
        | "verified"
        | "rejected"
      invoice_status:
        | "draft"
        | "issued"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
        | "waiting_verification"
      lead_activity_type:
        | "created"
        | "stage_changed"
        | "assigned"
        | "note"
        | "contact"
        | "appointment"
        | "visit"
        | "deposit"
        | "enrollment"
      lead_stage:
        | "new"
        | "contacted"
        | "appointment"
        | "visited"
        | "deposit"
        | "enrolled"
        | "lost"
      lead_status: "active" | "won" | "lost"
      leave_request_status: "pending" | "approved" | "rejected"
      meal_slot: "breakfast" | "lunch" | "snack" | "dinner"
      menu_period_type: "daily" | "weekly" | "monthly"
      menu_status: "draft" | "published"
      notification_category:
        | "daily_report"
        | "menu"
        | "inventory"
        | "system"
        | "calendar"
        | "communication"
        | "finance"
        | "subscription"
      payment_account_status: "active" | "inactive"
      payment_audit_action:
        | "account_created"
        | "account_updated"
        | "account_deactivated"
        | "account_default_changed"
        | "method_enabled"
        | "method_disabled"
        | "method_default_changed"
        | "instructions_updated"
      payment_method: "cash" | "bank_transfer" | "card" | "other" | "qr_banking"
      platform_admin_role: "super_admin" | "support" | "billing"
      purchase_order_status: "draft" | "submitted" | "received" | "cancelled"
      school_member_role:
        | "owner"
        | "admin"
        | "staff"
        | "teacher"
        | "accountant"
        | "parent"
        | "manager"
      school_payment_method_type: "cash" | "bank_transfer" | "qr_banking"
      school_status: "active" | "suspended" | "archived"
      staff_access_role: "staff" | "admin" | "accountant" | "manager"
      staff_attendance_source: "check_in" | "manual"
      staff_contract_type: "full_time" | "part_time" | "contract" | "probation"
      staff_document_type:
        | "id_card"
        | "degree"
        | "certificate"
        | "contract"
        | "other"
      staff_employment_status: "active" | "inactive" | "on_leave" | "terminated"
      staff_leave_status: "pending" | "approved" | "rejected" | "cancelled"
      staff_leave_type: "annual" | "sick" | "unpaid" | "other"
      stock_count_status: "draft" | "completed" | "cancelled"
      student_contract_status:
        | "draft"
        | "active"
        | "expired"
        | "terminated"
        | "cancelled"
      student_contract_type:
        | "enrollment"
        | "re_enrollment"
        | "service"
        | "tuition_agreement"
      student_gender: "male" | "female" | "other"
      student_status:
        | "active"
        | "inactive"
        | "graduated"
        | "transferred"
        | "withdrawn"
      student_timeline_event:
        | "created"
        | "updated"
        | "status_changed"
        | "class_transfer"
        | "graduated"
        | "note"
        | "parent_added"
        | "medical_updated"
      subscription_status: "trial" | "active" | "past_due" | "cancelled"
      tuition_billing_cycle:
        | "monthly"
        | "quarterly"
        | "semester"
        | "yearly"
        | "one_time"
      tuition_fee_category:
        | "tuition"
        | "meals"
        | "bus"
        | "uniform"
        | "extracurricular"
        | "club"
        | "insurance"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_action_type: [
        "chat",
        "daily_comment",
        "report",
        "notification_draft",
        "enrollment_forecast",
        "revenue_forecast",
      ],
      ai_message_role: ["user", "assistant", "system"],
      attendance_status: [
        "present",
        "absent",
        "late",
        "excused",
        "early_leave",
      ],
      calendar_event_category: [
        "learning_activity",
        "event",
        "holiday",
        "parent_meeting",
        "health_checkup",
        "other",
      ],
      calendar_event_scope: ["school", "campus", "class"],
      campus_type: ["campus", "branch"],
      class_status: ["active", "archived"],
      communication_channel: ["homeroom", "school_office"],
      communication_reaction: ["like", "love", "haha", "wow", "sad", "thanks"],
      daily_report_status: ["draft", "published"],
      health_incident_severity: ["minor", "moderate", "serious"],
      health_incident_type: [
        "injury",
        "illness",
        "allergy_reaction",
        "fall",
        "other",
      ],
      inventory_transaction_type: [
        "receipt",
        "issue",
        "adjustment",
        "transfer",
      ],
      invoice_adjustment_type: ["discount", "scholarship"],
      invoice_payment_status: [
        "pending",
        "waiting_verification",
        "verified",
        "rejected",
      ],
      invoice_status: [
        "draft",
        "issued",
        "partial",
        "paid",
        "overdue",
        "cancelled",
        "waiting_verification",
      ],
      lead_activity_type: [
        "created",
        "stage_changed",
        "assigned",
        "note",
        "contact",
        "appointment",
        "visit",
        "deposit",
        "enrollment",
      ],
      lead_stage: [
        "new",
        "contacted",
        "appointment",
        "visited",
        "deposit",
        "enrolled",
        "lost",
      ],
      lead_status: ["active", "won", "lost"],
      leave_request_status: ["pending", "approved", "rejected"],
      meal_slot: ["breakfast", "lunch", "snack", "dinner"],
      menu_period_type: ["daily", "weekly", "monthly"],
      menu_status: ["draft", "published"],
      notification_category: [
        "daily_report",
        "menu",
        "inventory",
        "system",
        "calendar",
        "communication",
        "finance",
        "subscription",
      ],
      payment_account_status: ["active", "inactive"],
      payment_audit_action: [
        "account_created",
        "account_updated",
        "account_deactivated",
        "account_default_changed",
        "method_enabled",
        "method_disabled",
        "method_default_changed",
        "instructions_updated",
      ],
      payment_method: ["cash", "bank_transfer", "card", "other", "qr_banking"],
      platform_admin_role: ["super_admin", "support", "billing"],
      purchase_order_status: ["draft", "submitted", "received", "cancelled"],
      school_member_role: [
        "owner",
        "admin",
        "staff",
        "teacher",
        "accountant",
        "parent",
        "manager",
      ],
      school_payment_method_type: ["cash", "bank_transfer", "qr_banking"],
      school_status: ["active", "suspended", "archived"],
      staff_access_role: ["staff", "admin", "accountant", "manager"],
      staff_attendance_source: ["check_in", "manual"],
      staff_contract_type: ["full_time", "part_time", "contract", "probation"],
      staff_document_type: [
        "id_card",
        "degree",
        "certificate",
        "contract",
        "other",
      ],
      staff_employment_status: ["active", "inactive", "on_leave", "terminated"],
      staff_leave_status: ["pending", "approved", "rejected", "cancelled"],
      staff_leave_type: ["annual", "sick", "unpaid", "other"],
      stock_count_status: ["draft", "completed", "cancelled"],
      student_contract_status: [
        "draft",
        "active",
        "expired",
        "terminated",
        "cancelled",
      ],
      student_contract_type: [
        "enrollment",
        "re_enrollment",
        "service",
        "tuition_agreement",
      ],
      student_gender: ["male", "female", "other"],
      student_status: [
        "active",
        "inactive",
        "graduated",
        "transferred",
        "withdrawn",
      ],
      student_timeline_event: [
        "created",
        "updated",
        "status_changed",
        "class_transfer",
        "graduated",
        "note",
        "parent_added",
        "medical_updated",
      ],
      subscription_status: ["trial", "active", "past_due", "cancelled"],
      tuition_billing_cycle: [
        "monthly",
        "quarterly",
        "semester",
        "yearly",
        "one_time",
      ],
      tuition_fee_category: [
        "tuition",
        "meals",
        "bus",
        "uniform",
        "extracurricular",
        "club",
        "insurance",
        "other",
      ],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

