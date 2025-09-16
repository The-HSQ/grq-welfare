import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchInventoryItemDetail,
  clearItemDetail,
} from '../../../../store/slices/inventorySlice';
import { PageHeader } from '../../../common/PageHeader';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Skeleton } from '../../../ui/skeleton';
import { ArrowLeft, Package, Calendar, MapPin, Hash, TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';

const InventoryDetail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    itemDetail,
    itemDetailLoading,
    itemDetailError,
  } = useSelector((state: RootState) => state.inventory);

  // Fetch item detail on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchInventoryItemDetail(id));
    }
    
    // Clear item detail when component unmounts
    return () => {
      dispatch(clearItemDetail());
    };
  }, [dispatch, id]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/office-management/inventory');
  };

  // Loading skeleton
  if (itemDetailLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (itemDetailError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {itemDetailError}
        </div>
      </div>
    );
  }

  // No item found
  if (!itemDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
        
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Item Not Found</h3>
          <p className="text-muted-foreground">The requested inventory item could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center flex-wrap gap-4">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{itemDetail.item_name}</h1>
          <p className="text-muted-foreground">Inventory item details and statistics</p>
        </div>
      </div>

      {/* Item Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Information</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{itemDetail.item_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge variant="secondary" className="capitalize">
                  {itemDetail.item_type}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <Badge variant="outline" className="capitalize">
                  {itemDetail.inventory_type}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quantity Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantity Details</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Available Items</p>
                <p className="text-2xl font-bold text-green-600">{itemDetail.available_items}</p>
                <p className="text-xs text-muted-foreground">{itemDetail.quantity_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Statistics</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Used Items</p>
                <p className="text-2xl font-bold text-red-600">{itemDetail.total_used_items}</p>
                <p className="text-xs text-muted-foreground">{itemDetail.quantity_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Waste Items</p>
                <p className="text-2xl font-bold text-yellow-600">{itemDetail.total_waste_items}</p>
                <p className="text-xs text-muted-foreground">{itemDetail.quantity_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New Quantity Added</p>
                <p className="text-2xl font-bold text-blue-600">{itemDetail.new_quantity}</p>
                <p className="text-xs text-muted-foreground">{itemDetail.quantity_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timestamps</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(itemDetail.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(itemDetail.date).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(itemDetail.updated_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(itemDetail.updated_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Usage Percentage</p>
                <p className="text-2xl font-bold">
                  {itemDetail.quantity > 0 
                    ? Math.round((itemDetail.total_used_items / itemDetail.quantity) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining Percentage</p>
                <p className="text-2xl font-bold text-green-600">
                  {itemDetail.quantity > 0 
                    ? Math.round((itemDetail.available_items / itemDetail.quantity) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>
                {itemDetail.available_items === 0 ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : itemDetail.available_items < 10 ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Low Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    In Stock
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock Level</p>
                <p className="text-sm font-medium">
                  {itemDetail.available_items < 10 ? 'Low' : 'Good'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border">
              <p className="text-2xl font-bold text-red-600">{itemDetail.total_used_items}</p>
              <p className="text-sm text-muted-foreground">Used Items</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border">
              <p className="text-2xl font-bold text-yellow-600">{itemDetail.total_waste_items}</p>
              <p className="text-sm text-muted-foreground">Waste Items</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <p className="text-2xl font-bold text-green-600">{itemDetail.available_items}</p>
              <p className="text-sm text-muted-foreground">Available Items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Records */}
      {itemDetail.usage_records && itemDetail.usage_records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usage Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itemDetail.usage_records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Taken By</p>
                      <p className="text-sm font-medium">{record.taken_by}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Items Taken</p>
                      <p className="text-sm font-medium text-blue-600">{record.taken_items}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Items Used</p>
                      <p className="text-sm font-medium text-red-600">{record.itemused}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Items Wasted</p>
                      <p className="text-sm font-medium text-yellow-600">{record.item_waste}</p>
                    </div>
                  </div>
                  {record.comment && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">Comment</p>
                      <p className="text-sm">{record.comment}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(record.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryDetail;
