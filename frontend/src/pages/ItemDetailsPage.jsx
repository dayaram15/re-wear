import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "../lib/axios";
import useAuthStore from "@/store/authStore";
import { ChevronLeft, ChevronRight, Heart, Share2, User, Calendar, Tag } from "lucide-react";

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [swapType, setSwapType] = useState('direct');
  const [selectedItem, setSelectedItem] = useState('');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [myItems, setMyItems] = useState([]);
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => {
    fetchItem();
    if (user) {
      fetchMyItems();
    }
  }, [id, user]);

  const fetchItem = async () => {
    try {
      const res = await axiosInstance.get(`/items/${id}`);
      setItem(res.data.item);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const res = await axiosInstance.get('/items/my-items');
      setMyItems(res.data.items.filter(item => item.status === 'available'));
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!user) {
      toast.error("Please login to make a swap request");
      return;
    }

    if (item.uploader.id === user.id) {
      toast.error("You cannot request your own item");
      return;
    }

    setSwapLoading(true);
    try {
      const swapData = {
        requested_item_id: parseInt(id),
        swap_type: swapType
      };

      if (swapType === 'direct') {
        if (!selectedItem) {
          toast.error("Please select an item to offer");
          return;
        }
        swapData.offered_item_id = parseInt(selectedItem);
      } else if (swapType === 'points') {
        if (pointsUsed <= 0) {
          toast.error("Please enter points to use");
          return;
        }
        if (pointsUsed > user.points_balance) {
          toast.error("Insufficient points");
          return;
        }
        swapData.points_used = pointsUsed;
      }

      await axiosInstance.post('/swap/request', swapData);
      toast.success("Swap request sent successfully!");
      setSwapDialogOpen(false);
      setSwapType('direct');
      setSelectedItem('');
      setPointsUsed(0);
    } catch (error) {
      console.error('Error creating swap request:', error);
      toast.error(error.response?.data?.message || "Failed to create swap request");
    } finally {
      setSwapLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-[4/5] bg-muted rounded-lg"></div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto p-6 text-center">
          <p className="text-lg text-muted-foreground">Item not found</p>
          <Button onClick={() => navigate('/browse')} className="mt-4">
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/browse')}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="aspect-[4/5] overflow-hidden bg-muted relative">
              {item.images.length > 0 ? (
                <>
                  <img
                    src={item.images[currentImageIndex]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {item.images.length}
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </Card>
            
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {item.images.map((img, i) => (
                  <Card 
                    key={i} 
                    className={`aspect-square overflow-hidden cursor-pointer ${
                      i === currentImageIndex ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(i)}
                  >
                    <img
                      src={img}
                      alt={`${item.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={item.status === "available" ? "default" : "destructive"}>
                  {item.status === "available" ? "Available" : "Swapped"}
                </Badge>
                <Badge variant="outline">{item.condition}</Badge>
                {item.size && <Badge variant="outline">{item.size}</Badge>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Uploaded by <span className="font-medium text-foreground">@{item.uploader.username}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Listed on {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Category: <span className="font-medium text-foreground">{item.category}</span></span>
              </div>
              {item.uploader.points_balance !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Uploader has <span className="font-medium text-foreground">{item.uploader.points_balance} points</span></span>
                </div>
              )}
            </div>

            {item.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )}

            {item.tags && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.split(',').map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag.trim()}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              {item.status === 'available' && user && item.uploader.id !== user.id ? (
                <Dialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">Request Swap</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Swap</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Swap Type</Label>
                        <Select value={swapType} onValueChange={setSwapType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="direct">Direct Swap</SelectItem>
                            <SelectItem value="points">Points Redemption</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {swapType === 'direct' && (
                        <div>
                          <Label>Select Item to Offer</Label>
                          <Select value={selectedItem} onValueChange={setSelectedItem}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an item to offer" />
                            </SelectTrigger>
                            <SelectContent>
                              {myItems.map((myItem) => (
                                <SelectItem key={myItem.id} value={myItem.id.toString()}>
                                  {myItem.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {myItems.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              You need to have available items to make a direct swap
                            </p>
                          )}
                        </div>
                      )}

                      {swapType === 'points' && (
                        <div>
                          <Label>Points to Use</Label>
                          <Input
                            type="number"
                            value={pointsUsed}
                            onChange={(e) => setPointsUsed(parseInt(e.target.value) || 0)}
                            placeholder="Enter points"
                            min="1"
                            max={user.points_balance}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Your balance: {user.points_balance} points
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSwapRequest} 
                          disabled={swapLoading || (swapType === 'direct' && !selectedItem) || (swapType === 'points' && pointsUsed <= 0)}
                          className="flex-1"
                        >
                          {swapLoading ? "Sending..." : "Send Request"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setSwapDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : item.status === 'available' && !user ? (
                <Button className="flex-1" onClick={() => navigate('/login')}>
                  Login to Request Swap
                </Button>
              ) : (
                <Button className="flex-1" disabled>
                  {item.status === 'available' ? 'Your Item' : 'Not Available'}
                </Button>
              )}
              
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
