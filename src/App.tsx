import * as Sentry from '@sentry/react';
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { UserRoleProvider } from "@/hooks/useUserRole";
import { AuthProvider } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import RouteGuard from "@/components/RouteGuard";
import RouteTracker from "@/components/RouteTracker";
import Diagnostics from "./pages/Diagnostics.tsx";
import OAuthConsent from "./pages/OAuthConsent.tsx";


// Eager — first paint critical
import Index from "./pages/Index.tsx";
import Splash from "./pages/Splash.tsx";
import SwitchRole from "./pages/SwitchRole.tsx";
import ClaimProfile from "./pages/ClaimProfile.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy — everything else
const ExperienceDetail = lazy(() => import("./pages/ExperienceDetail.tsx"));
const TripDetail = lazy(() => import("./pages/TripDetail.tsx"));
const AudioTourDetail = lazy(() => import("./pages/AudioTourDetail.tsx"));
const CauseDetail = lazy(() => import("./pages/CauseDetail.tsx"));
const ProgramDetail = lazy(() => import("./pages/ProgramDetail.tsx"));
const ProgramSupport = lazy(() => import("./pages/ProgramSupport.tsx"));

const OrganizationDetail = lazy(() => import("./pages/OrganizationDetail.tsx"));
const Wishlists = lazy(() => import("./pages/Wishlists.tsx"));
const Search = lazy(() => import("./pages/Search.tsx"));
const Inbox = lazy(() => import("./pages/Inbox.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const EditProfile = lazy(() => import("./pages/EditProfile.tsx"));
const RegionDetail = lazy(() => import("./pages/RegionDetail.tsx"));
const RegionPage = lazy(() => import("./pages/RegionPage.tsx"));
const CityDetail = lazy(() => import("./pages/CityDetail.tsx"));
const HighlightDetail = lazy(() => import("./pages/HighlightDetail.tsx"));
const PersonDetail = lazy(() => import("./pages/PersonDetail.tsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.tsx"));
const CultureActorDetail = lazy(() => import("./pages/CultureActorDetail.tsx"));
const AccommodationDetail = lazy(() => import("./pages/AccommodationDetail.tsx"));
const TransportDetail = lazy(() => import("./pages/TransportDetail.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail.tsx"));
const ImpactDashboard = lazy(() => import("./pages/ImpactDashboard.tsx"));
const BadgesQuests = lazy(() => import("./pages/BadgesQuests.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const HelpSupport = lazy(() => import("./pages/HelpSupport.tsx"));
const CauseSupportGift = lazy(() => import("./pages/CauseSupportGift.tsx"));
const CauseSupportDonate = lazy(() => import("./pages/CauseSupportDonate.tsx"));
const CauseSupportVolunteer = lazy(() => import("./pages/CauseSupportVolunteer.tsx"));
const CauseSupportConsult = lazy(() => import("./pages/CauseSupportConsult.tsx"));
const Booking = lazy(() => import("./pages/Booking.tsx"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess.tsx"));
const BookingCancelled = lazy(() => import("./components/BookingCancelled.tsx"));
const MyBookings = lazy(() => import("./pages/MyBookings.tsx"));
const EventCalendar = lazy(() => import("./pages/EventCalendar.tsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.tsx"));
const EventCheckout = lazy(() => import("./pages/EventCheckout.tsx"));
const EventTicketReceipt = lazy(() => import("./pages/EventTicketReceipt.tsx"));
const MyTickets = lazy(() => import("./pages/MyTickets.tsx"));
const MyOrders = lazy(() => import("./pages/MyOrders.tsx"));
const MyApplications = lazy(() => import("./pages/MyApplications.tsx"));
const MyPledges = lazy(() => import("./pages/MyPledges.tsx"));
const Sessions = lazy(() => import("./pages/Sessions.tsx"));
const MySessionRequests = lazy(() => import("./pages/MySessionRequests.tsx"));
const MyCommissions = lazy(() => import("./pages/MyCommissions.tsx"));
const NewEvent = lazy(() => import("./pages/dashboards/NewEvent.tsx"));
const MyEvents = lazy(() => import("./pages/dashboards/MyEvents.tsx"));
const EventsDashboard = lazy(() => import("./pages/dashboards/EventsDashboard.tsx"));
const NewAccommodation = lazy(() => import("./pages/dashboards/NewAccommodation.tsx"));
const NewTransport = lazy(() => import("./pages/dashboards/NewTransport.tsx"));
const MyStays = lazy(() => import("./pages/dashboards/MyStays.tsx"));
const MyRides = lazy(() => import("./pages/dashboards/MyRides.tsx"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile.tsx"));
const CultureActorDashboard = lazy(() => import("./pages/dashboards/CultureActorDashboard.tsx"));
const ServiceProviderDashboard = lazy(() => import("./pages/dashboards/ServiceProviderDashboard.tsx"));
const WhosWhoDashboard = lazy(() => import("./pages/dashboards/WhosWhoDashboard.tsx"));
const OrganizationDashboard = lazy(() => import("./pages/dashboards/OrganizationDashboard.tsx"));
const ProductSellerDashboard = lazy(() => import("./pages/dashboards/ProductSellerDashboard.tsx"));
const TripOrganizerDashboard = lazy(() => import("./pages/dashboards/TripOrganizerDashboard.tsx"));
const MyAudioTours = lazy(() => import("./pages/dashboards/MyAudioTours.tsx"));
const NewAudioTour = lazy(() => import("./pages/dashboards/NewAudioTour.tsx"));
const NewExperience = lazy(() => import("./pages/dashboards/NewExperience.tsx"));
const NewArticle = lazy(() => import("./pages/dashboards/NewArticle.tsx"));
const NewProduct = lazy(() => import("./pages/dashboards/NewProduct.tsx"));
const NewTrip = lazy(() => import("./pages/dashboards/NewTrip.tsx"));
const NewSession = lazy(() => import("./pages/dashboards/NewSession.tsx"));
const NewProgram = lazy(() => import("./pages/dashboards/NewProgram.tsx"));
const NewFlagReport = lazy(() => import("./pages/dashboards/NewFlagReport.tsx"));
const NewCollection = lazy(() => import("./pages/dashboards/NewCollection.tsx"));
const Community = lazy(() => import("./pages/Community.tsx"));
const Status = lazy(() => import("./pages/Status.tsx"));
const ItineraryPlanner = lazy(() => import("./pages/ItineraryPlanner.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const AllPosts = lazy(() => import("./pages/AllPosts.tsx"));
const AllAudioTours = lazy(() => import("./pages/AllAudioTours.tsx"));
const AllTrips = lazy(() => import("./pages/AllTrips.tsx"));
const AllCauses = lazy(() => import("./pages/AllCauses.tsx"));
const AllPeople = lazy(() => import("./pages/AllPeople.tsx"));
const AllCollections = lazy(() => import("./pages/AllCollections.tsx"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail.tsx"));
const VisitorProfile = lazy(() => import("./pages/VisitorProfile.tsx"));
const StatusesFeed = lazy(() => import("./pages/StatusesFeed.tsx"));
const MyContent = lazy(() => import("./pages/dashboards/MyContent.tsx"));
const MyListings = lazy(() => import("./pages/dashboards/MyListings.tsx"));
const ExperienceSlots = lazy(() => import("./pages/dashboards/ExperienceSlots.tsx"));
const MyProducts = lazy(() => import("./pages/dashboards/MyProducts.tsx"));
const MyTrips = lazy(() => import("./pages/dashboards/MyTrips.tsx"));
const MyPrograms = lazy(() => import("./pages/dashboards/MyPrograms.tsx"));
const MyCollections = lazy(() => import("./pages/dashboards/MyCollections.tsx"));
const MySessions = lazy(() => import("./pages/dashboards/MySessions.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Credits = lazy(() => import("./pages/Credits.tsx"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const App = () => {
  useLanguage(); // sets html lang and dir on mount and on language change
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <AuthProvider>
        <UserRoleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <RouteGuard>
              <Suspense fallback={<RouteFallback />}>
              <Routes>
            <Route path="/welcome" element={<Splash />} />
            <Route path="/claim/:token" element={<ClaimProfile />} />
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/trips" element={<AllTrips />} />
            <Route path="/audio-tours" element={<AllAudioTours />} />
            <Route path="/audio-tour/:id" element={<AudioTourDetail />} />
            <Route path="/causes" element={<AllCauses />} />
            <Route path="/people" element={<AllPeople />} />
            <Route path="/collections" element={<AllCollections />} />
            <Route path="/collection/:id" element={<CollectionDetail />} />
            <Route path="/cause/:id" element={<CauseDetail />} />
            <Route path="/program/:id" element={<ProgramDetail />} />
            <Route path="/program/:id/:action" element={<ProgramSupport />} />

            <Route path="/organization/:id" element={<OrganizationDetail />} />
            <Route path="/cause/:id/gift" element={<CauseSupportGift />} />
            <Route path="/cause/:id/donate" element={<CauseSupportDonate />} />
            <Route path="/cause/:id/volunteer" element={<CauseSupportVolunteer />} />
            <Route path="/cause/:id/consult" element={<CauseSupportConsult />} />
            <Route path="/region/:regionId" element={<RegionDetail />} />
            <Route path="/regions/:slug" element={<RegionPage />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/city/:cityId" element={<CityDetail />} />
            <Route path="/city/:cityId/highlight/:highlightSlug" element={<HighlightDetail />} />
            <Route path="/posts" element={<AllPosts />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/culture-actor/:id" element={<CultureActorDetail />} />
            <Route path="/stay/:id" element={<AccommodationDetail />} />
            <Route path="/transport/:id" element={<TransportDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/partner/:id" element={<PartnerDetail />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/planner" element={<ItineraryPlanner />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/community" element={<Community />} />
            <Route path="/status" element={<Status />} />
            <Route path="/statuses" element={<StatusesFeed />} />
            <Route path="/visitor/:id" element={<VisitorProfile />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/booking/cancelled" element={<BookingCancelled />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/event/:id/tickets" element={<EventCheckout />} />
            <Route path="/event-ticket/:ticketId" element={<EventTicketReceipt />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/pledges" element={<MyPledges />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/session-requests" element={<MySessionRequests />} />
            <Route path="/commissions" element={<MyCommissions />} />
            <Route path="/wishlists" element={<Wishlists />} />
            <Route path="/search" element={<Search />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/profile/impact" element={<ImpactDashboard />} />
            <Route path="/profile/badges" element={<BadgesQuests />} />
            <Route path="/profile/settings" element={<Settings />} />
            <Route path="/profile/help" element={<HelpSupport />} />
            <Route path="/admin" element={<Admin />} />
            {/* Admin editorial authoring — the same forms in ownerless mode */}
            <Route path="/admin/editorial/stay/new" element={<NewAccommodation editorial />} />
            <Route path="/admin/editorial/stay/:id" element={<NewAccommodation editorial />} />
            <Route path="/admin/editorial/ride/new" element={<NewTransport editorial />} />
            <Route path="/admin/editorial/ride/:id" element={<NewTransport editorial />} />
            <Route path="/flag-issue" element={<NewFlagReport />} />
            <Route path="/flag-issue/:id" element={<NewFlagReport />} />
            <Route path="/credits" element={<Credits />} />

            <Route path="/dashboard/culture-actor/new-article" element={<NewArticle />} />
            <Route path="/dashboard/culture-actor/edit-article/:id" element={<NewArticle />} />
            <Route path="/dashboard/culture-actor/my-content" element={<MyContent />} />
            <Route path="/dashboard/culture-actor/new-collection" element={<NewCollection />} />
            <Route path="/dashboard/culture-actor/edit-collection/:id" element={<NewCollection />} />
            <Route path="/dashboard/culture-actor/my-collections" element={<MyCollections />} />
            <Route path="/dashboard/culture-actor/new-tour" element={<NewAudioTour />} />
            <Route path="/dashboard/culture-actor/edit-tour/:id" element={<NewAudioTour />} />
            <Route path="/dashboard/culture-actor/my-tours" element={<MyAudioTours />} />
            <Route path="/dashboard/culture-actor" element={<CultureActorDashboard />} />
            <Route path="/dashboard/service-provider/new-experience" element={<NewExperience />} />
            <Route path="/dashboard/service-provider/my-listings" element={<MyListings />} />
            <Route path="/dashboard/service-provider/edit-experience/:id" element={<NewExperience />} />
            <Route path="/dashboard/service-provider/listing/:id/slots" element={<ExperienceSlots />} />
            <Route path="/dashboard/service-provider/new-stay" element={<NewAccommodation />} />
            <Route path="/dashboard/service-provider/edit-stay/:id" element={<NewAccommodation />} />
            <Route path="/dashboard/service-provider/my-stays" element={<MyStays />} />
            <Route path="/dashboard/service-provider/new-transport" element={<NewTransport />} />
            <Route path="/dashboard/service-provider/edit-transport/:id" element={<NewTransport />} />
            <Route path="/dashboard/service-provider/my-rides" element={<MyRides />} />
            <Route path="/dashboard/service-provider" element={<ServiceProviderDashboard />} />
            <Route path="/dashboard/whos-who/new-session" element={<NewSession />} />
            <Route path="/dashboard/whos-who/my-sessions" element={<MySessions />} />
            <Route path="/dashboard/whos-who" element={<WhosWhoDashboard />} />
            <Route path="/dashboard/organization/new-program" element={<NewProgram />} />
            <Route path="/dashboard/organization/edit-program/:id" element={<NewProgram />} />
            <Route path="/dashboard/organization/my-programs" element={<MyPrograms />} />
            <Route path="/dashboard/organization" element={<OrganizationDashboard />} />
            <Route path="/dashboard/product-seller/new-product" element={<NewProduct />} />
            <Route path="/dashboard/product-seller/edit-product/:id" element={<NewProduct />} />
            <Route path="/dashboard/product-seller/my-products" element={<MyProducts />} />
            <Route path="/dashboard/product-seller" element={<ProductSellerDashboard />} />
            <Route path="/dashboard/trip-organizer/new-trip" element={<NewTrip />} />
            <Route path="/dashboard/trip-organizer/edit-trip/:id" element={<NewTrip />} />
            <Route path="/dashboard/trip-organizer/my-trips" element={<MyTrips />} />
            <Route path="/dashboard/trip-organizer/new-event" element={<NewEvent />} />
            <Route path="/dashboard/trip-organizer/my-events" element={<MyEvents />} />
            <Route path="/dashboard/trip-organizer/events" element={<EventsDashboard />} />
            {/* Role-neutral aliases: any provider role may organise events */}
            <Route path="/dashboard/events" element={<EventsDashboard />} />
            <Route path="/dashboard/new-event" element={<NewEvent />} />

            <Route path="/dashboard/trip-organizer" element={<TripOrganizerDashboard />} />

            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/diagnostics" element={<Diagnostics />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
              </Suspense>
          </RouteGuard>
        </BrowserRouter>
        </UserRoleProvider>
        </AuthProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

const SentryFallback = () => (
  <div style={{ padding: 20, textAlign: 'center', fontFamily: 'Cairo, sans-serif' }}>
    <h1>Something went wrong</h1>
    <p>We've been notified and are looking into it.</p>
    <button onClick={() => window.location.reload()}>Reload</button>
  </div>
);

export default Sentry.withErrorBoundary(App, { fallback: <SentryFallback /> });
