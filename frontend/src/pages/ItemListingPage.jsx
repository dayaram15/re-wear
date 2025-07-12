import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import useItemStore from "@/store/itemStore";
import axiosInstance from "../lib/axios";

const ItemListingPage = () => {
  const { user, checkAuth } = useAuthStore();
  const { addItem } = useItemStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication when component mounts
    const verifyAuth = async () => {
      setAuthLoading(true);
      try {
        console.log('Current user state:', user);
        const isAuthenticated = await checkAuth();
        console.log('Authentication result:', isAuthenticated);
        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          toast.error("Please login to list an item");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Authentication failed");
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    
    // Only run auth check if user is not already authenticated
    if (!user) {
      verifyAuth();
    } else {
      setAuthLoading(false);
    }
  }, []); // Empty dependency array - only run once on mount

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: "",
    category: "",
    tags: "",
    condition: "Good",
    type: "General",
  });

  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImageAdd = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdditionalImages((prev) => [...prev, file]);
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      console.log('Current user from store:', user);
      console.log('Local storage auth data:', localStorage.getItem('auth-storage'));
      
      const response = await axiosInstance.get('/auth/test');
      console.log('Auth test successful:', response.data);
      toast.success('Authentication working!');
    } catch (error) {
      console.error('Auth test failed:', error);
      toast.error('Authentication failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const debugCookies = async () => {
    try {
      console.log('Debugging cookies...');
      const response = await axiosInstance.get('/auth/debug-cookies');
      console.log('Cookie debug response:', response.data);
      toast.success('Check console for cookie debug info');
    } catch (error) {
      console.error('Cookie debug failed:', error);
      toast.error('Cookie debug failed: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.username) {
      toast.error("Please login to list an item");
      navigate("/login");
      return;
    }
    if (!mainImage) return toast.error("Main image is required");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("size", formData.size);
    data.append("category", formData.category);
    data.append("tags", formData.tags);
    data.append("condition", formData.condition);
    data.append("type", formData.type);
    data.append("mainImage", mainImage);
    additionalImages.forEach((file) => data.append("additionalImages", file));
    data.append("uploader", user.username);

    setLoading(true);
    try {
      const res = await axiosInstance.post("/items/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success(res.data.message || "Item listed successfully");
      if (res.data.item) addItem(res.data.item);

      setFormData({
        name: "",
        description: "",
        size: "",
        category: "",
        tags: "",
        condition: "Good",
        type: "General",
      });
      setMainImage(null);
      setAdditionalImages([]);
      setPreview(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please login to list an item.</p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          List a New Clothing Item
        </h2>
        <div className="flex gap-2">
          <Button onClick={testAuth} variant="outline" size="sm">
            Test Auth
          </Button>
          <Button onClick={debugCookies} variant="outline" size="sm">
            Debug Cookies
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Images */}
        <div className="space-y-4">
          <Label>Main Image Preview</Label>
          <Card className="h-64 w-full max-w-sm mx-auto overflow-hidden bg-muted rounded-xl flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Preview" className="object-cover h-full w-full" />
            ) : (
              <span className="text-muted-foreground text-sm">No image selected</span>
            )}
          </Card>

          <div className="space-y-2">
            <Label>Upload Main Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Additional Images (one at a time)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAdditionalImageAdd}
            />
            <p className="text-sm text-muted-foreground">
              {additionalImages.length} image{additionalImages.length !== 1 ? "s" : ""} added
            </p>
          </div>

          {additionalImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {additionalImages.map((img, index) => (
                <div key={index} className="relative">
                  <Card className="overflow-hidden aspect-[3/4]">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </Card>
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Info */}
        <div className="space-y-4">
          <div>
            <Label>Item Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="my-2"
              placeholder="E.g., Blue Denim Jacket"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="my-2"
              rows={5}
              placeholder="Brief description of the item..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Size</Label>
              <Input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., M, L, XL"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Jacket, Shirt"
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <Input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., casual, denim, eco-friendly"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Condition</Label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border bg-background text-text"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <Label>Type</Label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border bg-background text-text"
              >
                <option value="General">General</option>
                <option value="Ethnic">Ethnic</option>
                <option value="Formal">Formal</option>
                <option value="Party Wear">Party Wear</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={loading}>
            {loading ? "Uploading..." : "List Item"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemListingPage;
