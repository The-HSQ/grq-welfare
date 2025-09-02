import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Calendar, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { dialysisAPI } from "@/services/api";

interface ItemDetail {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  new_quantity: number;
  quantity_type: string;
  used_items: number;
  available_items: number;
  created_at: string;
  updated_at: string;
}

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dialysisAPI.getProductById(id!);
      setItem(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch item details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/dialysis-center/items")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested item could not be found.</p>
          <Button onClick={() => navigate("/dialysis-center/items")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dialysis-center/items")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.item_name}</h1>
            <p className="text-muted-foreground">Item Details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                  <p className="text-lg font-semibold">{item.item_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Type</label>
                  <p className="text-lg font-semibold">{item.item_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity Type</label>
                  <p className="text-lg font-semibold capitalize">{item.quantity_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Quantity</label>
                  <p className="text-lg font-semibold">{item.quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Status */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Current stock levels and usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{item.available_items}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{item.used_items}</div>
                  <div className="text-sm text-muted-foreground">Used</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">{item.new_quantity}</div>
                  <div className="text-sm text-muted-foreground">New</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {item.quantity > 0 ? Math.round((item.used_items / item.quantity) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.quantity > 0 ? (item.used_items / item.quantity) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm font-semibold">{formatDate(item.created_at)}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(item.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm font-semibold">{formatDate(item.updated_at)}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(item.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Quantity
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingDown className="h-4 w-4 mr-2" />
                Use Items
              </Button>
              <Button className="w-full" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Edit Item
              </Button>
            </CardContent>
          </Card>

          {/* Item Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item Type:</span>
                <Badge variant="outline">{item.item_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quantity Type:</span>
                <Badge variant="outline" className="capitalize">{item.quantity_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant={item.available_items > 0 ? "default" : "destructive"}
                  className={item.available_items > 0 ? "bg-green-600" : ""}
                >
                  {item.available_items > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
