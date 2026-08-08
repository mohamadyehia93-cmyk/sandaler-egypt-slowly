import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchExperiencesTool from "./tools/search-experiences";
import listUpcomingEventsTool from "./tools/list-upcoming-events";
import listTripsTool from "./tools/list-trips";
import myBookingsTool from "./tools/my-bookings";
import myEventTicketsTool from "./tools/my-event-tickets";
import listSavedItinerariesTool from "./tools/list-saved-itineraries";
import saveItineraryTool from "./tools/save-itinerary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "remix-of-sandal-journeys",
  title: "Remix of Sandal Journeys",
  version: "0.1.0",
  instructions:
    "Tools for Sandal, a slow-travel Egypt platform. Browse experiences, upcoming events and multi-day trips, read the signed-in user's bookings, event tickets and saved itineraries, and save new itineraries to their account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchExperiencesTool,
    listUpcomingEventsTool,
    listTripsTool,
    myBookingsTool,
    myEventTicketsTool,
    listSavedItinerariesTool,
    saveItineraryTool,
  ],
});
