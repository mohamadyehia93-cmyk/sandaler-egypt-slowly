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

// Eager — first paint critical
import Index from "./pages/Index.tsx";
import Splash from "./pages/Splash.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy — everything else
const ExperienceDetail = lazy(() => import("./pages/ExperienceDetail.tsx"));
const TripDetail = lazy(() => import("./pages/TripDetail.tsx"));
const AudioTourDetail = lazy(() => import("./pages/AudioTourDetail.tsx"));
const CauseDetail = lazy(() => import("./pages/CauseDetail.tsx"));
const OrganizationDetail = lazy(() => import("./pages/OrganizationDetail.tsx"));
const Wishlists = lazy(() => import("./pages/Wishlists.tsx"));
const Inbox = lazy(() => import("./pages/Inbox.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const RegionDetail = lazy(() => import("./pages/RegionDetail.tsx"));
const CityDetail = lazy(() => import("./pages/CityDetail.tsx"));
const HighlightDetail = lazy(() => import("./pages/HighlightDetail.tsx"));
const PersonDetail = lazy(() => import("./pages/PersonDetail.tsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.tsx"));
const CultureActorDetail = lazy(() => import("./pages/CultureActorDetail.tsx"));
const AccommodationDetail = lazy(() => import("./pages/AccommodationDetail.tsx"));
const HostDetail = lazy(() => import("./pages/HostDetail.tsx"));
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
const EventCalendar = lazy(() => import("./pages/EventCalendar.tsx"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile.tsx"));
const CultureActorDashboard = lazy(() => import("./pages/dashboards/CultureActorDashboard.tsx"));
const ServiceProviderDashboard = lazy(() => import("./pages/dashboards/ServiceProviderDashboard.tsx"));
const WhosWhoDashboard = lazy(() => import("./pages/dashboards/WhosWhoDashboard.tsx"));
const OrganizationDashboard = lazy(() => import("./pages/dashboards/OrganizationDashboard.tsx"));
const AmbassadorDashboard = lazy(() => import("./pages/dashboards/AmbassadorDashboard.tsx"));
const ProductSellerDashboard = lazy(() => import("./pages/dashboards/ProductSellerDashboard.tsx"));
const TripOrganizerDashboard = lazy(() => import("./pages/dashboards/TripOrganizerDashboard.tsx"));
const SubjectExpertDashboard = lazy(() => import("./pages/dashboards/SubjectExpertDashboard.tsx"));
const NarratorDashboard = lazy(() => import("./pages/dashboards/NarratorDashboard.tsx"));
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
const ItineraryPlanner = lazy(() => import("./pages/ItineraryPlanner.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const AllPosts = lazy(() => import("./pages/AllPosts.tsx"));
const AllAudioTours = lazy(() => import("./pages/AllAudioTours.tsx"));
const AllTrips = lazy(() => import("./pages/AllTrips.tsx"));
const AllCauses = lazy(() => import("./pages/AllCauses.tsx"));
const AllPeople = lazy(() => import("./pages/AllPeople.tsx"));
const VisitorProfile = lazy(() => import("./pages/VisitorProfile.tsx"));
const StatusesFeed = lazy(() => import("./pages/StatusesFeed.tsx"));
const MyContent = lazy(() => import("./pages/dashboards/MyContent.tsx"));
const MyListings = lazy(() => import("./pages/dashboards/MyListings.tsx"));
const MyProducts = lazy(() => import("./pages/dashboards/MyProducts.tsx"));
const MyTrips = lazy(() => import("./pages/dashboards/MyTrips.tsx"));
const MyPrograms = lazy(() => import("./pages/dashboards/MyPrograms.tsx"));
const MyCollections = lazy(() => import("./pages/dashboards/MyCollections.tsx"));
const MyTasks = lazy(() => import("./pages/dashboards/MyTasks.tsx"));

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
        <UserRoleProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteGuard>
              <Suspense fallback={<RouteFallback />}>
              <Routes>
            <Route path="/welcome" element={<Splash />} />
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/trips" element={<AllTrips />} />
            <Route path="/audio-tours" element={<AllAudioTours />} />
            <Route path="/audio-tour/:id" element={<AudioTourDetail />} />
            <Route path="/causes" element={<AllCauses />} />
            <Route path="/people" element={<AllPeople />} />
            <Route path="/cause/:id" element={<CauseDetail />} />
            <Route path="/organization/:id" element={<OrganizationDetail />} />
            <Route path="/cause/:id/gift" element={<CauseSupportGift />} />
            <Route path="/cause/:id/donate" element={<CauseSupportDonate />} />
            <Route path="/cause/:id/volunteer" element={<CauseSupportVolunteer />} />
            <Route path="/cause/:id/consult" element={<CauseSupportConsult />} />
            <Route path="/region/:regionId" element={<RegionDetail />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/city/:cityId" element={<CityDetail />} />
            <Route path="/city/:cityId/highlight/:highlightSlug" element={<HighlightDetail />} />
            <Route path="/posts" element={<AllPosts />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/culture-actor/:id" element={<CultureActorDetail />} />
            <Route path="/stay/:id" element={<AccommodationDetail />} />
            <Route path="/host/:id" element={<HostDetail />} />
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
            <Route path="/statuses" element={<StatusesFeed />} />
            <Route path="/visitor/:id" element={<VisitorProfile />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/booking/cancelled" element={<BookingCancelled />} />
            <Route path="/wishlists" element={<Wishlists />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/impact" element={<ImpactDashboard />} />
            <Route path="/profile/badges" element={<BadgesQuests />} />
            <Route path="/profile/settings" element={<Settings />} />
            <Route path="/profile/help" element={<HelpSupport />} />
            <Route path="/dashboard/culture-actor/new-article" element={<NewArticle />} />
            <Route path="/dashboard/culture-actor/my-content" element={<MyContent />} />
            <Route path="/dashboard/culture-actor" element={<CultureActorDashboard />} />
            <Route path="/dashboard/service-provider/new-experience" element={<NewExperience />} />
            <Route path="/dashboard/service-provider/my-listings" element={<MyListings />} />
            <Route path="/dashboard/service-provider" element={<ServiceProviderDashboard />} />
            <Route path="/dashboard/whos-who/new-session" element={<NewSession />} />
            <Route path="/dashboard/whos-who" element={<WhosWhoDashboard />} />
            <Route path="/dashboard/organization/new-program" element={<NewProgram />} />
            <Route path="/dashboard/organization/my-programs" element={<MyPrograms />} />
            <Route path="/dashboard/organization" element={<OrganizationDashboard />} />
            <Route path="/dashboard/ambassador/flag-issue" element={<NewFlagReport />} />
            <Route path="/dashboard/ambassador/my-tasks" element={<MyTasks />} />
            <Route path="/dashboard/ambassador" element={<AmbassadorDashboard />} />
            <Route path="/dashboard/product-seller/new-product" element={<NewProduct />} />
            <Route path="/dashboard/product-seller/my-products" element={<MyProducts />} />
            <Route path="/dashboard/product-seller" element={<ProductSellerDashboard />} />
            <Route path="/dashboard/trip-organizer/new-trip" element={<NewTrip />} />
            <Route path="/dashboard/trip-organizer/my-trips" element={<MyTrips />} />
            <Route path="/dashboard/trip-organizer" element={<TripOrganizerDashboard />} />
            <Route path="/dashboard/subject-expert/new-collection" element={<NewCollection />} />
            <Route path="/dashboard/subject-expert/my-collections" element={<MyCollections />} />
            <Route path="/dashboard/subject-expert" element={<SubjectExpertDashboard />} />
            <Route path="/dashboard/narrator/new-tour" element={<NewAudioTour />} />
            <Route path="/dashboard/narrator/my-tours" element={<MyAudioTours />} />
            <Route path="/dashboard/narrator" element={<NarratorDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
              </Suspense>
          </RouteGuard>
        </BrowserRouter>
        </AuthProvider>
        </UserRoleProvider>
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
