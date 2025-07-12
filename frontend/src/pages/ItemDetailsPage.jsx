import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import axiosInstance from "../lib/axios";

const ItemDetailPage = () => {
  const { id } = useParams(); // assuming route: /item/:id
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axiosInstance.get(`/item/${id}`);
        setItem(res.data.item);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading item...</p>;
  if (!item) return <p className="text-center py-10">Item not found</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card className="aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={item.mainImage}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </Card>
          <div className="grid grid-cols-3 gap-3">
            {item.additionalImages?.map((img, i) => (
              <Card key={i} className="aspect-[3/4] overflow-hidden">
                <img
                  src={img}
                  alt={`img-${i}`}
                  className="w-full h-full object-cover"
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <Badge
            variant={item.status === "available" ? "default" : "destructive"}
          >
            {item.status === "available" ? "Available" : "Swapped"}
          </Badge>

          <p className="text-sm text-muted-foreground">Category: {item.category}</p>
          <p className="text-sm text-muted-foreground">Size: {item.size}</p>
          <p className="text-sm text-muted-foreground">
            Uploader: <span className="font-medium">@{item.uploader?.username}</span>
          </p>

          <div>
            <h3 className="font-medium mb-1">Description:</h3>
            <p className="text-sm">{item.description}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="default">Swap Request</Button>
            <Button variant="secondary">Redeem via Points</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
