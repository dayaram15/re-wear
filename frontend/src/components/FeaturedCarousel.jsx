import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedCarousel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const response = await axiosInstance.get('/items/?page=1&per_page=8');
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === Math.max(0, items.length - 4) ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, items.length - 4) : prevIndex - 1
    );
  };

  const ItemCard = ({ item }) => (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer min-w-[280px]" onClick={() => navigate(`/item/${item.id}`)}>
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img 
            src={item.images[0] || '/placeholder-item.jpg'} 
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
          <Badge variant={item.condition === 'Excellent' ? 'default' : 'secondary'}>
            {item.condition}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <Badge variant="outline">{item.category}</Badge>
          <span className="text-sm text-muted-foreground">by {item.uploader.username}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-0">
        <h2 className="text-2xl font-semibold mb-4 text-center">Featured Items</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="min-w-[280px]">
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
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-12 px-4 md:px-0">
        <h2 className="text-2xl font-semibold mb-4 text-center">Featured Items</h2>
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No items available yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Featured Items</h2>
        
        <div className="relative">
          {/* Navigation Buttons */}
          {items.length > 4 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Items Carousel */}
          <div className="flex gap-4 overflow-hidden">
            {items.slice(currentIndex, currentIndex + 4).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button onClick={() => navigate('/browse')} variant="outline">
            View All Items
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
