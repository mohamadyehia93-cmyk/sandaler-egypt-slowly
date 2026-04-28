import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { UserRoleProvider } from "@/hooks/useUserRole";
import { AuthProvider } from "@/hooks/useAuth";
import RouteGuard from "@/components/RouteGuard";
import Index from "./pages/Index.tsx";
import Splash from "./pages/Splash.tsx";
import ExperienceDetail from "./pages/ExperienceDetail.tsx";
import TripDetail from "./pages/TripDetail.tsx";
import AudioTourDetail from "./pages/AudioTourDetail.tsx";
import CauseDetail from "./pages/CauseDetail.tsx";
import OrganizationDetail from "./pages/OrganizationDetail.tsx";
import Wishlists from "./pages/Wishlists.tsx";
import Inbox from "./pages/Inbox.tsx";
import Profile from "./pages/Profile.tsx";
import RegionDetail from "./pages/RegionDetail.tsx";
import CityDetail from "./pages/CityDetail.tsx";
import PersonDetail from "./pages/PersonDetail.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import CultureActorDetail from "./pages/CultureActorDetail.tsx";
import AccommodationDetail from "./pages/AccommodationDetail.tsx";
import HostDetail from "./pages/HostDetail.tsx";
import TransportDetail from "./pages/TransportDetail.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import PartnerDetail from "./pages/PartnerDetail.tsx";
import ImpactDashboard from "./pages/ImpactDashboard.tsx";
import BadgesQuests from "./pages/BadgesQuests.tsx";
import Settings from "./pages/Settings.tsx";
import HelpSupport from "./pages/HelpSupport.tsx";
import CauseSupportGift from "./pages/CauseSupportGift.tsx";
import CauseSupportDonate from "./pages/CauseSupportDonate.tsx";
import CauseSupportVolunteer from "./pages/CauseSupportVolunteer.tsx";
import CauseSupportConsult from "./pages/CauseSupportConsult.tsx";
import Booking from "./pages/Booking.tsx";
import EventCalendar from "./pages/EventCalendar.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProviderProfile from "./pages/ProviderProfile.tsx";
// Provider Dashboards
import CultureActorDashboard from "./pages/dashboards/CultureActorDashboard.tsx";
import ServiceProviderDashboard from "./pages/dashboards/ServiceProviderDashboard.tsx";
import WhosWhoDashboard from "./pages/dashboards/WhosWhoDashboard.tsx";
import OrganizationDashboard from "./pages/dashboards/OrganizationDashboard.tsx";
import AmbassadorDashboard from "./pages/dashboards/AmbassadorDashboard.tsx";
import ProductSellerDashboard from "./pages/dashboards/ProductSellerDashboard.tsx";
import TripOrganizerDashboard from "./pages/dashboards/TripOrganizerDashboard.tsx";
import SubjectExpertDashboard from "./pages/dashboards/SubjectExpertDashboard.tsx";
import NarratorDashboard from "./pages/dashboards/NarratorDashboard.tsx";
import MyAudioTours from "./pages/dashboards/MyAudioTours.tsx";
import NewAudioTour from "./pages/dashboards/NewAudioTour.tsx";
import NewExperience from "./pages/dashboards/NewExperience.tsx";
import NewArticle from "./pages/dashboards/NewArticle.tsx";
import NewProduct from "./pages/dashboards/NewProduct.tsx";
import NewTrip from "./pages/dashboards/NewTrip.tsx";
import NewSession from "./pages/dashboards/NewSession.tsx";
import NewProgram from "./pages/dashboards/NewProgram.tsx";
import NewFlagReport from "./pages/dashboards/NewFlagReport.tsx";
import NewCollection from "./pages/dashboards/NewCollection.tsx";
import Community from "./pages/Community.tsx";
import ItineraryPlanner from "./pages/ItineraryPlanner.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AllPosts from "./pages/AllPosts.tsx";
import AllAudioTours from "./pages/AllAudioTours.tsx";
import AllCauses from "./pages/AllCauses.tsx";
import VisitorProfile from "./pages/VisitorProfile.tsx";
import StatusesFeed from "./pages/StatusesFeed.tsx";
// Provider Management Pages
import MyContent from "./pages/dashboards/MyContent.tsx";
import MyListings from "./pages/dashboards/MyListings.tsx";
import MyProducts from "./pages/dashboards/MyProducts.tsx";
import MyTrips from "./pages/dashboards/MyTrips.tsx";
import MyPrograms from "./pages/dashboards/MyPrograms.tsx";
import MyCollections from "./pages/dashboards/MyCollections.tsx";
import MyTasks from "./pages/dashboards/MyTasks.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <UserRoleProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteGuard>
              <Routes>
            <Route path="/welcome" element={<Splash />} />
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/audio-tours" element={<AllAudioTours />} />
            <Route path="/audio-tour/:id" element={<AudioTourDetail />} />
            <Route path="/causes" element={<AllCauses />} />
            <Route path="/cause/:id" element={<CauseDetail />} />
            <Route path="/organization/:id" element={<OrganizationDetail />} />
            <Route path="/cause/:id/gift" element={<CauseSupportGift />} />
            <Route path="/cause/:id/donate" element={<CauseSupportDonate />} />
            <Route path="/cause/:id/volunteer" element={<CauseSupportVolunteer />} />
            <Route path="/cause/:id/consult" element={<CauseSupportConsult />} />
            <Route path="/region/:regionId" element={<RegionDetail />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/city/:cityId" element={<CityDetail />} />
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
            <Route path="/wishlists" element={<Wishlists />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/impact" element={<ImpactDashboard />} />
            <Route path="/profile/badges" element={<BadgesQuests />} />
            <Route path="/profile/settings" element={<Settings />} />
            <Route path="/profile/help" element={<HelpSupport />} />
            {/* Provider Dashboards */}
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
          </RouteGuard>
        </BrowserRouter>
        </AuthProvider>
        </UserRoleProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;