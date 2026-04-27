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

const publishedList = (table: string) => async () => {
  const { data, error } = await supabase
    .from(table as any)
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as any[];
};

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

export const useCauses = () => useQuery({ queryKey: ["causes"], queryFn: publishedList("causes") });
export const useWhosWho = () => useQuery({ queryKey: ["whos_who"], queryFn: publishedList("whos_who") });
export const useCultureActors = () => useQuery({ queryKey: ["culture_actors"], queryFn: publishedList("culture_actors") });
export const usePartners = () => useQuery({ queryKey: ["partners"], queryFn: publishedList("partners") });
export const usePosts = () => useQuery({ queryKey: ["posts"], queryFn: publishedList("posts") });
export const useOrganizations = () => useQuery({ queryKey: ["organizations"], queryFn: publishedList("organizations") });
export const useMeetups = () => useQuery({ queryKey: ["meetups"], queryFn: publishedList("meetups") });

