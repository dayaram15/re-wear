import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [listings, setListings] = useState([]);

  const fetchListings = async () => {
    try {
      const res = await axios.get("http://localhost:4002/api/v1/item/listings", {
        withCredentials: true,
      });
      setListings(res.data.items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load listings");
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleStatusChange = async (itemId, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:4002/api/v1/item/${itemId}/moderate`,
        { status },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Updated successfully");
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-primary">
        Admin Dashboard
      </h2>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid grid-cols-3 gap-4 mb-6">
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="orders">Manage Orders</TabsTrigger>
          <TabsTrigger value="listings">Manage Listings</TabsTrigger>
        </TabsList>

        {/* Users Placeholder */}
        <TabsContent value="users">
          <p className="text-center text-muted-foreground">User management coming soon.</p>
        </TabsContent>

        {/* Orders Placeholder */}
        <TabsContent value="orders">
          <p className="text-center text-muted-foreground">Order management coming soon.</p>
        </TabsContent>

        {/* Manage Listings */}
        <TabsContent value="listings">
          <div className="space-y-4">
            {listings.length === 0 ? (
              <p className="text-center text-muted-foreground">No listings found.</p>
            ) : (
              listings.map((item) => (
                <Card key={item._id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.mainImage}
                      alt={item.name}
                      className="w-20 h-24 rounded object-cover border"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{item.description}</p>
                      <span className="text-xs">Uploader: @{item.uploader?.username}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={item.status === "pending" ? "secondary" : "default"}>
                      {item.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusChange(item._id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(item._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
