import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";

export default async function AdminDashboardPage() {
  try {
    // Fetch analytics data using the server-side tRPC API
    // Now we get all stats in a single API call
    const stats = await api.analytics.getDailyStats();

    return (
      <div className="container p-6">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Unique Visitors Today</CardTitle>
              <CardDescription>
                Distinct users visiting your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.uniqueVisitorsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Views Today</CardTitle>
              <CardDescription>
                Product views in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.listingViewCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>
                Orders with &quot;Paid&quot; status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pendingOrdersCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return (
      <div className="container p-6">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <p>Error loading analytics data. Please try again later.</p>
      </div>
    );
  }
}
