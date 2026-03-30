import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index.tsx";
import Splash from "./pages/Splash.tsx";
import ExperienceDetail from "./pages/ExperienceDetail.tsx";
import TripDetail from "./pages/TripDetail.tsx";
import AudioTourDetail from "./pages/AudioTourDetail.tsx";
import CauseDetail from "./pages/CauseDetail.tsx";
import Wishlists from "./pages/Wishlists.tsx";
import Inbox from "./pages/Inbox.tsx";
import Profile from "./pages/Profile.tsx";
import RegionDetail from "./pages/RegionDetail.tsx";
import CityDetail from "./pages/CityDetail.tsx";
import PersonDetail from "./pages/PersonDetail.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import AccommodationDetail from "./pages/AccommodationDetail.tsx";
import TransportDetail from "./pages/TransportDetail.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Splash />} />
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/audio-tour/:id" element={<AudioTourDetail />} />
            <Route path="/cause/:id" element={<CauseDetail />} />
            <Route path="/cause/:id/gift" element={<CauseSupportGift />} />
            <Route path="/cause/:id/donate" element={<CauseSupportDonate />} />
            <Route path="/cause/:id/volunteer" element={<CauseSupportVolunteer />} />
            <Route path="/cause/:id/consult" element={<CauseSupportConsult />} />
            <Route path="/region/:regionId" element={<RegionDetail />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/city/:cityId" element={<CityDetail />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/stay/:id" element={<AccommodationDetail />} />
            <Route path="/transport/:id" element={<TransportDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/wishlists" element={<Wishlists />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/impact" element={<ImpactDashboard />} />
            <Route path="/profile/badges" element={<BadgesQuests />} />
            <Route path="/profile/settings" element={<Settings />} />
            <Route path="/profile/help" element={<HelpSupport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
