import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, FileText, Package, Receipt, User, Building2, Download } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Separator } from '../../../../components/ui/separator';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { expenseAPI } from '../../../../services/api';
import { getMediaUrl } from '../../../../lib/mediaUtils';

interface ExpenseDetail {
  id: number;
  title: string;
  description: string;
  amount: string;
  category: number;
  category_name: string;
  vendor: number;
  vendor_name: string;
  expense_type: string;
  expense_type_display: string;
  expense_date: string;
  payment_method: string;
  payment_method_display: string;
  notes: string;
  due_balance_to_vendor: string;
  inventory_items: Array<{
    id: number;
    item_name: string;
    item_type: string | null;
    quantity: number;
    available_items: number;
    quantity_type: string;
  }>;
  dialysis_product: Array<{
    id: number;
    item_name: string;
    item_type: string;
    quantity: number;
    available_items: number;
    quantity_type: string;
  }>;
  created_at: string;
  updated_at: string;
  receipt_documents: Array<{
    id: number;
    expense_title: string;
    file_url: string;
    receipt_number: string;
    document_type: string;
    file: string;
    file_name: string;
    file_size: number;
    description: string;
    uploaded_at: string;
    expense: number;
  }>;
}

const ExpenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenseDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await expenseAPI.getExpenseById(parseInt(id));
        setExpense(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch expense details');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseDetail();
  }, [id]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodBadgeVariant = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'default';
      case 'card':
        return 'secondary';
      case 'bank_transfer':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getExpenseTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'dialysis':
        return 'default';
      case 'general':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/office-management/expense')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Expense Details</h1>
            <p className="text-muted-foreground">View expense information</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Error loading expense details</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/office-management/expense')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Expense Details</h1>
            <p className="text-muted-foreground">View expense information</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Expense not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/office-management/expense')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{expense.title}</h1>
          <p className="text-muted-foreground">Expense ID: #{expense.id}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount To Vendor</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expense.amount)}</div>
            <p className="text-xs text-muted-foreground">Expense amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Balance To Vendor</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expense.due_balance_to_vendor)}</div>
            <p className="text-xs text-muted-foreground">Outstanding to vendor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getPaymentMethodBadgeVariant(expense.payment_method)}>
              {expense.payment_method_display}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Payment type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{expense.category_name}</div>
            <Badge variant={getExpenseTypeBadgeVariant(expense.expense_type)} className="mt-2">
              {expense.expense_type_display}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{expense.vendor_name}</div>
            <p className="text-xs text-muted-foreground">Vendor ID: #{expense.vendor}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatDate(expense.expense_date)}</div>
            <p className="text-xs text-muted-foreground">Date of expense</p>
          </CardContent>
        </Card>
      </div>

      {/* Description and Notes */}
      {(expense.description || expense.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Description & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expense.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{expense.description}</p>
              </div>
            )}
            {expense.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-muted-foreground">{expense.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      {expense.inventory_items && expense.inventory_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Items associated with this expense ({expense.inventory_items.length} items)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
            <Table>
               <TableHeader className="sticky top-0 bg-muted z-10 border-t">
                 <TableRow>
                   <TableHead>Item Name</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Quantity</TableHead>
                   <TableHead>Available</TableHead>
                   <TableHead>Unit</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {expense.inventory_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.item_type || 'N/A'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.available_items}</TableCell>
                    <TableCell>{item.quantity_type || 'N/A'}</TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialysis Products */}
      {expense.dialysis_product && expense.dialysis_product.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dialysis Products</CardTitle>
            <CardDescription>
              Medical products associated with this expense ({expense.dialysis_product.length} products)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
            <Table>
               <TableHeader className="bg-muted border-t">
                 <TableRow>
                   <TableHead>Product Name</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Quantity</TableHead>
                   <TableHead>Available</TableHead>
                   <TableHead>Unit</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {expense.dialysis_product.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.item_name}</TableCell>
                    <TableCell>{product.item_type}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.available_items}</TableCell>
                    <TableCell>{product.quantity_type}</TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Documents */}
      {expense.receipt_documents && expense.receipt_documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt Documents</CardTitle>
            <CardDescription>
              Documents and receipts for this expense ({expense.receipt_documents.length} documents)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expense.receipt_documents.map((doc) => (
                <div key={doc.id} className="flex flex-wrap gap-3 items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Receipt #{doc.receipt_number} • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {formatDateTime(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const documentUrl = getMediaUrl(doc.file_url);
                        if (documentUrl) {
                          window.open(documentUrl, '_blank');
                        } else {
                          console.error('Unable to construct document URL');
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const documentUrl = getMediaUrl(doc.file_url);
                        if (documentUrl) {
                          const link = document.createElement('a');
                          link.href = documentUrl;
                          link.download = doc.file_name;
                          link.click();
                        } else {
                          console.error('Unable to construct document URL');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Created</h4>
              <p className="text-sm text-muted-foreground">{formatDateTime(expense.created_at)}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Last Updated</h4>
              <p className="text-sm text-muted-foreground">{formatDateTime(expense.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseDetailPage;
