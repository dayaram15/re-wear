import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

const Home = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [page, search, category]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/items/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12'
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await axiosInstance.get(`/items/?${params}`);
      setItems(response.data.items);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleCategoryChange = (value) => {
    setCategory(value === 'all' ? '' : value);
    setPage(1);
  };

  const ItemCard = ({ item }) => (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/item/${item.id}`)}>
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

  const ItemList = ({ item }) => (
    <Card className="flex hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/item/${item.id}`)}>
      <div className="w-32 h-32 overflow-hidden rounded-l-lg">
        <img 
          src={item.images[0] || '/placeholder-item.jpg'} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <Badge variant={item.condition === 'Excellent' ? 'default' : 'secondary'}>
            {item.condition}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="outline">{item.category}</Badge>
            {item.size && <Badge variant="outline">{item.size}</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">by {item.uploader.username}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Items</h1>
          <p className="text-muted-foreground">Discover and exchange clothing with the community</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="text-sm text-muted-foreground">
                {items.length} items found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {Array.from({ length: 8 }).map((_, i) => (
              viewMode === 'grid' ? (
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
              ) : (
                <Card key={i} className="flex">
                  <Skeleton className="w-32 h-32 rounded-l-lg" />
                  <CardContent className="flex-1 p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No items found</p>
            <Button onClick={() => navigate('/add-item')}>List an Item</Button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {items.map((item) => (
                viewMode === 'grid' ? (
                  <ItemCard key={item.id} item={item} />
                ) : (
                  <ItemList key={item.id} item={item} />
                )
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;