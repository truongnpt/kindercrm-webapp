export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          name: string;
          picture_url: string | null;
          public_data: Json;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          picture_url?: string | null;
          public_data?: Json;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          picture_url?: string | null;
          public_data?: Json;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      ai_chat_messages: {
        Row: {
          content: string;
          created_at: string;
          credits_used: number;
          id: string;
          role: Database['public']['Enums']['ai_message_role'];
          school_id: string;
          session_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          credits_used?: number;
          id?: string;
          role: Database['public']['Enums']['ai_message_role'];
          school_id: string;
          session_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          credits_used?: number;
          id?: string;
          role?: Database['public']['Enums']['ai_message_role'];
          school_id?: string;
          session_id?: string;
        };
        Relationships: [];
      };
      ai_chat_sessions: {
        Row: {
          created_at: string;
          id: string;
          school_id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          school_id: string;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          school_id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_credit_usage: {
        Row: {
          credits_limit: number;
          credits_used: number;
          id: string;
          school_id: string;
          updated_at: string;
          usage_month: string;
        };
        Insert: {
          credits_limit?: number;
          credits_used?: number;
          id?: string;
          school_id: string;
          updated_at?: string;
          usage_month: string;
        };
        Update: {
          credits_limit?: number;
          credits_used?: number;
          id?: string;
          school_id?: string;
          updated_at?: string;
          usage_month?: string;
        };
        Relationships: [];
      };
      ai_knowledge_articles: {
        Row: {
          category: string;
          content: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_active: boolean;
          school_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          content: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_active?: boolean;
          school_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          content?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_active?: boolean;
          school_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campuses: {
        Row: {
          address: string | null;
          campus_type: Database['public']['Enums']['campus_type'];
          created_at: string;
          deleted_at: string | null;
          id: string;
          is_main: boolean;
          name: string;
          parent_campus_id: string | null;
          phone: string | null;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          campus_type?: Database['public']['Enums']['campus_type'];
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          is_main?: boolean;
          name: string;
          parent_campus_id?: string | null;
          phone?: string | null;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          campus_type?: Database['public']['Enums']['campus_type'];
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          is_main?: boolean;
          name?: string;
          parent_campus_id?: string | null;
          phone?: string | null;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campuses_parent_campus_id_fkey';
            columns: ['parent_campus_id'];
            isOneToOne: false;
            referencedRelation: 'campuses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campuses_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      packages: {
        Row: {
          ai_credits_monthly: number;
          code: string;
          created_at: string;
          description: string | null;
          features: Json;
          id: string;
          is_active: boolean;
          max_campuses: number;
          max_storage_mb: number;
          max_students: number;
          name: string;
          price_monthly: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          ai_credits_monthly?: number;
          code: string;
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          max_campuses?: number;
          max_storage_mb?: number;
          max_students?: number;
          name: string;
          price_monthly?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          ai_credits_monthly?: number;
          code?: string;
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          max_campuses?: number;
          max_storage_mb?: number;
          max_students?: number;
          name?: string;
          price_monthly?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      school_members: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          role: Database['public']['Enums']['school_member_role'];
          school_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          role?: Database['public']['Enums']['school_member_role'];
          school_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          role?: Database['public']['Enums']['school_member_role'];
          school_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'school_members_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      school_subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          package_id: string;
          school_id: string;
          status: Database['public']['Enums']['subscription_status'];
          trial_ends_at: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          package_id: string;
          school_id: string;
          status?: Database['public']['Enums']['subscription_status'];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          package_id?: string;
          school_id?: string;
          status?: Database['public']['Enums']['subscription_status'];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'school_subscriptions_package_id_fkey';
            columns: ['package_id'];
            isOneToOne: false;
            referencedRelation: 'packages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'school_subscriptions_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      schools: {
        Row: {
          address: string | null;
          created_at: string;
          custom_domain: string | null;
          deleted_at: string | null;
          email: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          phone: string | null;
          slug: string;
          status: Database['public']['Enums']['school_status'];
          theme_primary_color: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          phone?: string | null;
          slug: string;
          status?: Database['public']['Enums']['school_status'];
          theme_primary_color?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          phone?: string | null;
          slug?: string;
          status?: Database['public']['Enums']['school_status'];
          theme_primary_color?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      school_subscription_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          id: string;
          note: string | null;
          package_id: string;
          previous_package_id: string | null;
          school_id: string;
          status: Database['public']['Enums']['subscription_status'];
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          package_id: string;
          previous_package_id?: string | null;
          school_id: string;
          status: Database['public']['Enums']['subscription_status'];
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          package_id?: string;
          previous_package_id?: string | null;
          school_id?: string;
          status?: Database['public']['Enums']['subscription_status'];
        };
        Relationships: [];
      };
      lead_sources: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          school_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          school_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          school_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          assigned_to: string | null;
          campus_id: string | null;
          child_dob: string | null;
          child_name: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string | null;
          id: string;
          notes: string | null;
          parent_name: string;
          phone: string;
          school_id: string;
          source_id: string | null;
          stage: Database['public']['Enums']['lead_stage'];
          status: Database['public']['Enums']['lead_status'];
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          campus_id?: string | null;
          child_dob?: string | null;
          child_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          notes?: string | null;
          parent_name: string;
          phone: string;
          school_id: string;
          source_id?: string | null;
          stage?: Database['public']['Enums']['lead_stage'];
          status?: Database['public']['Enums']['lead_status'];
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          campus_id?: string | null;
          child_dob?: string | null;
          child_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          notes?: string | null;
          parent_name?: string;
          phone?: string;
          school_id?: string;
          source_id?: string | null;
          stage?: Database['public']['Enums']['lead_stage'];
          status?: Database['public']['Enums']['lead_status'];
          updated_at?: string;
        };
        Relationships: [];
      };
      lead_notes: {
        Row: {
          body: string;
          created_at: string;
          created_by: string | null;
          id: string;
          lead_id: string;
          school_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lead_id: string;
          school_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lead_id?: string;
          school_id?: string;
        };
        Relationships: [];
      };
      lead_activities: {
        Row: {
          activity_type: Database['public']['Enums']['lead_activity_type'];
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          lead_id: string;
          metadata: Json;
          school_id: string;
        };
        Insert: {
          activity_type: Database['public']['Enums']['lead_activity_type'];
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          lead_id: string;
          metadata?: Json;
          school_id: string;
        };
        Update: {
          activity_type?: Database['public']['Enums']['lead_activity_type'];
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          lead_id?: string;
          metadata?: Json;
          school_id?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          campus_id: string | null;
          class_name: string | null;
          created_at: string;
          created_by: string | null;
          current_class_id: string | null;
          date_of_birth: string | null;
          deleted_at: string | null;
          enrollment_date: string | null;
          full_name: string;
          gender: Database['public']['Enums']['student_gender'] | null;
          id: string;
          lead_id: string | null;
          notes: string | null;
          photo_url: string | null;
          school_id: string;
          status: Database['public']['Enums']['student_status'];
          student_code: string;
          updated_at: string;
        };
        Insert: {
          campus_id?: string | null;
          class_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          current_class_id?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          enrollment_date?: string | null;
          full_name: string;
          gender?: Database['public']['Enums']['student_gender'] | null;
          id?: string;
          lead_id?: string | null;
          notes?: string | null;
          photo_url?: string | null;
          school_id: string;
          status?: Database['public']['Enums']['student_status'];
          student_code: string;
          updated_at?: string;
        };
        Update: {
          campus_id?: string | null;
          class_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          current_class_id?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          enrollment_date?: string | null;
          full_name?: string;
          gender?: Database['public']['Enums']['student_gender'] | null;
          id?: string;
          lead_id?: string | null;
          notes?: string | null;
          photo_url?: string | null;
          school_id?: string;
          status?: Database['public']['Enums']['student_status'];
          student_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_parents: {
        Row: {
          address: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          is_primary: boolean;
          phone: string | null;
          relationship: string;
          school_id: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          is_primary?: boolean;
          phone?: string | null;
          relationship?: string;
          school_id: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          is_primary?: boolean;
          phone?: string | null;
          relationship?: string;
          school_id?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_emergency_contacts: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          phone: string;
          relationship: string | null;
          school_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id?: string;
          phone: string;
          relationship?: string | null;
          school_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          relationship?: string | null;
          school_id?: string;
          student_id?: string;
        };
        Relationships: [];
      };
      student_medical_records: {
        Row: {
          blood_type: string | null;
          conditions: string | null;
          doctor_name: string | null;
          doctor_phone: string | null;
          medications: string | null;
          notes: string | null;
          school_id: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          blood_type?: string | null;
          conditions?: string | null;
          doctor_name?: string | null;
          doctor_phone?: string | null;
          medications?: string | null;
          notes?: string | null;
          school_id: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          blood_type?: string | null;
          conditions?: string | null;
          doctor_name?: string | null;
          doctor_phone?: string | null;
          medications?: string | null;
          notes?: string | null;
          school_id?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_allergies: {
        Row: {
          allergen: string;
          created_at: string;
          id: string;
          notes: string | null;
          school_id: string;
          severity: string | null;
          student_id: string;
        };
        Insert: {
          allergen: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          school_id: string;
          severity?: string | null;
          student_id: string;
        };
        Update: {
          allergen?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          school_id?: string;
          severity?: string | null;
          student_id?: string;
        };
        Relationships: [];
      };
      student_pickup_persons: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          id_number: string | null;
          phone: string | null;
          photo_url: string | null;
          relationship: string | null;
          school_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id?: string;
          id_number?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          relationship?: string | null;
          school_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          id_number?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          relationship?: string | null;
          school_id?: string;
          student_id?: string;
        };
        Relationships: [];
      };
      student_timeline: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          event_type: Database['public']['Enums']['student_timeline_event'];
          id: string;
          metadata: Json;
          school_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_type: Database['public']['Enums']['student_timeline_event'];
          id?: string;
          metadata?: Json;
          school_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_type?: Database['public']['Enums']['student_timeline_event'];
          id?: string;
          metadata?: Json;
          school_id?: string;
          student_id?: string;
        };
        Relationships: [];
      };
      school_years: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          is_current: boolean;
          name: string;
          school_id: string;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          is_current?: boolean;
          name: string;
          school_id: string;
          start_date: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          is_current?: boolean;
          name?: string;
          school_id?: string;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      semesters: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          name: string;
          school_id: string;
          school_year_id: string;
          sort_order: number;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          name: string;
          school_id: string;
          school_year_id: string;
          sort_order?: number;
          start_date: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          name?: string;
          school_id?: string;
          school_year_id?: string;
          sort_order?: number;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      classrooms: {
        Row: {
          campus_id: string | null;
          capacity: number;
          created_at: string;
          id: string;
          name: string;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          campus_id?: string | null;
          capacity?: number;
          created_at?: string;
          id?: string;
          name: string;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          campus_id?: string | null;
          capacity?: number;
          created_at?: string;
          id?: string;
          name?: string;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          campus_id: string | null;
          capacity: number;
          classroom_id: string | null;
          code: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string;
          school_id: string;
          school_year_id: string;
          semester_id: string | null;
          status: Database['public']['Enums']['class_status'];
          teacher_user_id: string | null;
          updated_at: string;
        };
        Insert: {
          campus_id?: string | null;
          capacity?: number;
          classroom_id?: string | null;
          code: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name: string;
          school_id: string;
          school_year_id: string;
          semester_id?: string | null;
          status?: Database['public']['Enums']['class_status'];
          teacher_user_id?: string | null;
          updated_at?: string;
        };
        Update: {
          campus_id?: string | null;
          capacity?: number;
          classroom_id?: string | null;
          code?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          school_id?: string;
          school_year_id?: string;
          semester_id?: string | null;
          status?: Database['public']['Enums']['class_status'];
          teacher_user_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      class_enrollments: {
        Row: {
          class_id: string;
          created_at: string;
          enrolled_at: string;
          id: string;
          school_id: string;
          status: string;
          student_id: string;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          enrolled_at?: string;
          id?: string;
          school_id: string;
          status?: string;
          student_id: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          enrolled_at?: string;
          id?: string;
          school_id?: string;
          status?: string;
          student_id?: string;
        };
        Relationships: [];
      };
      class_schedules: {
        Row: {
          class_id: string;
          created_at: string;
          day_of_week: number;
          end_time: string;
          id: string;
          label: string;
          school_id: string;
          start_time: string;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          day_of_week: number;
          end_time: string;
          id?: string;
          label?: string;
          school_id: string;
          start_time: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          day_of_week?: number;
          end_time?: string;
          id?: string;
          label?: string;
          school_id?: string;
          start_time?: string;
        };
        Relationships: [];
      };
      tuition_fee_items: {
        Row: {
          amount: number;
          billing_cycle: Database['public']['Enums']['tuition_billing_cycle'];
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          school_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          amount: number;
          billing_cycle?: Database['public']['Enums']['tuition_billing_cycle'];
          created_at?: string;
          description?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          school_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          billing_cycle?: Database['public']['Enums']['tuition_billing_cycle'];
          created_at?: string;
          description?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          school_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          billing_period: string;
          created_at: string;
          discount_amount: number;
          due_date: string;
          id: string;
          invoice_number: string;
          issue_date: string;
          notes: string | null;
          paid_amount: number;
          school_id: string;
          status: Database['public']['Enums']['invoice_status'];
          student_id: string;
          subtotal: number;
          title: string;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          billing_period: string;
          created_at?: string;
          discount_amount?: number;
          due_date: string;
          id?: string;
          invoice_number: string;
          issue_date?: string;
          notes?: string | null;
          paid_amount?: number;
          school_id: string;
          status?: Database['public']['Enums']['invoice_status'];
          student_id: string;
          subtotal?: number;
          title: string;
          total_amount?: number;
          updated_at?: string;
        };
        Update: {
          billing_period?: string;
          created_at?: string;
          discount_amount?: number;
          due_date?: string;
          id?: string;
          invoice_number?: string;
          issue_date?: string;
          notes?: string | null;
          paid_amount?: number;
          school_id?: string;
          status?: Database['public']['Enums']['invoice_status'];
          student_id?: string;
          subtotal?: number;
          title?: string;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_line_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          invoice_id: string;
          line_total: number;
          quantity: number;
          school_id: string;
          sort_order: number;
          tuition_fee_item_id: string | null;
          unit_amount: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          invoice_id: string;
          line_total: number;
          quantity?: number;
          school_id: string;
          sort_order?: number;
          tuition_fee_item_id?: string | null;
          unit_amount: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          invoice_id?: string;
          line_total?: number;
          quantity?: number;
          school_id?: string;
          sort_order?: number;
          tuition_fee_item_id?: string | null;
          unit_amount?: number;
        };
        Relationships: [];
      };
      invoice_adjustments: {
        Row: {
          adjustment_type: Database['public']['Enums']['invoice_adjustment_type'];
          amount: number;
          created_at: string;
          id: string;
          invoice_id: string;
          label: string;
          school_id: string;
        };
        Insert: {
          adjustment_type?: Database['public']['Enums']['invoice_adjustment_type'];
          amount: number;
          created_at?: string;
          id?: string;
          invoice_id: string;
          label: string;
          school_id: string;
        };
        Update: {
          adjustment_type?: Database['public']['Enums']['invoice_adjustment_type'];
          amount?: number;
          created_at?: string;
          id?: string;
          invoice_id?: string;
          label?: string;
          school_id?: string;
        };
        Relationships: [];
      };
      invoice_payments: {
        Row: {
          amount: number;
          created_at: string;
          created_by: string | null;
          id: string;
          invoice_id: string;
          paid_at: string;
          payment_method: Database['public']['Enums']['payment_method'];
          receipt_number: string;
          reference_note: string | null;
          school_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invoice_id: string;
          paid_at?: string;
          payment_method?: Database['public']['Enums']['payment_method'];
          receipt_number: string;
          reference_note?: string | null;
          school_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invoice_id?: string;
          paid_at?: string;
          payment_method?: Database['public']['Enums']['payment_method'];
          receipt_number?: string;
          reference_note?: string | null;
          school_id?: string;
        };
        Relationships: [];
      };
      payment_refunds: {
        Row: {
          amount: number;
          created_at: string;
          created_by: string | null;
          id: string;
          payment_id: string;
          reason: string | null;
          refunded_at: string;
          school_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          payment_id: string;
          reason?: string | null;
          refunded_at?: string;
          school_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          payment_id?: string;
          reason?: string | null;
          refunded_at?: string;
          school_id?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          attendance_date: string;
          check_in_at: string | null;
          check_out_at: string | null;
          class_id: string | null;
          created_at: string;
          id: string;
          is_late: boolean;
          late_minutes: number;
          notes: string | null;
          recorded_by: string | null;
          school_id: string;
          status: Database['public']['Enums']['attendance_status'];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          attendance_date: string;
          check_in_at?: string | null;
          check_out_at?: string | null;
          class_id?: string | null;
          created_at?: string;
          id?: string;
          is_late?: boolean;
          late_minutes?: number;
          notes?: string | null;
          recorded_by?: string | null;
          school_id: string;
          status?: Database['public']['Enums']['attendance_status'];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          attendance_date?: string;
          check_in_at?: string | null;
          check_out_at?: string | null;
          class_id?: string | null;
          created_at?: string;
          id?: string;
          is_late?: boolean;
          late_minutes?: number;
          notes?: string | null;
          recorded_by?: string | null;
          school_id?: string;
          status?: Database['public']['Enums']['attendance_status'];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leave_requests: {
        Row: {
          created_at: string;
          created_by: string | null;
          end_date: string;
          id: string;
          reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          school_id: string;
          start_date: string;
          status: Database['public']['Enums']['leave_request_status'];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          end_date: string;
          id?: string;
          reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id: string;
          start_date: string;
          status?: Database['public']['Enums']['leave_request_status'];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          end_date?: string;
          id?: string;
          reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id?: string;
          start_date?: string;
          status?: Database['public']['Enums']['leave_request_status'];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_departments: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          school_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          school_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          school_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_positions: {
        Row: {
          created_at: string;
          department_id: string | null;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          department_id?: string | null;
          description?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          department_id?: string | null;
          description?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_employees: {
        Row: {
          access_role: Database['public']['Enums']['staff_access_role'];
          address: string | null;
          campus_id: string | null;
          created_at: string;
          created_by: string | null;
          date_of_birth: string | null;
          deleted_at: string | null;
          department_id: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          employee_code: string;
          employment_status: Database['public']['Enums']['staff_employment_status'];
          full_name: string;
          gender: string | null;
          grant_system_access: boolean;
          hire_date: string | null;
          id: string;
          id_number: string | null;
          is_teacher: boolean;
          member_id: string | null;
          notes: string | null;
          phone: string | null;
          photo_url: string | null;
          position_id: string | null;
          school_id: string;
          termination_date: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          access_role?: Database['public']['Enums']['staff_access_role'];
          address?: string | null;
          campus_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          department_id?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          employee_code: string;
          employment_status?: Database['public']['Enums']['staff_employment_status'];
          full_name: string;
          gender?: string | null;
          grant_system_access?: boolean;
          hire_date?: string | null;
          id?: string;
          id_number?: string | null;
          is_teacher?: boolean;
          member_id?: string | null;
          notes?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          position_id?: string | null;
          school_id: string;
          termination_date?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          access_role?: Database['public']['Enums']['staff_access_role'];
          address?: string | null;
          campus_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          department_id?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          employee_code?: string;
          employment_status?: Database['public']['Enums']['staff_employment_status'];
          full_name?: string;
          gender?: string | null;
          grant_system_access?: boolean;
          hire_date?: string | null;
          id?: string;
          id_number?: string | null;
          is_teacher?: boolean;
          member_id?: string | null;
          notes?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          position_id?: string | null;
          school_id?: string;
          termination_date?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      staff_contracts: {
        Row: {
          contract_type: Database['public']['Enums']['staff_contract_type'];
          created_at: string;
          employee_id: string;
          end_date: string | null;
          id: string;
          is_active: boolean;
          notes: string | null;
          salary_amount: number;
          school_id: string;
          start_date: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          contract_type?: Database['public']['Enums']['staff_contract_type'];
          created_at?: string;
          employee_id: string;
          end_date?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          notes?: string | null;
          salary_amount?: number;
          school_id: string;
          start_date: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          contract_type?: Database['public']['Enums']['staff_contract_type'];
          created_at?: string;
          employee_id?: string;
          end_date?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          notes?: string | null;
          salary_amount?: number;
          school_id?: string;
          start_date?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      parent_student_links: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          is_primary: boolean;
          relationship: string;
          school_id: string;
          student_id: string;
          student_parent_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_primary?: boolean;
          relationship?: string;
          school_id: string;
          student_id: string;
          student_parent_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_primary?: boolean;
          relationship?: string;
          school_id?: string;
          student_id?: string;
          student_parent_id?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      student_daily_reports: {
        Row: {
          activities: string | null;
          created_at: string;
          created_by: string | null;
          daily_summary: string | null;
          health_observation: Json | null;
          id: string;
          learning_activities: Json;
          meal_records: Json;
          meals: string | null;
          medication_records: Json;
          mood: string | null;
          nap: string | null;
          parent_acknowledged_at: string | null;
          published_at: string | null;
          report_date: string;
          school_id: string;
          sleep_record: Json | null;
          status: Database['public']['Enums']['daily_report_status'];
          student_id: string;
          teacher_note: string | null;
          toilet_records: Json;
          updated_at: string;
        };
        Insert: {
          activities?: string | null;
          created_at?: string;
          created_by?: string | null;
          daily_summary?: string | null;
          health_observation?: Json | null;
          id?: string;
          learning_activities?: Json;
          meal_records?: Json;
          meals?: string | null;
          medication_records?: Json;
          mood?: string | null;
          nap?: string | null;
          parent_acknowledged_at?: string | null;
          published_at?: string | null;
          report_date?: string;
          school_id: string;
          sleep_record?: Json | null;
          status?: Database['public']['Enums']['daily_report_status'];
          student_id: string;
          teacher_note?: string | null;
          toilet_records?: Json;
          updated_at?: string;
        };
        Update: {
          activities?: string | null;
          created_at?: string;
          created_by?: string | null;
          daily_summary?: string | null;
          health_observation?: Json | null;
          id?: string;
          learning_activities?: Json;
          meal_records?: Json;
          meals?: string | null;
          medication_records?: Json;
          mood?: string | null;
          nap?: string | null;
          parent_acknowledged_at?: string | null;
          published_at?: string | null;
          report_date?: string;
          school_id?: string;
          sleep_record?: Json | null;
          status?: Database['public']['Enums']['daily_report_status'];
          student_id?: string;
          teacher_note?: string | null;
          toilet_records?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_report_timeline_entries: {
        Row: {
          content: string | null;
          created_at: string;
          created_by: string | null;
          entry_type: string;
          id: string;
          recorded_at: string;
          report_id: string;
          school_id: string;
          title: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          entry_type: string;
          id?: string;
          recorded_at?: string;
          report_id: string;
          school_id: string;
          title: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          entry_type?: string;
          id?: string;
          recorded_at?: string;
          report_id?: string;
          school_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      daily_report_attachments: {
        Row: {
          caption: string | null;
          created_at: string;
          created_by: string | null;
          file_name: string;
          file_size: number | null;
          id: string;
          media_type: string;
          mime_type: string | null;
          report_id: string;
          school_id: string;
          storage_path: string;
          thumbnail_path: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          created_by?: string | null;
          file_name: string;
          file_size?: number | null;
          id?: string;
          media_type?: string;
          mime_type?: string | null;
          report_id: string;
          school_id: string;
          storage_path: string;
          thumbnail_path?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          created_by?: string | null;
          file_name?: string;
          file_size?: number | null;
          id?: string;
          media_type?: string;
          mime_type?: string | null;
          report_id?: string;
          school_id?: string;
          storage_path?: string;
        };
        Relationships: [];
      };
      dishes: {
        Row: {
          allergen_tags: string[];
          created_at: string;
          description: string | null;
          id: string;
          ingredient_items: Json;
          is_active: boolean;
          meal_category_id: string | null;
          name: string;
          nutrition_info: Json;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          allergen_tags?: string[];
          created_at?: string;
          description?: string | null;
          id?: string;
          ingredient_items?: Json;
          is_active?: boolean;
          meal_category_id?: string | null;
          name: string;
          nutrition_info?: Json;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          allergen_tags?: string[];
          created_at?: string;
          description?: string | null;
          id?: string;
          ingredient_items?: Json;
          is_active?: boolean;
          meal_category_id?: string | null;
          name?: string;
          nutrition_info?: Json;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      health_growth_records: {
        Row: {
          bmi: number | null;
          created_at: string;
          height_cm: number | null;
          id: string;
          notes: string | null;
          record_date: string;
          recorded_by: string | null;
          school_id: string;
          student_id: string;
          weight_kg: number | null;
        };
        Insert: {
          bmi?: number | null;
          created_at?: string;
          height_cm?: number | null;
          id?: string;
          notes?: string | null;
          record_date: string;
          recorded_by?: string | null;
          school_id: string;
          student_id: string;
          weight_kg?: number | null;
        };
        Update: {
          bmi?: number | null;
          created_at?: string;
          height_cm?: number | null;
          id?: string;
          notes?: string | null;
          record_date?: string;
          recorded_by?: string | null;
          school_id?: string;
          student_id?: string;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      health_incidents: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          incident_date: string;
          incident_time: string | null;
          incident_type: Database['public']['Enums']['health_incident_type'];
          parent_notified_at: string | null;
          reported_by: string | null;
          school_id: string;
          severity: Database['public']['Enums']['health_incident_severity'];
          student_id: string;
          treatment: string | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          incident_date?: string;
          incident_time?: string | null;
          incident_type?: Database['public']['Enums']['health_incident_type'];
          parent_notified_at?: string | null;
          reported_by?: string | null;
          school_id: string;
          severity?: Database['public']['Enums']['health_incident_severity'];
          student_id: string;
          treatment?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          incident_date?: string;
          incident_time?: string | null;
          incident_type?: Database['public']['Enums']['health_incident_type'];
          parent_notified_at?: string | null;
          reported_by?: string | null;
          school_id?: string;
          severity?: Database['public']['Enums']['health_incident_severity'];
          student_id?: string;
          treatment?: string | null;
        };
        Relationships: [];
      };
      health_medical_checkups: {
        Row: {
          checkup_date: string;
          checkup_type: string;
          created_at: string;
          dental_result: string | null;
          doctor_name: string | null;
          hearing_result: string | null;
          height_cm: number | null;
          id: string;
          notes: string | null;
          school_id: string;
          student_id: string;
          vision_result: string | null;
          weight_kg: number | null;
        };
        Insert: {
          checkup_date: string;
          checkup_type?: string;
          created_at?: string;
          dental_result?: string | null;
          doctor_name?: string | null;
          hearing_result?: string | null;
          height_cm?: number | null;
          id?: string;
          notes?: string | null;
          school_id: string;
          student_id: string;
          vision_result?: string | null;
          weight_kg?: number | null;
        };
        Update: {
          checkup_date?: string;
          checkup_type?: string;
          created_at?: string;
          dental_result?: string | null;
          doctor_name?: string | null;
          hearing_result?: string | null;
          height_cm?: number | null;
          id?: string;
          notes?: string | null;
          school_id?: string;
          student_id?: string;
          vision_result?: string | null;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      health_medications: {
        Row: {
          created_at: string;
          dosage: string | null;
          end_date: string | null;
          frequency: string | null;
          id: string;
          instructions: string | null;
          is_active: boolean;
          name: string;
          school_id: string;
          start_date: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          dosage?: string | null;
          end_date?: string | null;
          frequency?: string | null;
          id?: string;
          instructions?: string | null;
          is_active?: boolean;
          name: string;
          school_id: string;
          start_date: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          dosage?: string | null;
          end_date?: string | null;
          frequency?: string | null;
          id?: string;
          instructions?: string | null;
          is_active?: boolean;
          name?: string;
          school_id?: string;
          start_date?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      health_vaccinations: {
        Row: {
          administered_on: string;
          created_at: string;
          dose_number: number;
          id: string;
          next_due_on: string | null;
          notes: string | null;
          provider: string | null;
          school_id: string;
          student_id: string;
          vaccine_name: string;
        };
        Insert: {
          administered_on: string;
          created_at?: string;
          dose_number?: number;
          id?: string;
          next_due_on?: string | null;
          notes?: string | null;
          provider?: string | null;
          school_id: string;
          student_id: string;
          vaccine_name: string;
        };
        Update: {
          administered_on?: string;
          created_at?: string;
          dose_number?: number;
          id?: string;
          next_due_on?: string | null;
          notes?: string | null;
          provider?: string | null;
          school_id?: string;
          student_id?: string;
          vaccine_name?: string;
        };
        Relationships: [];
      };
      ingredients: {
        Row: {
          allergen_tags: string[];
          created_at: string;
          id: string;
          inventory_product_id: string | null;
          is_active: boolean;
          name: string;
          notes: string | null;
          nutrition_info: Json;
          school_id: string;
          unit: string;
          updated_at: string;
        };
        Insert: {
          allergen_tags?: string[];
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          notes?: string | null;
          nutrition_info?: Json;
          school_id: string;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          allergen_tags?: string[];
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          notes?: string | null;
          nutrition_info?: Json;
          school_id?: string;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          parent_id: string | null;
          school_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          parent_id?: string | null;
          school_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          parent_id?: string | null;
          school_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      inventory_products: {
        Row: {
          category_id: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          min_quantity: number;
          name: string;
          notes: string | null;
          school_id: string;
          sku: string | null;
          supplier_id: string | null;
          track_expiry: boolean;
          unit: string;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          min_quantity?: number;
          name: string;
          notes?: string | null;
          school_id: string;
          sku?: string | null;
          supplier_id?: string | null;
          track_expiry?: boolean;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          min_quantity?: number;
          name?: string;
          notes?: string | null;
          school_id?: string;
          sku?: string | null;
          supplier_id?: string | null;
          track_expiry?: boolean;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_stock: {
        Row: {
          product_id: string;
          quantity: number;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          quantity?: number;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          quantity?: number;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_suppliers: {
        Row: {
          address: string | null;
          contact_name: string | null;
          created_at: string;
          email: string | null;
          id: string;
          is_active: boolean;
          name: string;
          notes: string | null;
          phone: string | null;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          contact_name?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          notes?: string | null;
          phone?: string | null;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          contact_name?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_transactions: {
        Row: {
          created_at: string;
          created_by: string | null;
          expiry_date: string | null;
          id: string;
          notes: string | null;
          product_id: string;
          quantity: number;
          reference_number: string | null;
          school_id: string;
          supplier_id: string | null;
          transaction_date: string;
          transaction_type: Database['public']['Enums']['inventory_transaction_type'];
          transfer_to_product_id: string | null;
          unit_cost: number | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expiry_date?: string | null;
          id?: string;
          notes?: string | null;
          product_id: string;
          quantity: number;
          reference_number?: string | null;
          school_id: string;
          supplier_id?: string | null;
          transaction_date?: string;
          transaction_type: Database['public']['Enums']['inventory_transaction_type'];
          transfer_to_product_id?: string | null;
          unit_cost?: number | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expiry_date?: string | null;
          id?: string;
          notes?: string | null;
          product_id?: string;
          quantity?: number;
          reference_number?: string | null;
          school_id?: string;
          supplier_id?: string | null;
          transaction_date?: string;
          transaction_type?: Database['public']['Enums']['inventory_transaction_type'];
          transfer_to_product_id?: string | null;
          unit_cost?: number | null;
        };
        Relationships: [];
      };
      meal_categories: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          school_id: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name: string;
          school_id: string;
          sort_order?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          inventory_product_id?: string | null;
          is_active?: boolean;
          name?: string;
          school_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          created_at: string;
          custom_dish_name: string | null;
          dish_id: string | null;
          id: string;
          meal_slot: Database['public']['Enums']['meal_slot'];
          menu_date: string;
          menu_id: string;
          portion_notes: string | null;
          school_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          custom_dish_name?: string | null;
          dish_id?: string | null;
          id?: string;
          meal_slot: Database['public']['Enums']['meal_slot'];
          menu_date: string;
          menu_id: string;
          portion_notes?: string | null;
          school_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          custom_dish_name?: string | null;
          dish_id?: string | null;
          id?: string;
          meal_slot?: Database['public']['Enums']['meal_slot'];
          menu_date?: string;
          menu_id?: string;
          portion_notes?: string | null;
          school_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      menus: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          notes: string | null;
          period_type: Database['public']['Enums']['menu_period_type'];
          published_at: string | null;
          published_by: string | null;
          school_id: string;
          start_date: string;
          status: Database['public']['Enums']['menu_status'];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          notes?: string | null;
          period_type?: Database['public']['Enums']['menu_period_type'];
          published_at?: string | null;
          published_by?: string | null;
          school_id: string;
          start_date: string;
          status?: Database['public']['Enums']['menu_status'];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          notes?: string | null;
          period_type?: Database['public']['Enums']['menu_period_type'];
          published_at?: string | null;
          published_by?: string | null;
          school_id?: string;
          start_date?: string;
          status?: Database['public']['Enums']['menu_status'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          items: Json;
          name: string;
          period_type: Database['public']['Enums']['menu_period_type'];
          school_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          items?: Json;
          name: string;
          period_type?: Database['public']['Enums']['menu_period_type'];
          school_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          items?: Json;
          name?: string;
          period_type?: Database['public']['Enums']['menu_period_type'];
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          created_at: string;
          created_by: string | null;
          expected_date: string | null;
          id: string;
          notes: string | null;
          order_date: string;
          po_number: string;
          received_at: string | null;
          school_id: string;
          status: Database['public']['Enums']['purchase_order_status'];
          supplier_id: string | null;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expected_date?: string | null;
          id?: string;
          notes?: string | null;
          order_date?: string;
          po_number: string;
          received_at?: string | null;
          school_id: string;
          status?: Database['public']['Enums']['purchase_order_status'];
          supplier_id?: string | null;
          total_amount?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expected_date?: string | null;
          id?: string;
          notes?: string | null;
          order_date?: string;
          po_number?: string;
          received_at?: string | null;
          school_id?: string;
          status?: Database['public']['Enums']['purchase_order_status'];
          supplier_id?: string | null;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_order_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          purchase_order_id: string;
          quantity: number;
          received_quantity: number;
          school_id: string;
          unit_cost: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          purchase_order_id: string;
          quantity: number;
          received_quantity?: number;
          school_id: string;
          unit_cost?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          purchase_order_id?: string;
          quantity?: number;
          received_quantity?: number;
          school_id?: string;
          unit_cost?: number;
        };
        Relationships: [];
      };
      stock_count_items: {
        Row: {
          counted_quantity: number | null;
          created_at: string;
          expected_quantity: number;
          id: string;
          product_id: string;
          school_id: string;
          stock_count_id: string;
        };
        Insert: {
          counted_quantity?: number | null;
          created_at?: string;
          expected_quantity?: number;
          id?: string;
          product_id: string;
          school_id: string;
          stock_count_id: string;
        };
        Update: {
          counted_quantity?: number | null;
          created_at?: string;
          expected_quantity?: number;
          id?: string;
          product_id?: string;
          school_id?: string;
          stock_count_id?: string;
        };
        Relationships: [];
      };
      stock_counts: {
        Row: {
          completed_at: string | null;
          count_date: string;
          created_at: string;
          created_by: string | null;
          id: string;
          notes: string | null;
          school_id: string;
          status: Database['public']['Enums']['stock_count_status'];
          title: string;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          count_date?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          notes?: string | null;
          school_id: string;
          status?: Database['public']['Enums']['stock_count_status'];
          title: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          count_date?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          notes?: string | null;
          school_id?: string;
          status?: Database['public']['Enums']['stock_count_status'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_class_assignments: {
        Row: {
          assigned_at: string;
          assignment_role: string;
          class_id: string;
          created_at: string;
          employee_id: string;
          id: string;
          school_id: string;
        };
        Insert: {
          assigned_at?: string;
          assignment_role?: string;
          class_id: string;
          created_at?: string;
          employee_id: string;
          id?: string;
          school_id: string;
        };
        Update: {
          assigned_at?: string;
          assignment_role?: string;
          class_id?: string;
          created_at?: string;
          employee_id?: string;
          id?: string;
          school_id?: string;
        };
        Relationships: [];
      };
      user_notifications: {
        Row: {
          body: string | null;
          category: Database['public']['Enums']['notification_category'];
          created_at: string;
          id: string;
          link_url: string | null;
          read_at: string | null;
          reference_id: string | null;
          reference_type: string | null;
          school_id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          category?: Database['public']['Enums']['notification_category'];
          created_at?: string;
          id?: string;
          link_url?: string | null;
          read_at?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          school_id: string;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          category?: Database['public']['Enums']['notification_category'];
          created_at?: string;
          id?: string;
          link_url?: string | null;
          read_at?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          school_id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_auth_user_parent_student_ids: { Args: never; Returns: string[] };
      get_auth_user_school_ids: { Args: never; Returns: string[] };
      user_has_school_role: {
        Args: {
          allowed_roles: Database['public']['Enums']['school_member_role'][];
          target_school_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      campus_type: 'campus' | 'branch';
      daily_report_status: 'draft' | 'published';
      attendance_status:
        | 'present'
        | 'absent'
        | 'late'
        | 'excused'
        | 'early_leave';
      ai_action_type:
        | 'chat'
        | 'daily_comment'
        | 'report'
        | 'notification_draft'
        | 'enrollment_forecast'
        | 'revenue_forecast';
      ai_message_role: 'user' | 'assistant' | 'system';
      staff_access_role: 'staff' | 'admin' | 'accountant';
      staff_contract_type:
        | 'full_time'
        | 'part_time'
        | 'contract'
        | 'probation';
      staff_employment_status:
        | 'active'
        | 'inactive'
        | 'on_leave'
        | 'terminated';
      class_status: 'active' | 'archived';
      health_incident_severity: 'minor' | 'moderate' | 'serious';
      health_incident_type:
        | 'injury'
        | 'illness'
        | 'allergy_reaction'
        | 'fall'
        | 'other';
      invoice_adjustment_type: 'discount' | 'scholarship';
      invoice_status:
        | 'draft'
        | 'issued'
        | 'partial'
        | 'paid'
        | 'overdue'
        | 'cancelled';
      inventory_transaction_type:
        | 'receipt'
        | 'issue'
        | 'adjustment'
        | 'transfer';
      leave_request_status: 'pending' | 'approved' | 'rejected';
      lead_activity_type:
        | 'created'
        | 'stage_changed'
        | 'assigned'
        | 'note'
        | 'contact'
        | 'appointment'
        | 'visit'
        | 'deposit'
        | 'enrollment';
      lead_stage:
        | 'new'
        | 'contacted'
        | 'appointment'
        | 'visited'
        | 'deposit'
        | 'enrolled'
        | 'lost';
      lead_status: 'active' | 'won' | 'lost';
      meal_slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
      menu_period_type: 'daily' | 'weekly' | 'monthly';
      menu_status: 'draft' | 'published';
      notification_category: 'daily_report' | 'menu' | 'inventory' | 'system';
      school_member_role:
        | 'owner'
        | 'admin'
        | 'staff'
        | 'teacher'
        | 'accountant'
        | 'parent';
      payment_method: 'cash' | 'bank_transfer' | 'card' | 'other';
      purchase_order_status:
        | 'draft'
        | 'submitted'
        | 'received'
        | 'cancelled';
      stock_count_status: 'draft' | 'completed' | 'cancelled';
      school_status: 'active' | 'suspended' | 'archived';
      subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled';
      student_gender: 'male' | 'female' | 'other';
      student_status:
        | 'active'
        | 'inactive'
        | 'graduated'
        | 'transferred'
        | 'withdrawn';
      student_timeline_event:
        | 'created'
        | 'updated'
        | 'status_changed'
        | 'class_transfer'
        | 'graduated'
        | 'note'
        | 'parent_added'
        | 'medical_updated';
      tuition_billing_cycle:
        | 'monthly'
        | 'quarterly'
        | 'semester'
        | 'yearly'
        | 'one_time';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      campus_type: ['campus', 'branch'],
      daily_report_status: ['draft', 'published'],
      attendance_status: [
        'present',
        'absent',
        'late',
        'excused',
        'early_leave',
      ],
      ai_action_type: [
        'chat',
        'daily_comment',
        'report',
        'notification_draft',
        'enrollment_forecast',
        'revenue_forecast',
      ],
      ai_message_role: ['user', 'assistant', 'system'],
      staff_access_role: ['staff', 'admin', 'accountant'],
      staff_contract_type: [
        'full_time',
        'part_time',
        'contract',
        'probation',
      ],
      staff_employment_status: [
        'active',
        'inactive',
        'on_leave',
        'terminated',
      ],
      class_status: ['active', 'archived'],
      health_incident_severity: ['minor', 'moderate', 'serious'],
      health_incident_type: [
        'injury',
        'illness',
        'allergy_reaction',
        'fall',
        'other',
      ],
      invoice_adjustment_type: ['discount', 'scholarship'],
      invoice_status: [
        'draft',
        'issued',
        'partial',
        'paid',
        'overdue',
        'cancelled',
      ],
      inventory_transaction_type: [
        'receipt',
        'issue',
        'adjustment',
        'transfer',
      ],
      leave_request_status: ['pending', 'approved', 'rejected'],
      lead_activity_type: [
        'created',
        'stage_changed',
        'assigned',
        'note',
        'contact',
        'appointment',
        'visit',
        'deposit',
        'enrollment',
      ],
      lead_stage: [
        'new',
        'contacted',
        'appointment',
        'visited',
        'deposit',
        'enrolled',
        'lost',
      ],
      lead_status: ['active', 'won', 'lost'],
      meal_slot: ['breakfast', 'lunch', 'snack', 'dinner'],
      menu_period_type: ['daily', 'weekly', 'monthly'],
      menu_status: ['draft', 'published'],
      notification_category: ['daily_report', 'menu', 'inventory', 'system'],
      school_member_role: [
        'owner',
        'admin',
        'staff',
        'teacher',
        'accountant',
        'parent',
      ],
      payment_method: ['cash', 'bank_transfer', 'card', 'other'],
      purchase_order_status: [
        'draft',
        'submitted',
        'received',
        'cancelled',
      ],
      stock_count_status: ['draft', 'completed', 'cancelled'],
      school_status: ['active', 'suspended', 'archived'],
      subscription_status: ['trial', 'active', 'past_due', 'cancelled'],
      student_gender: ['male', 'female', 'other'],
      student_status: [
        'active',
        'inactive',
        'graduated',
        'transferred',
        'withdrawn',
      ],
      student_timeline_event: [
        'created',
        'updated',
        'status_changed',
        'class_transfer',
        'graduated',
        'note',
        'parent_added',
        'medical_updated',
      ],
      tuition_billing_cycle: [
        'monthly',
        'quarterly',
        'semester',
        'yearly',
        'one_time',
      ],
    },
  },
  storage: {
    Enums: {},
  },
} as const;
