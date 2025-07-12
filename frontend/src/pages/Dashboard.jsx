import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const dummyListings = [1, 2, 3]; // Replace with real data
const dummyPurchases = [1, 2]; // Replace with real data

const Dashboard = () => {
//   const { user } = useAuthStore();
const user = {
    username : "dayaram",
    email : "dayaram@gmail.com",
    points : 5,
    role : "user"
}

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-muted-foreground">Please login to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 🔵 Top Profile Section */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-6 py-6">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-semibold">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="font-semibold">{user.points ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-semibold capitalize">{user.role ?? "user"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🧵 My Listings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">My Listings</h2>
        {dummyListings.length === 0 ? (
          <p className="text-muted-foreground">No items listed yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dummyListings.map((item, index) => (
              <Card key={index} className="aspect-[3/4] bg-gray-100" />
            ))}
          </div>
        )}
      </section>

      {/* 🛒 My Purchases / Swaps */}
      <section>
        <h2 className="text-xl font-semibold mb-4">My Purchases / Swaps</h2>
        {dummyPurchases.length === 0 ? (
          <p className="text-muted-foreground">No swaps or purchases yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dummyPurchases.map((item, index) => (
              <Card key={index} className="aspect-[3/4] bg-gray-100" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
