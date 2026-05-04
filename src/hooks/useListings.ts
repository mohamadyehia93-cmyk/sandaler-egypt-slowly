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

const makePublishedListHook = <T extends
  | "causes"
  | "whos_who"
  | "culture_actors"
  | "partners"
  | "posts"
  | "organizations"
  | "meetups"
>(table: T) => () =>
  useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCauses = makePublishedListHook("causes");
export const useWhosWho = makePublishedListHook("whos_who");
export const useCultureActors = makePublishedListHook("culture_actors");
export const usePartners = makePublishedListHook("partners");
export const usePosts = makePublishedListHook("posts");
export const useOrganizations = makePublishedListHook("organizations");
export const useMeetups = makePublishedListHook("meetups");


