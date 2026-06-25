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
          latitude: number | null
          longitude: number | null
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
          latitude?: number | null
          longitude?: number | null
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
          latitude?: number | null
          longitude?: number | null
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
          latitude: number | null
          longitude: number | null
          narrator_culture_actor_id: string | null
          narrator_image: string | null
          narrator_name_ar: string | null
          narrator_name_en: string | null
          price: number
          region_id: string | null
          slug: string | null
          status: string | null
          stops: Json | null
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
          latitude?: number | null
          longitude?: number | null
          narrator_culture_actor_id?: string | null
          narrator_image?: string | null
          narrator_name_ar?: string | null
          narrator_name_en?: string | null
          price?: number
          region_id?: string | null
          slug?: string | null
          status?: string | null
          stops?: Json | null
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
          latitude?: number | null
          longitude?: number | null
          narrator_culture_actor_id?: string | null
          narrator_image?: string | null
          narrator_name_ar?: string | null
          narrator_name_en?: string | null
          price?: number
          region_id?: string | null
          slug?: string | null
          status?: string | null
          stops?: Json | null
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
            foreignKeyName: "audio_tours_narrator_culture_actor_id_fkey"
            columns: ["narrator_culture_actor_id"]
            isOneToOne: false
            referencedRelation: "culture_actors"
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
      bookings: {
        Row: {
          created_at: string
          experience_id: string
          guests: number
          id: string
          paid_at: string | null
          platform_fee_egp: number
          provider_amount_egp: number
          provider_id: string | null
          refunded_at: string | null
          slot_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount_egp: number
          updated_at: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          guests: number
          id?: string
          paid_at?: string | null
          platform_fee_egp: number
          provider_amount_egp: number
          provider_id?: string | null
          refunded_at?: string | null
          slot_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount_egp: number
          updated_at?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          guests?: number
          id?: string
          paid_at?: string | null
          platform_fee_egp?: number
          provider_amount_egp?: number
          provider_id?: string | null
          refunded_at?: string | null
          slot_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount_egp?: number
          updated_at?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "experience_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      causes: {
        Row: {
          category_ar: string | null
          category_en: string | null
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          goal: number | null
          id: string
          image: string | null
          latitude: number | null
          longitude: number | null
          org_founded: string | null
          org_logo: string | null
          org_members: number | null
          org_name_ar: string | null
          org_name_en: string | null
          owner_id: string | null
          raised: number | null
          region_id: string | null
          slug: string | null
          status: string | null
          summary_ar: string | null
          summary_en: string | null
          supporters: number | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category_ar?: string | null
          category_en?: string | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          goal?: number | null
          id?: string
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          org_founded?: string | null
          org_logo?: string | null
          org_members?: number | null
          org_name_ar?: string | null
          org_name_en?: string | null
          owner_id?: string | null
          raised?: number | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          supporters?: number | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category_ar?: string | null
          category_en?: string | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          goal?: number | null
          id?: string
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          org_founded?: string | null
          org_logo?: string | null
          org_members?: number | null
          org_name_ar?: string | null
          org_name_en?: string | null
          owner_id?: string | null
          raised?: number | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          supporters?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
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
      culture_actors: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          expertise_ar: string[] | null
          expertise_en: string[] | null
          id: string
          image: string | null
          name_ar: string
          name_en: string
          quote_ar: string | null
          quote_en: string | null
          region_id: string | null
          slug: string | null
          social_links: Json | null
          status: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          expertise_ar?: string[] | null
          expertise_en?: string[] | null
          id?: string
          image?: string | null
          name_ar: string
          name_en: string
          quote_ar?: string | null
          quote_en?: string | null
          region_id?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          expertise_ar?: string[] | null
          expertise_en?: string[] | null
          id?: string
          image?: string | null
          name_ar?: string
          name_en?: string
          quote_ar?: string | null
          quote_en?: string | null
          region_id?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          category: string | null
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          end_date: string | null
          event_time: string | null
          id: string
          image: string | null
          is_free: boolean
          location_ar: string | null
          location_en: string | null
          organizer_id: string | null
          price: number | null
          region_id: string | null
          slug: string | null
          start_date: string
          status: string
          ticket_url: string | null
          title_ar: string
          title_en: string
          updated_at: string
          venue_ar: string | null
          venue_en: string | null
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          end_date?: string | null
          event_time?: string | null
          id?: string
          image?: string | null
          is_free?: boolean
          location_ar?: string | null
          location_en?: string | null
          organizer_id?: string | null
          price?: number | null
          region_id?: string | null
          slug?: string | null
          start_date: string
          status?: string
          ticket_url?: string | null
          title_ar: string
          title_en: string
          updated_at?: string
          venue_ar?: string | null
          venue_en?: string | null
        }
        Update: {
          capacity?: number | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          end_date?: string | null
          event_time?: string | null
          id?: string
          image?: string | null
          is_free?: boolean
          location_ar?: string | null
          location_en?: string | null
          organizer_id?: string | null
          price?: number | null
          region_id?: string | null
          slug?: string | null
          start_date?: string
          status?: string
          ticket_url?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
          venue_ar?: string | null
          venue_en?: string | null
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
      follows: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          id: string
          image: string | null
          image_alts: string[]
          link: string | null
          position: number
          status: string | null
          subtitle_ar: string | null
          subtitle_en: string | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          image_alts?: string[]
          link?: string | null
          position?: number
          status?: string | null
          subtitle_ar?: string | null
          subtitle_en?: string | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          image_alts?: string[]
          link?: string | null
          position?: number
          status?: string | null
          subtitle_ar?: string | null
          subtitle_en?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      meetups: {
        Row: {
          attendees_count: number | null
          capacity: number | null
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image: string | null
          location_ar: string | null
          location_en: string | null
          meetup_date: string | null
          meetup_time: string | null
          organizer_id: string | null
          region_id: string | null
          slug: string | null
          status: string | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          attendees_count?: number | null
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image?: string | null
          location_ar?: string | null
          location_en?: string | null
          meetup_date?: string | null
          meetup_time?: string | null
          organizer_id?: string | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          attendees_count?: number | null
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image?: string | null
          location_ar?: string | null
          location_en?: string | null
          meetup_date?: string | null
          meetup_time?: string | null
          organizer_id?: string | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
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
      partners: {
        Row: {
          about_ar: string | null
          about_en: string | null
          color: string | null
          contributions_ar: string[] | null
          contributions_en: string[] | null
          created_at: string
          focus_areas_ar: string[] | null
          focus_areas_en: string[] | null
          id: string
          impact_label_ar: string | null
          impact_label_en: string | null
          impact_number: string | null
          location_ar: string | null
          location_en: string | null
          logo: string | null
          mission_ar: string | null
          mission_en: string | null
          name_ar: string
          name_en: string
          projects: number | null
          since: number | null
          slug: string | null
          status: string | null
          type_ar: string | null
          type_en: string | null
          updated_at: string
        }
        Insert: {
          about_ar?: string | null
          about_en?: string | null
          color?: string | null
          contributions_ar?: string[] | null
          contributions_en?: string[] | null
          created_at?: string
          focus_areas_ar?: string[] | null
          focus_areas_en?: string[] | null
          id?: string
          impact_label_ar?: string | null
          impact_label_en?: string | null
          impact_number?: string | null
          location_ar?: string | null
          location_en?: string | null
          logo?: string | null
          mission_ar?: string | null
          mission_en?: string | null
          name_ar: string
          name_en: string
          projects?: number | null
          since?: number | null
          slug?: string | null
          status?: string | null
          type_ar?: string | null
          type_en?: string | null
          updated_at?: string
        }
        Update: {
          about_ar?: string | null
          about_en?: string | null
          color?: string | null
          contributions_ar?: string[] | null
          contributions_en?: string[] | null
          created_at?: string
          focus_areas_ar?: string[] | null
          focus_areas_en?: string[] | null
          id?: string
          impact_label_ar?: string | null
          impact_label_en?: string | null
          impact_number?: string | null
          location_ar?: string | null
          location_en?: string | null
          logo?: string | null
          mission_ar?: string | null
          mission_en?: string | null
          name_ar?: string
          name_en?: string
          projects?: number | null
          since?: number | null
          slug?: string | null
          status?: string | null
          type_ar?: string | null
          type_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_avatar: string | null
          author_name: string
          created_at: string
          id: string
          parent_id: string | null
          post_key: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_key: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_key?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
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
          content_type: string | null
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
          content_type?: string | null
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
          content_type?: string | null
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
          latitude: number | null
          longitude: number | null
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
          latitude?: number | null
          longitude?: number | null
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
          latitude?: number | null
          longitude?: number | null
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
      provider_statuses: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          link_url: string | null
          sample_id: string | null
          status_date: string
          text: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          sample_id?: string | null
          status_date?: string
          text: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          sample_id?: string | null
          status_date?: string
          text?: string
          updated_at?: string
          user_id?: string | null
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
          governorates: string[] | null
          id: string
          image: string | null
          is_active: boolean | null
          name_ar: string
          name_en: string
          season_highlights_ar: string | null
          season_highlights_en: string | null
          sort_order: number | null
          tagline_ar: string | null
          tagline_en: string | null
        }
        Insert: {
          about_ar?: string | null
          about_en?: string | null
          color?: string | null
          created_at?: string
          emoji?: string | null
          governorates?: string[] | null
          id: string
          image?: string | null
          is_active?: boolean | null
          name_ar: string
          name_en: string
          season_highlights_ar?: string | null
          season_highlights_en?: string | null
          sort_order?: number | null
          tagline_ar?: string | null
          tagline_en?: string | null
        }
        Update: {
          about_ar?: string | null
          about_en?: string | null
          color?: string | null
          created_at?: string
          emoji?: string | null
          governorates?: string[] | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          season_highlights_ar?: string | null
          season_highlights_en?: string | null
          sort_order?: number | null
          tagline_ar?: string | null
          tagline_en?: string | null
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
          itinerary_ar: Json | null
          itinerary_en: Json | null
          latitude: number | null
          longitude: number | null
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
          theme: string | null
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
          itinerary_ar?: Json | null
          itinerary_en?: Json | null
          latitude?: number | null
          longitude?: number | null
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
          theme?: string | null
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
          itinerary_ar?: Json | null
          itinerary_en?: Json | null
          latitude?: number | null
          longitude?: number | null
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
          theme?: string | null
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
      whos_who: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          city_id: string | null
          created_at: string
          favorite_places_ar: string[] | null
          favorite_places_en: string[] | null
          id: string
          image: string | null
          interests_ar: string[] | null
          interests_en: string[] | null
          languages_ar: string[] | null
          languages_en: string[] | null
          latitude: number | null
          longitude: number | null
          meeting_times_ar: string | null
          meeting_times_en: string | null
          name_ar: string
          name_en: string
          region_id: string | null
          role_ar: string | null
          role_en: string | null
          slug: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          years_active: number | null
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          city_id?: string | null
          created_at?: string
          favorite_places_ar?: string[] | null
          favorite_places_en?: string[] | null
          id?: string
          image?: string | null
          interests_ar?: string[] | null
          interests_en?: string[] | null
          languages_ar?: string[] | null
          languages_en?: string[] | null
          latitude?: number | null
          longitude?: number | null
          meeting_times_ar?: string | null
          meeting_times_en?: string | null
          name_ar: string
          name_en: string
          region_id?: string | null
          role_ar?: string | null
          role_en?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          years_active?: number | null
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          city_id?: string | null
          created_at?: string
          favorite_places_ar?: string[] | null
          favorite_places_en?: string[] | null
          id?: string
          image?: string | null
          interests_ar?: string[] | null
          interests_en?: string[] | null
          languages_ar?: string[] | null
          languages_en?: string[] | null
          latitude?: number | null
          longitude?: number | null
          meeting_times_ar?: string | null
          meeting_times_en?: string | null
          name_ar?: string
          name_en?: string
          region_id?: string | null
          role_ar?: string | null
          role_en?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          years_active?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_follower_count: {
        Args: { _target_id: string; _target_type: string }
        Returns: number
      }
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
