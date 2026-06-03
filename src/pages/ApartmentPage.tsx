import { Navigate, useParams } from "react-router-dom";

/**
 * Legacy /apartment/:id route. It used to render a second copy of
 * <PropertyDetails/>, creating a duplicate-content URL for every property.
 * We now 301-style redirect to the canonical /property-details/:id so search
 * engines and AI crawlers only ever see one URL per property.
 */
const ApartmentPage = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/property-details/${id ?? ""}`} replace />;
};

export default ApartmentPage;
