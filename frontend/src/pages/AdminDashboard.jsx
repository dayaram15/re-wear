import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { Shield, Users, Package, TrendingUp, Calendar, User, Mail, Crown } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [addPointsDialog, setAddPointsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchDashboardData();
      fetchPendingItems();
      fetchUsers();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingItems = async () => {
    setItemsLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/items/pending?page=${currentPage}`);
      setPendingItems(response.data);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending items');
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/users?page=${usersPage}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleItemModeration = async (itemId, action, reason = '') => {
    try {
      await axiosInstance.post(`/admin/items/${itemId}/moderate`, { action, reason });
      toast.success(`Item ${action}ed successfully`);
      fetchPendingItems();
      fetchDashboardData();
    } catch (error) {
      console.error('Error moderating item:', error);
      toast.error('Failed to moderate item');
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      await axiosInstance.post(`/admin/users/${userId}/toggle-admin`);
      toast.success('Admin status updated');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleAddPoints = async () => {
    if (!selectedUser || pointsToAdd <= 0) {
      toast.error('Please select a user and enter valid points');
      return;
    }

    try {
      await axiosInstance.post(`/admin/users/${selectedUser.id}/add-points`, {
        points: pointsToAdd
      });
      toast.success(`${pointsToAdd} points added to user`);
      setAddPointsDialog(false);
      setSelectedUser(null);
      setPointsToAdd(0);
      fetchUsers();
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto p-6 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, description }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, items, and platform statistics</p>
        </div>

        {/* Statistics */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-8 w-8" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={dashboardData.stats.total_users}
              icon={Users}
              description="Registered users"
            />
            <StatCard
              title="Total Items"
              value={dashboardData.stats.total_items}
              icon={Package}
              description="Listed items"
            />
            <StatCard
              title="Pending Items"
              value={dashboardData.stats.pending_items}
              icon={TrendingUp}
              description="Awaiting approval"
            />
            <StatCard
              title="Completed Swaps"
              value={dashboardData.stats.completed_swaps}
              icon={Calendar}
              description="Successful exchanges"
            />
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Pending Items</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
            ) : dashboardData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recent_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by @{item.uploader} • {item.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.approved ? 'default' : 'secondary'}>
                              {item.approved ? 'Approved' : 'Pending'}
                            </Badge>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Swaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recent_swaps.map((swap) => (
                        <div key={swap.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{swap.swap_type} swap</p>
                            <p className="text-sm text-muted-foreground">
                              by @{swap.requester} • {new Date(swap.created_at).toLocaleDateString()}
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pending Items</h2>
              <Button onClick={fetchPendingItems} variant="outline">Refresh</Button>
            </div>

            {itemsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-20 h-24 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : pendingItems.items?.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending items to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingItems.items?.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-24 rounded overflow-hidden bg-muted">
                        {item.images[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              by @{item.uploader.username} • {item.category}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleItemModeration(item.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleItemModeration(item.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{item.condition}</Badge>
                          {item.size && <Badge variant="outline">{item.size}</Badge>}
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Pagination */}
                {pendingItems.pagination && pendingItems.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1));
                        fetchPendingItems();
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm">
                      Page {currentPage} of {pendingItems.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(Math.min(pendingItems.pagination.pages, currentPage + 1));
                        fetchPendingItems();
                      }}
                      disabled={currentPage === pendingItems.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Dialog open={addPointsDialog} onOpenChange={setAddPointsDialog}>
                <DialogTrigger asChild>
                  <Button>Add Points</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Points to User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select User</Label>
                      <Select onValueChange={(value) => setSelectedUser(users.users?.find(u => u.id.toString() === value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.users?.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              @{user.username} ({user.points_balance} pts)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Points to Add</Label>
                      <Input
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                        placeholder="Enter points"
                        min="1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddPoints} className="flex-1">Add Points</Button>
                      <Button variant="outline" onClick={() => setAddPointsDialog(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {usersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : users.users?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.users?.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">@{user.username}</h3>
                            {user.is_admin && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.stats.items_count} items • {user.stats.swaps_count} swaps
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{user.points_balance} points</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={user.is_admin ? "destructive" : "outline"}
                            onClick={() => handleToggleAdmin(user.id)}
                            disabled={user.id === user.id} // Can't modify own admin status
                          >
                            {user.is_admin ? "Remove Admin" : "Make Admin"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Pagination */}
                {users.pagination && users.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUsersPage(Math.max(1, usersPage - 1));
                        fetchUsers();
                      }}
                      disabled={usersPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm">
                      Page {usersPage} of {users.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUsersPage(Math.min(users.pagination.pages, usersPage + 1));
                        fetchUsers();
                      }}
                      disabled={usersPage === users.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
