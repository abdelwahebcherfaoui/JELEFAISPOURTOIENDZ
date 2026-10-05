import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import { ServiceBookingAddressPage } from "./pages/ServiceBookingAddressPage";
import { ServiceBookingSummaryPage } from "./pages/ServiceBookingSummaryPage";
import { ClientMissionsPage } from "./pages/client/ClientMissionsPage";
import { NewMissionPage } from "./pages/client/NewMissionPage";
import { MissionDetailPage } from "./pages/client/MissionDetailPage";

function App() {
  return (
    <Routes>
      {/* Hors SiteLayout : pas de navbar/footer, une seule question, comme wecasa. */}
      <Route path="services/:slug/reserver" element={<ServiceBookingAddressPage />} />
      <Route path="services/:slug/recapitulatif" element={<ServiceBookingSummaryPage />} />

      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<SignupPage />} />
        <Route
          path="devenir-partenaire"
          element={<ComingSoonPage title="Devenir partenaire" />}
        />
        <Route
          path="conditions-generales"
          element={<ComingSoonPage title="Conditions générales d'utilisation" />}
        />
        <Route path="services/:slug" element={<ServiceDetailPage />} />

        {/* Espace client */}
        <Route element={<RequireAuth roles={["CLIENT"]} />}>
          <Route path="mes-demandes" element={<ClientMissionsPage />} />
          <Route path="mes-demandes/nouvelle" element={<NewMissionPage />} />
          <Route path="mes-demandes/:id" element={<MissionDetailPage />} />
        </Route>
        {/* Anciens liens conservés en redirection au cas où ils seraient encore mis en favoris. */}
        <Route path="devis" element={<Navigate to="/mes-demandes/nouvelle" replace />} />
        <Route path="demande-service" element={<Navigate to="/mes-demandes/nouvelle" replace />} />

        {/* Espace interne (admin/agent/partenaire) — pages réelles aux étapes 3 et 4 */}
        <Route element={<RequireAuth roles={["ADMIN", "AGENT", "PARTNER"]} />}>
          <Route path="espace-interne" element={<ComingSoonPage title="Espace interne" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
