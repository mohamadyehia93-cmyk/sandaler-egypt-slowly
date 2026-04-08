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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          accommodation_type: string | null
          amenities: string[] | null
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          host_id: string | null
          host_image: string | null
          host_name_ar: string | null
          host_name_en: string | null
          id: string
          image: string | null
          images: string[] | null
          name_ar: string
          name_en: string
          price_per_night: number
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          slug: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          accommodation_type?: string | null
          amenities?: string[] | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          host_id?: string | null
          host_image?: string | null
          host_name_ar?: string | null
          host_name_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          name_ar: string
          name_en: string
          price_per_night?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_type?: string | null
          amenities?: string[] | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          host_id?: string | null
          host_image?: string | null
          host_name_ar?: string | null
          host_name_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          name_ar?: string
          name_en?: string
          price_per_night?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_tours: {
        Row: {
          city_id: string | null
          created_at: string
          creator_id: string | null
          description_ar: string | null
          description_en: string | null
          duration_minutes: number
          id: string
          image: string | null
          languages: string[] | null
          narrator_image: string | null
          narrator_name_ar: string | null
          narrator_name_en: string | null
          price: number
          region_id: string | null
          slug: string | null
          status: string | null
          stops_count: number
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          creator_id?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_minutes?: number
          id?: string
          image?: string | null
          languages?: string[] | null
          narrator_image?: string | null
          narrator_name_ar?: string | null
          narrator_name_en?: string | null
          price?: number
          region_id?: string | null
          slug?: string | null
          status?: string | null
          stops_count?: number
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          creator_id?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_minutes?: number
          id?: string
          image?: string | null
          languages?: string[] | null
          narrator_image?: string | null
          narrator_name_ar?: string | null
          narrator_name_en?: string | null
          price?: number
          region_id?: string | null
          slug?: string | null
          status?: string | null
          stops_count?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_tours_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_tours_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_tours_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          best_time_ar: string | null
          best_time_en: string | null
          created_at: string
          culture_ar: string | null
          culture_en: string | null
          geography_ar: string | null
          geography_en: string | null
          governorate_ar: string | null
          governorate_en: string | null
          highlights_ar: string[] | null
          highlights_en: string[] | null
          history_ar: string | null
          history_en: string | null
          id: string
          image: string | null
          known_for_ar: string[] | null
          known_for_en: string[] | null
          name_ar: string
          name_en: string
          overview_ar: string | null
          overview_en: string | null
          population: string | null
          region_id: string
        }
        Insert: {
          best_time_ar?: string | null
          best_time_en?: string | null
          created_at?: string
          culture_ar?: string | null
          culture_en?: string | null
          geography_ar?: string | null
          geography_en?: string | null
          governorate_ar?: string | null
          governorate_en?: string | null
          highlights_ar?: string[] | null
          highlights_en?: string[] | null
          history_ar?: string | null
          history_en?: string | null
          id: string
          image?: string | null
          known_for_ar?: string[] | null
          known_for_en?: string[] | null
          name_ar: string
          name_en: string
          overview_ar?: string | null
          overview_en?: string | null
          population?: string | null
          region_id: string
        }
        Update: {
          best_time_ar?: string | null
          best_time_en?: string | null
          created_at?: string
          culture_ar?: string | null
          culture_en?: string | null
          geography_ar?: string | null
          geography_en?: string | null
          governorate_ar?: string | null
          governorate_en?: string | null
          highlights_ar?: string[] | null
          highlights_en?: string[] | null
          history_ar?: string | null
          history_en?: string | null
          id?: string
          image?: string | null
          known_for_ar?: string[] | null
          known_for_en?: string[] | null
          name_ar?: string
          name_en?: string
          overview_ar?: string | null
          overview_en?: string | null
          population?: string | null
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_text: string | null
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: []
      }
      experience_reviews: {
        Row: {
          created_at: string
          experience_id: string
          id: string
          rating: number
          review_text: string | null
          reviewer_avatar_bg: string | null
          reviewer_city: string | null
          reviewer_initials: string
          reviewer_name: string
          updated_at: string
          user_id: string | null
          verified_attendee: boolean | null
        }
        Insert: {
          created_at?: string
          experience_id: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_avatar_bg?: string | null
          reviewer_city?: string | null
          reviewer_initials?: string
          reviewer_name: string
          updated_at?: string
          user_id?: string | null
          verified_attendee?: boolean | null
        }
        Update: {
          created_at?: string
          experience_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_avatar_bg?: string | null
          reviewer_city?: string | null
          reviewer_initials?: string
          reviewer_name?: string
          updated_at?: string
          user_id?: string | null
          verified_attendee?: boolean | null
        }
        Relationships: []
      }
      experience_slots: {
        Row: {
          created_at: string
          end_time: string
          experience_id: string
          id: string
          is_discounted: boolean | null
          price: number
          slot_date: string
          spots_available: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          experience_id: string
          id?: string
          is_discounted?: boolean | null
          price?: number
          slot_date: string
          spots_available?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          experience_id?: string
          id?: string
          is_discounted?: boolean | null
          price?: number
          slot_date?: string
          spots_available?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          capacity_max: number | null
          capacity_min: number | null
          city_id: string | null
          created_at: string
          date: string | null
          description_ar: string | null
          description_en: string | null
          duration_minutes: number | null
          host_image: string | null
          host_name_ar: string | null
          host_name_en: string | null
          id: string
          image: string | null
          images: string[] | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          meeting_point_name: string | null
          price: number
          provider_id: string | null
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          slug: string | null
          status: string | null
          theme: string | null
          title_ar: string
          title_en: string
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          capacity_max?: number | null
          capacity_min?: number | null
          city_id?: string | null
          created_at?: string
          date?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_minutes?: number | null
          host_image?: string | null
          host_name_ar?: string | null
          host_name_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_name?: string | null
          price?: number
          provider_id?: string | null
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          theme?: string | null
          title_ar: string
          title_en: string
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          capacity_max?: number | null
          capacity_min?: number | null
          city_id?: string | null
          created_at?: string
          date?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_minutes?: number | null
          host_image?: string | null
          host_name_ar?: string | null
          host_name_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_name?: string | null
          price?: number
          provider_id?: string | null
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          theme?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_meta: Json | null
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          sender_id: string
          text: string
        }
        Insert: {
          booking_meta?: Json | null
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id: string
          text: string
        }
        Update: {
          booking_meta?: Json | null
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          donations_total: number | null
          id: string
          image: string | null
          location_ar: string | null
          location_en: string | null
          logo: string | null
          mission_ar: string | null
          mission_en: string | null
          name_ar: string
          name_en: string
          org_type: string | null
          owner_id: string | null
          programs: Json | null
          region_id: string | null
          slug: string | null
          status: string | null
          updated_at: string
          volunteers_count: number | null
          website: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          donations_total?: number | null
          id?: string
          image?: string | null
          location_ar?: string | null
          location_en?: string | null
          logo?: string | null
          mission_ar?: string | null
          mission_en?: string | null
          name_ar: string
          name_en: string
          org_type?: string | null
          owner_id?: string | null
          programs?: Json | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string
          volunteers_count?: number | null
          website?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          donations_total?: number | null
          id?: string
          image?: string | null
          location_ar?: string | null
          location_en?: string | null
          logo?: string | null
          mission_ar?: string | null
          mission_en?: string | null
          name_ar?: string
          name_en?: string
          org_type?: string | null
          owner_id?: string | null
          programs?: Json | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string
          volunteers_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          author_image: string | null
          author_name_ar: string | null
          author_name_en: string | null
          author_role: string | null
          body_ar: string | null
          body_en: string | null
          category: string | null
          city_id: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_en: string | null
          id: string
          image: string | null
          images: string[] | null
          read_time_minutes: number | null
          region_id: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_image?: string | null
          author_name_ar?: string | null
          author_name_en?: string | null
          author_role?: string | null
          body_ar?: string | null
          body_en?: string | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          read_time_minutes?: number | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_image?: string | null
          author_name_ar?: string | null
          author_name_en?: string | null
          author_role?: string | null
          body_ar?: string | null
          body_en?: string | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          read_time_minutes?: number | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badges: string[] | null
          category: string | null
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image: string | null
          images: string[] | null
          name_ar: string
          name_en: string
          origin_story_ar: string | null
          origin_story_en: string | null
          price: number
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          seller_id: string | null
          seller_image: string | null
          seller_name_ar: string | null
          seller_name_en: string | null
          seller_village_ar: string | null
          seller_village_en: string | null
          slug: string | null
          status: string | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          badges?: string[] | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          name_ar: string
          name_en: string
          origin_story_ar?: string | null
          origin_story_en?: string | null
          price?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          seller_id?: string | null
          seller_image?: string | null
          seller_name_ar?: string | null
          seller_name_en?: string | null
          seller_village_ar?: string | null
          seller_village_en?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          badges?: string[] | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          name_ar?: string
          name_en?: string
          origin_story_ar?: string | null
          origin_story_en?: string | null
          price?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          seller_id?: string | null
          seller_image?: string | null
          seller_name_ar?: string | null
          seller_name_en?: string | null
          seller_village_ar?: string | null
          seller_village_en?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          avatar: string | null
          bio_ar: string | null
          bio_en: string | null
          city_ar: string | null
          city_en: string | null
          cover_image: string | null
          created_at: string
          followers: number | null
          id: string
          languages: string | null
          name_ar: string
          name_en: string
          rating: number | null
          region_ar: string | null
          region_en: string | null
          review_count: number | null
          role: string
          slug: string | null
          specialties: Json | null
          status: string | null
          tagline_ar: string | null
          tagline_en: string | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
          years_active: number | null
        }
        Insert: {
          avatar?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          city_ar?: string | null
          city_en?: string | null
          cover_image?: string | null
          created_at?: string
          followers?: number | null
          id?: string
          languages?: string | null
          name_ar: string
          name_en: string
          rating?: number | null
          region_ar?: string | null
          region_en?: string | null
          review_count?: number | null
          role?: string
          slug?: string | null
          specialties?: Json | null
          status?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          years_active?: number | null
        }
        Update: {
          avatar?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          city_ar?: string | null
          city_en?: string | null
          cover_image?: string | null
          created_at?: string
          followers?: number | null
          id?: string
          languages?: string | null
          name_ar?: string
          name_en?: string
          rating?: number | null
          region_ar?: string | null
          region_en?: string | null
          review_count?: number | null
          role?: string
          slug?: string | null
          specialties?: Json | null
          status?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          years_active?: number | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          about_ar: string | null
          about_en: string | null
          color: string | null
          created_at: string
          emoji: string | null
          id: string
          image: string | null
          name_ar: string
          name_en: string
        }
        Insert: {
          about_ar?: string | null
          about_en?: string | null
          color?: string | null
          created_at?: string
          emoji?: string | null
          id: string
          image?: string | null
          name_ar: string
          name_en: string
        }
        Update: {
          about_ar?: string | null
          about_en?: string | null
          color?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          image?: string | null
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      saved_itineraries: {
        Row: {
          created_at: string
          destination: string | null
          duration_days: number | null
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          duration_days?: number | null
          id?: string
          messages?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          duration_days?: number | null
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transport: {
        Row: {
          capacity: number | null
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          duration: string | null
          frequency: string | null
          from_ar: string | null
          from_en: string | null
          id: string
          image: string | null
          name_ar: string
          name_en: string
          price: number
          provider_id: string | null
          provider_image: string | null
          provider_name_ar: string | null
          provider_name_en: string | null
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          slug: string | null
          status: string | null
          to_ar: string | null
          to_en: string | null
          transport_type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          duration?: string | null
          frequency?: string | null
          from_ar?: string | null
          from_en?: string | null
          id?: string
          image?: string | null
          name_ar: string
          name_en: string
          price?: number
          provider_id?: string | null
          provider_image?: string | null
          provider_name_ar?: string | null
          provider_name_en?: string | null
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          to_ar?: string | null
          to_en?: string | null
          transport_type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          duration?: string | null
          frequency?: string | null
          from_ar?: string | null
          from_en?: string | null
          id?: string
          image?: string | null
          name_ar?: string
          name_en?: string
          price?: number
          provider_id?: string | null
          provider_image?: string | null
          provider_name_ar?: string | null
          provider_name_en?: string | null
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          to_ar?: string | null
          to_en?: string | null
          transport_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          access_type: string | null
          capacity_max: number | null
          capacity_min: number | null
          city_id: string | null
          created_at: string
          date: string | null
          description_ar: string | null
          description_en: string | null
          duration_days: number | null
          exclusions_ar: string[] | null
          exclusions_en: string[] | null
          id: string
          image: string | null
          images: string[] | null
          inclusions_ar: string[] | null
          inclusions_en: string[] | null
          organizer_id: string | null
          organizer_image: string | null
          organizer_name_ar: string | null
          organizer_name_en: string | null
          price: number
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          route_ar: string | null
          route_en: string | null
          slug: string | null
          status: string | null
          title_ar: string
          title_en: string
          trip_type: string | null
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          city_id?: string | null
          created_at?: string
          date?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_days?: number | null
          exclusions_ar?: string[] | null
          exclusions_en?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inclusions_ar?: string[] | null
          inclusions_en?: string[] | null
          organizer_id?: string | null
          organizer_image?: string | null
          organizer_name_ar?: string | null
          organizer_name_en?: string | null
          price?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          route_ar?: string | null
          route_en?: string | null
          slug?: string | null
          status?: string | null
          title_ar: string
          title_en: string
          trip_type?: string | null
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          city_id?: string | null
          created_at?: string
          date?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_days?: number | null
          exclusions_ar?: string[] | null
          exclusions_en?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inclusions_ar?: string[] | null
          inclusions_en?: string[] | null
          organizer_id?: string | null
          organizer_image?: string | null
          organizer_name_ar?: string | null
          organizer_name_en?: string | null
          price?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          route_ar?: string | null
          route_en?: string | null
          slug?: string | null
          status?: string | null
          title_ar?: string
          title_en?: string
          trip_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
