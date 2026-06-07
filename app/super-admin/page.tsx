import { cookies } from "next/headers";

import AdminDashboard from "./_dashboard";
import AdminLogin from "./_login";

export default function SuperAdminPage() {
  const authed = cookies().get("sadmin_auth")?.value === "1";
  return authed ? <AdminDashboard /> : <AdminLogin />;
}
