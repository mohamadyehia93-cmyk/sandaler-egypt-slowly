import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExperiences = () =>
  useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useTrips = () =>
  useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAudioTours = () =>
  useQuery({
    queryKey: ["audio_tours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_tours")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAccommodations = () =>
  useQuery({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useTransport = () =>
  useQuery({
    queryKey: ["transport"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useRegions = () =>
  useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("regions").select("*");
      if (error) throw error;
      return data;
    },
  });

export const useCities = () =>
  useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("*");
      if (error) throw error;
      return data;
    },
  });

export const useHeroSlides = () =>
  useQuery({
    queryKey: ["hero_slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("status", "published")
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useCauses = () =>
  useQuery({
    queryKey: ["causes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("causes").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useWhosWho = () =>
  useQuery({
    queryKey: ["whos_who"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whos_who").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCultureActors = () =>
  useQuery({
    queryKey: ["culture_actors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("culture_actors").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const usePartners = () =>
  useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const usePosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useOrganizations = () =>
  useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useMeetups = () =>
  useQuery({
    queryKey: ["meetups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meetups").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });



