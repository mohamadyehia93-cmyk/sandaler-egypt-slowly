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
          amenities_ar: string[]
          amenities_en: string[]
          bathrooms: number | null
          bedrooms: number | null
          cancellation_ar: string | null
          cancellation_en: string | null
          check_in_time: string | null
          check_out_time: string | null
          city_id: string | null
          created_at: string
          currency: string
          description_ar: string | null
          description_en: string | null
          host_id: string | null
          host_image: string | null
          host_name_ar: string | null
          host_name_en: string | null
          house_rules_ar: string | null
          house_rules_en: string | null
          id: string
          image: string | null
          images: string[] | null
          latitude: number | null
          listing_kind: string
          longitude: number | null
          min_nights: number | null
          name_ar: string | null
          name_en: string
          price_per_night: number
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          sleeps: number | null
          slug: string | null
          status: string | null
          translation_meta: Json
          unit_type_ar: string | null
          unit_type_en: string | null
          updated_at: string
        }
        Insert: {
          accommodation_type?: string | null
          amenities?: string[] | null
          amenities_ar?: string[]
          amenities_en?: string[]
          bathrooms?: number | null
          bedrooms?: number | null
          cancellation_ar?: string | null
          cancellation_en?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city_id?: string | null
          created_at?: string
          currency?: string
          description_ar?: string | null
          description_en?: string | null
          host_id?: string | null
          host_image?: string | null
          host_name_ar?: string | null
          host_name_en?: string | null
          house_rules_ar?: string | null
          house_rules_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          listing_kind?: string
          longitude?: number | null
          min_nights?: number | null
          name_ar?: string | null
          name_en: string
          price_per_night?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          sleeps?: number | null
          slug?: string | null
          status?: string | null
          translation_meta?: Json
          unit_type_ar?: string | null
          unit_type_en?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_type?: string | null
          amenities?: string[] | null
          amenities_ar?: string[]
          amenities_en?: string[]
          bathrooms?: number | null
          bedrooms?: number | null
          cancellation_ar?: string | null
          cancellation_en?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city_id?: string | null
          created_at?: string
          currency?: string
          description_ar?: string | null
          description_en?: string | null
          host_id?: string | null
          host_image?: string | null
          host_name_ar?: string | null
          host_name_en?: string | null
          house_rules_ar?: string | null
          house_rules_en?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          listing_kind?: string
          longitude?: number | null
          min_nights?: number | null
          name_ar?: string | null
          name_en?: string
          price_per_night?: number
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          sleeps?: number | null
          slug?: string | null
          status?: string | null
          translation_meta?: Json
          unit_type_ar?: string | null
          unit_type_en?: string | null
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
      ambassador_tasks: {
        Row: {
          ambassador_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          status: string
          title_ar: string | null
          title_en: string
          updated_at: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          status?: string
          title_ar?: string | null
          title_en: string
          updated_at?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          status?: string
          title_ar?: string | null
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      audio_tours: {
        Row: {
          audio_url: string | null
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
          theme: string | null
          title_ar: string | null
          title_en: string
          translation_meta: Json
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
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
          theme?: string | null
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
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
          theme?: string | null
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
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
          payment_status: string
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
          payment_status?: string
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
          payment_status?: string
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
          title_ar: string | null
          title_en: string
          translation_meta: Json
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
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
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
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
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
      collections: {
        Row: {
          abstract_ar: string | null
          abstract_en: string | null
          cover_image: string | null
          created_at: string
          discipline: string | null
          entries: Json
          expert_id: string
          id: string
          license: string
          refs: Json
          region_id: string | null
          slug: string | null
          status: string
          title_ar: string | null
          title_en: string
          translation_meta: Json
          updated_at: string
        }
        Insert: {
          abstract_ar?: string | null
          abstract_en?: string | null
          cover_image?: string | null
          created_at?: string
          discipline?: string | null
          entries?: Json
          expert_id: string
          id?: string
          license?: string
          refs?: Json
          region_id?: string | null
          slug?: string | null
          status?: string
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
          updated_at?: string
        }
        Update: {
          abstract_ar?: string | null
          abstract_en?: string | null
          cover_image?: string | null
          created_at?: string
          discipline?: string | null
          entries?: Json
          expert_id?: string
          id?: string
          license?: string
          refs?: Json
          region_id?: string | null
          slug?: string | null
          status?: string
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          actor_user_id: string | null
          brief: string | null
          commissioner_id: string
          created_at: string
          culture_actor_id: string
          currency: string | null
          deadline: string | null
          decline_reason: string | null
          deliverable_post_id: string | null
          deliverable_url: string | null
          id: string
          kind: string
          proposed_fee: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actor_user_id?: string | null
          brief?: string | null
          commissioner_id?: string
          created_at?: string
          culture_actor_id: string
          currency?: string | null
          deadline?: string | null
          decline_reason?: string | null
          deliverable_post_id?: string | null
          deliverable_url?: string | null
          id?: string
          kind: string
          proposed_fee?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actor_user_id?: string | null
          brief?: string | null
          commissioner_id?: string
          created_at?: string
          culture_actor_id?: string
          currency?: string | null
          deadline?: string | null
          decline_reason?: string | null
          deliverable_post_id?: string | null
          deliverable_url?: string | null
          id?: string
          kind?: string
          proposed_fee?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_culture_actor_id_fkey"
            columns: ["culture_actor_id"]
            isOneToOne: false
            referencedRelation: "culture_actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_deliverable_post_id_fkey"
            columns: ["deliverable_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          author_name: string | null
          category: string
          content: string
          created_at: string
          id: string
          images: string[]
          location: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          images?: string[]
          location?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          images?: string[]
          location?: string | null
          updated_at?: string
        }
        Relationships: []
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
          name_ar: string | null
          name_en: string
          quote_ar: string | null
          quote_en: string | null
          region_id: string | null
          slug: string | null
          social_links: Json | null
          status: string | null
          title_ar: string | null
          title_en: string | null
          translation_meta: Json
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
          name_ar?: string | null
          name_en: string
          quote_ar?: string | null
          quote_en?: string | null
          region_id?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          title_ar?: string | null
          title_en?: string | null
          translation_meta?: Json
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
          name_ar?: string | null
          name_en?: string
          quote_ar?: string | null
          quote_en?: string | null
          region_id?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          title_ar?: string | null
          title_en?: string | null
          translation_meta?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          attendee_email: string
          attendee_name: string
          created_at: string
          event_id: string
          id: string
          payment_method: string
          quantity: number
          reference: string
          service_fee_egp: number
          status: string
          total_egp: number
          unit_price_egp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attendee_email: string
          attendee_name: string
          created_at?: string
          event_id: string
          id?: string
          payment_method?: string
          quantity?: number
          reference?: string
          service_fee_egp?: number
          status?: string
          total_egp?: number
          unit_price_egp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attendee_email?: string
          attendee_name?: string
          created_at?: string
          event_id?: string
          id?: string
          payment_method?: string
          quantity?: number
          reference?: string
          service_fee_egp?: number
          status?: string
          total_egp?: number
          unit_price_egp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          review_notes: string | null
          reviewed_at: string | null
          slug: string | null
          start_date: string
          status: string
          ticket_url: string | null
          title_ar: string | null
          title_en: string
          translation_meta: Json
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
          review_notes?: string | null
          reviewed_at?: string | null
          slug?: string | null
          start_date: string
          status?: string
          ticket_url?: string | null
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
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
          review_notes?: string | null
          reviewed_at?: string | null
          slug?: string | null
          start_date?: string
          status?: string
          ticket_url?: string | null
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
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
          remarks_ar: string | null
          remarks_en: string | null
          reviews_count: number | null
          slug: string | null
          status: string | null
          theme: string | null
          theme_other: string | null
          title_ar: string | null
          title_en: string
          translation_meta: Json
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
          remarks_ar?: string | null
          remarks_en?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          theme?: string | null
          theme_other?: string | null
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
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
          remarks_ar?: string | null
          remarks_en?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: string | null
          theme?: string | null
          theme_other?: string | null
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
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
      flag_reports: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string
          id: string
          issue_type: string
          location: string | null
          priority: string
          provider_name: string | null
          reporter_id: string
          resolution_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description: string
          id?: string
          issue_type: string
          location?: string | null
          priority: string
          provider_name?: string | null
          reporter_id: string
          resolution_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string
          id?: string
          issue_type?: string
          location?: string | null
          priority?: string
          provider_name?: string | null
          reporter_id?: string
          resolution_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      image_credits: {
        Row: {
          artist: string | null
          created_at: string
          file_title: string | null
          id: string
          image_url: string
          license: string | null
          license_url: string | null
          source_url: string | null
          updated_at: string
          used_for: string | null
        }
        Insert: {
          artist?: string | null
          created_at?: string
          file_title?: string | null
          id?: string
          image_url: string
          license?: string | null
          license_url?: string | null
          source_url?: string | null
          updated_at?: string
          used_for?: string | null
        }
        Update: {
          artist?: string | null
          created_at?: string
          file_title?: string | null
          id?: string
          image_url?: string
          license?: string | null
          license_url?: string | null
          source_url?: string | null
          updated_at?: string
          used_for?: string | null
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
          title_ar: string | null
          title_en: string
          translation_meta: Json
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
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
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
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
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
      notification_outbox: {
        Row: {
          attempts: number
          created_at: string
          dedupe_key: string
          id: string
          language: string
          last_error: string | null
          next_attempt_at: string
          payload: Json
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string | null
          status: string
          template: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          dedupe_key: string
          id?: string
          language?: string
          last_error?: string | null
          next_attempt_at?: string
          payload?: Json
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string
          template: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          dedupe_key?: string
          id?: string
          language?: string
          last_error?: string | null
          next_attempt_at?: string
          payload?: Json
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          buyer_note: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          delivery_address: string | null
          delivery_method: string | null
          id: string
          product_id: string
          quantity: number
          seller_id: string
          status: string
          total_egp: number | null
          unit_price_egp: number | null
          updated_at: string
          variant_selection: Json | null
        }
        Insert: {
          buyer_id?: string
          buyer_note?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_method?: string | null
          id?: string
          product_id: string
          quantity?: number
          seller_id: string
          status?: string
          total_egp?: number | null
          unit_price_egp?: number | null
          updated_at?: string
          variant_selection?: Json | null
        }
        Update: {
          buyer_id?: string
          buyer_note?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_method?: string | null
          id?: string
          product_id?: string
          quantity?: number
          seller_id?: string
          status?: string
          total_egp?: number | null
          unit_price_egp?: number | null
          updated_at?: string
          variant_selection?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          focus_areas_ar: string[] | null
          focus_areas_en: string[] | null
          id: string
          image: string | null
          location_ar: string | null
          location_en: string | null
          logo: string | null
          mission_ar: string | null
          mission_en: string | null
          name_ar: string | null
          name_en: string
          org_type: string | null
          owner_id: string | null
          programs: Json | null
          region_id: string | null
          slug: string | null
          status: string | null
          translation_meta: Json
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
          focus_areas_ar?: string[] | null
          focus_areas_en?: string[] | null
          id?: string
          image?: string | null
          location_ar?: string | null
          location_en?: string | null
          logo?: string | null
          mission_ar?: string | null
          mission_en?: string | null
          name_ar?: string | null
          name_en: string
          org_type?: string | null
          owner_id?: string | null
          programs?: Json | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          translation_meta?: Json
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
          focus_areas_ar?: string[] | null
          focus_areas_en?: string[] | null
          id?: string
          image?: string | null
          location_ar?: string | null
          location_en?: string | null
          logo?: string | null
          mission_ar?: string | null
          mission_en?: string | null
          name_ar?: string | null
          name_en?: string
          org_type?: string | null
          owner_id?: string | null
          programs?: Json | null
          region_id?: string | null
          slug?: string | null
          status?: string | null
          translation_meta?: Json
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
          title_ar: string | null
          title_en: string
          translation_meta: Json
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
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
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
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
          updated_at?: string
        }
        Relationships: [
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
          care_ar: string | null
          care_en: string | null
          category: string | null
          city_id: string | null
          created_at: string
          currency: string
          delivery_options: Json
          description_ar: string | null
          description_en: string | null
          dimensions: string | null
          id: string
          image: string | null
          images: string[] | null
          latitude: number | null
          lead_time_days: number | null
          longitude: number | null
          made_to_order: boolean
          materials_ar: string | null
          materials_en: string | null
          name_ar: string | null
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
          translation_meta: Json
          updated_at: string
          variants: Json
          weight_grams: number | null
        }
        Insert: {
          badges?: string[] | null
          care_ar?: string | null
          care_en?: string | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          currency?: string
          delivery_options?: Json
          description_ar?: string | null
          description_en?: string | null
          dimensions?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          lead_time_days?: number | null
          longitude?: number | null
          made_to_order?: boolean
          materials_ar?: string | null
          materials_en?: string | null
          name_ar?: string | null
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
          translation_meta?: Json
          updated_at?: string
          variants?: Json
          weight_grams?: number | null
        }
        Update: {
          badges?: string[] | null
          care_ar?: string | null
          care_en?: string | null
          category?: string | null
          city_id?: string | null
          created_at?: string
          currency?: string
          delivery_options?: Json
          description_ar?: string | null
          description_en?: string | null
          dimensions?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          lead_time_days?: number | null
          longitude?: number | null
          made_to_order?: boolean
          materials_ar?: string | null
          materials_en?: string | null
          name_ar?: string | null
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
          translation_meta?: Json
          updated_at?: string
          variants?: Json
          weight_grams?: number | null
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
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          budget: string | null
          cities: string[] | null
          created_at: string
          display_name: string | null
          email_notifications: boolean
          id: string
          interests: string[] | null
          preferred_language: string | null
          travel_style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          budget?: string | null
          cities?: string[] | null
          created_at?: string
          display_name?: string | null
          email_notifications?: boolean
          id?: string
          interests?: string[] | null
          preferred_language?: string | null
          travel_style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          budget?: string | null
          cities?: string[] | null
          created_at?: string
          display_name?: string | null
          email_notifications?: boolean
          id?: string
          interests?: string[] | null
          preferred_language?: string | null
          travel_style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          city_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          donation_target: number | null
          end_date: string | null
          goals: Json
          id: string
          image: string | null
          latitude: number | null
          location_ar: string | null
          location_en: string | null
          longitude: number | null
          organization_id: string | null
          owner_id: string
          program_type: string | null
          region_id: string | null
          slug: string | null
          start_date: string | null
          status: string
          title_ar: string | null
          title_en: string
          translation_meta: Json
          updated_at: string
          video_url: string | null
          volunteers_needed: number | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          donation_target?: number | null
          end_date?: string | null
          goals?: Json
          id?: string
          image?: string | null
          latitude?: number | null
          location_ar?: string | null
          location_en?: string | null
          longitude?: number | null
          organization_id?: string | null
          owner_id: string
          program_type?: string | null
          region_id?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
          updated_at?: string
          video_url?: string | null
          volunteers_needed?: number | null
        }
        Update: {
          city_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          donation_target?: number | null
          end_date?: string | null
          goals?: Json
          id?: string
          image?: string | null
          latitude?: number | null
          location_ar?: string | null
          location_en?: string | null
          longitude?: number | null
          organization_id?: string | null
          owner_id?: string
          program_type?: string | null
          region_id?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
          updated_at?: string
          video_url?: string | null
          volunteers_needed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_claim_tokens: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          provider_id: string
          revoked_at: string | null
          satellite_id: string | null
          satellite_table: string | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          provider_id: string
          revoked_at?: string | null
          satellite_id?: string | null
          satellite_table?: string | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          provider_id?: string
          revoked_at?: string | null
          satellite_id?: string | null
          satellite_table?: string | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_claim_tokens_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
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
          contact_email: string | null
          contact_phone: string | null
          cover_image: string | null
          created_at: string
          followers: number | null
          id: string
          languages: string | null
          name_ar: string | null
          name_en: string
          rating: number | null
          region_ar: string | null
          region_en: string | null
          review_count: number | null
          role: string
          slug: string | null
          social_links: Json | null
          specialties: Json | null
          status: string | null
          tagline_ar: string | null
          tagline_en: string | null
          translation_meta: Json
          updated_at: string
          user_id: string | null
          verified: boolean | null
          website: string | null
          whatsapp: string | null
          years_active: number | null
        }
        Insert: {
          avatar?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          city_ar?: string | null
          city_en?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          followers?: number | null
          id?: string
          languages?: string | null
          name_ar?: string | null
          name_en: string
          rating?: number | null
          region_ar?: string | null
          region_en?: string | null
          review_count?: number | null
          role?: string
          slug?: string | null
          social_links?: Json | null
          specialties?: Json | null
          status?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          translation_meta?: Json
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
          whatsapp?: string | null
          years_active?: number | null
        }
        Update: {
          avatar?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          city_ar?: string | null
          city_en?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          followers?: number | null
          id?: string
          languages?: string | null
          name_ar?: string | null
          name_en?: string
          rating?: number | null
          region_ar?: string | null
          region_en?: string | null
          review_count?: number | null
          role?: string
          slug?: string | null
          social_links?: Json | null
          specialties?: Json | null
          status?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          translation_meta?: Json
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
          whatsapp?: string | null
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
      reservation_requests: {
        Row: {
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          end_date: string | null
          guests: number | null
          id: string
          item_id: string
          item_type: string
          note: string | null
          owner_id: string | null
          requester_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          end_date?: string | null
          guests?: number | null
          id?: string
          item_id: string
          item_type: string
          note?: string | null
          owner_id?: string | null
          requester_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          end_date?: string | null
          guests?: number | null
          id?: string
          item_id?: string
          item_type?: string
          note?: string | null
          owner_id?: string | null
          requester_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
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
      session_requests: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          expert_owner_id: string | null
          id: string
          meetup_id: string
          message: string | null
          preferred_date: string | null
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          expert_owner_id?: string | null
          id?: string
          meetup_id: string
          message?: string | null
          preferred_date?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          expert_owner_id?: string | null
          id?: string
          meetup_id?: string
          message?: string | null
          preferred_date?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_requests_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetups"
            referencedColumns: ["id"]
          },
        ]
      }
      support_pledges: {
        Row: {
          amount: number | null
          cause_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          currency: string
          details: Json
          id: string
          kind: string
          message: string | null
          owner_id: string | null
          status: string
          supporter_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          cause_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          details?: Json
          id?: string
          kind: string
          message?: string | null
          owner_id?: string | null
          status?: string
          supporter_id?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          cause_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          details?: Json
          id?: string
          kind?: string
          message?: string | null
          owner_id?: string | null
          status?: string
          supporter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_pledges_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "causes"
            referencedColumns: ["id"]
          },
        ]
      }
      transport: {
        Row: {
          capacity: number | null
          city_id: string | null
          created_at: string
          currency: string
          departure_point_ar: string | null
          departure_point_en: string | null
          description_ar: string | null
          description_en: string | null
          duration: string | null
          frequency: string | null
          from_ar: string | null
          from_en: string | null
          hire_type: string | null
          id: string
          image: string | null
          images: string[] | null
          latitude: number | null
          listing_kind: string
          longitude: number | null
          name_ar: string | null
          name_en: string
          notes_ar: string | null
          notes_en: string | null
          price: number
          price_basis: string | null
          provider_id: string | null
          provider_image: string | null
          provider_name_ar: string | null
          provider_name_en: string | null
          rating: number | null
          region_id: string | null
          reviews_count: number | null
          schedule_ar: string | null
          schedule_en: string | null
          slug: string | null
          status: string | null
          to_ar: string | null
          to_en: string | null
          translation_meta: Json
          transport_type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          currency?: string
          departure_point_ar?: string | null
          departure_point_en?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration?: string | null
          frequency?: string | null
          from_ar?: string | null
          from_en?: string | null
          hire_type?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          listing_kind?: string
          longitude?: number | null
          name_ar?: string | null
          name_en: string
          notes_ar?: string | null
          notes_en?: string | null
          price?: number
          price_basis?: string | null
          provider_id?: string | null
          provider_image?: string | null
          provider_name_ar?: string | null
          provider_name_en?: string | null
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          schedule_ar?: string | null
          schedule_en?: string | null
          slug?: string | null
          status?: string | null
          to_ar?: string | null
          to_en?: string | null
          translation_meta?: Json
          transport_type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          currency?: string
          departure_point_ar?: string | null
          departure_point_en?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration?: string | null
          frequency?: string | null
          from_ar?: string | null
          from_en?: string | null
          hire_type?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          listing_kind?: string
          longitude?: number | null
          name_ar?: string | null
          name_en?: string
          notes_ar?: string | null
          notes_en?: string | null
          price?: number
          price_basis?: string | null
          provider_id?: string | null
          provider_image?: string | null
          provider_name_ar?: string | null
          provider_name_en?: string | null
          rating?: number | null
          region_id?: string | null
          reviews_count?: number | null
          schedule_ar?: string | null
          schedule_en?: string | null
          slug?: string | null
          status?: string | null
          to_ar?: string | null
          to_en?: string | null
          translation_meta?: Json
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
          theme_other: string | null
          title_ar: string | null
          title_en: string
          translation_meta: Json
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
          theme_other?: string | null
          title_ar?: string | null
          title_en: string
          translation_meta?: Json
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
          theme_other?: string | null
          title_ar?: string | null
          title_en?: string
          translation_meta?: Json
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
      volunteer_applications: {
        Row: {
          applicant_id: string
          availability: string | null
          cause_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          full_name: string | null
          id: string
          message: string | null
          org_owner_id: string | null
          program_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id?: string
          availability?: string | null
          cause_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          message?: string | null
          org_owner_id?: string | null
          program_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          availability?: string | null
          cause_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          message?: string | null
          org_owner_id?: string | null
          program_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      whos_who: {
        Row: {
          availability: Json
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
          name_ar: string | null
          name_en: string
          region_id: string | null
          role_ar: string | null
          role_en: string | null
          slug: string | null
          status: string | null
          translation_meta: Json
          updated_at: string
          user_id: string | null
          years_active: number | null
        }
        Insert: {
          availability?: Json
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
          name_ar?: string | null
          name_en: string
          region_id?: string | null
          role_ar?: string | null
          role_en?: string | null
          slug?: string | null
          status?: string | null
          translation_meta?: Json
          updated_at?: string
          user_id?: string | null
          years_active?: number | null
        }
        Update: {
          availability?: Json
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
          name_ar?: string | null
          name_en?: string
          region_id?: string | null
          role_ar?: string | null
          role_en?: string | null
          slug?: string | null
          status?: string | null
          translation_meta?: Json
          updated_at?: string
          user_id?: string | null
          years_active?: number | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adopt_whos_who: { Args: { _whos_who_id: string }; Returns: Json }
      admin_create_provider_claim:
        | { Args: { _provider_id: string }; Returns: string }
        | {
            Args: {
              _provider_id: string
              _satellite_id?: string
              _satellite_table?: string
            }
            Returns: string
          }
      admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      claim_provider_profile: { Args: { _token: string }; Returns: Json }
      decrement_slot_spots: {
        Args: { _guests: number; _slot_id: string }
        Returns: number
      }
      get_follower_count: {
        Args: { _target_id: string; _target_type: string }
        Returns: number
      }
      get_provider_contact: {
        Args: { _provider_id: string }
        Returns: {
          contact_email: string
          contact_phone: string
          whatsapp: string
        }[]
      }
      global_search: {
        Args: { _limit?: number; _q: string }
        Returns: {
          image: string
          item_id: string
          item_type: string
          rank: number
          slug: string
          subtitle: string
          title_ar: string
          title_en: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_experience_provider: {
        Args: { _experience_id: string; _user_id: string }
        Returns: boolean
      }
      is_order_seller: {
        Args: { _seller_id: string; _user_id: string }
        Returns: boolean
      }
      notif_auth_user: { Args: { _id: string }; Returns: string }
      notif_enqueue: {
        Args: {
          _dedupe: string
          _payload: Json
          _template: string
          _user: string
        }
        Returns: undefined
      }
      owns_provider_record: {
        Args: { _provider_id: string; _user_id: string }
        Returns: boolean
      }
      resolve_owner_user_id: { Args: { _owner: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "ambassador"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user", "ambassador"],
    },
  },
} as const
