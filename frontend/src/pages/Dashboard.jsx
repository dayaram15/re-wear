import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [mySwaps, setMySwaps] = useState([]);
  const [receivedSwaps, setReceivedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [itemsRes, swapsRes, receivedRes] = await Promise.all([
        axiosInstance.get('/items/my-items'),
        axiosInstance.get('/swap/my-requests'),
        axiosInstance.get('/swap/received-requests')
      ]);

      setMyItems(itemsRes.data.items);
      setMySwaps(swapsRes.data.swaps);
      setReceivedSwaps(receivedRes.data.swaps);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapResponse = async (swapId, action) => {
    try {
      await axiosInstance.post(`/swap/${swapId}/respond`, { action });
      toast.success(`Swap request ${action}ed successfully`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error responding to swap:', error);
      toast.error('Failed to respond to swap request');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-muted-foreground">Please login to view your dashboard.</p>
      </div>
    );
  }

  const handleDeleteItem = async (itemId, itemTitle, e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete button
    
    if (!confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/items/${itemId}`);
      toast.success('Item deleted successfully');
      fetchDashboardData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const ItemCard = ({ item }) => (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer relative group" onClick={() => navigate(`/item/${item.id}`)}>
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img 
            src={item.images[0] || '/placeholder-item.jpg'} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Delete button overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => handleDeleteItem(item.id, item.title, e)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
          <Badge variant={item.approved ? 'default' : 'secondary'}>
            {item.approved ? 'Approved' : 'Pending'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <Badge variant="outline">{item.category}</Badge>
          <Badge variant={item.status === 'available' ? 'default' : 'destructive'}>
            {item.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const SwapCard = ({ swap, type = 'sent' }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">{swap.requested_item.title}</h3>
          <p className="text-sm text-muted-foreground">
            {type === 'sent' ? 'Requested from' : 'Requested by'} {type === 'sent' ? swap.requested_item.uploader : swap.requester.username}
          </p>
        </div>
        <Badge variant={
          swap.status === 'accepted' ? 'default' : 
          swap.status === 'rejected' ? 'destructive' : 
          'secondary'
        }>
          {swap.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm font-medium">Swap Type</p>
          <p className="text-sm text-muted-foreground capitalize">{swap.swap_type}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Date</p>
          <p className="text-sm text-muted-foreground">
            {new Date(swap.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {swap.offered_item && (
        <div className="mb-3">
          <p className="text-sm font-medium">Offered Item</p>
          <p className="text-sm text-muted-foreground">{swap.offered_item.title}</p>
        </div>
      )}

      {type === 'received' && swap.status === 'pending' && (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => handleSwapResponse(swap.id, 'accept')}
          >
            Accept
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleSwapResponse(swap.id, 'reject')}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-8 pt-20">
      {/* Profile Section */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-6 py-6">
          <div className="flex justify-center md:justify-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>

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
              <p className="text-sm text-muted-foreground">Points Balance</p>
              <p className="font-semibold">{user.points_balance || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-semibold capitalize">{user.is_admin ? 'Admin' : 'User'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">My Items ({myItems.length})</TabsTrigger>
          <TabsTrigger value="sent-swaps">Sent Requests ({mySwaps.length})</TabsTrigger>
          <TabsTrigger value="received-swaps">Received Requests ({receivedSwaps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Listings</h2>
            <Button onClick={() => navigate('/add-item')}>Add New Item</Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader className="p-0">
                    <Skeleton className="aspect-square rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No items listed yet.</p>
              <Button onClick={() => navigate('/add-item')}>List Your First Item</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {myItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent-swaps" className="space-y-4">
          <h2 className="text-xl font-semibold">My Swap Requests</h2>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : mySwaps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No swap requests sent yet.</p>
              <Button onClick={() => navigate('/browse')}>Browse Items</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mySwaps.map((swap) => (
                <SwapCard key={swap.id} swap={swap} type="sent" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received-swaps" className="space-y-4">
          <h2 className="text-xl font-semibold">Received Swap Requests</h2>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : receivedSwaps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No swap requests received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedSwaps.map((swap) => (
                <SwapCard key={swap.id} swap={swap} type="received" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
