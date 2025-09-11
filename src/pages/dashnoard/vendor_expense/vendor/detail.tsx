import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVendorDetail,
  clearDetailError,
  clearVendorDetail,
} from "../../../../store/slices/vendorSlice";
import { RootState, AppDispatch } from "../../../../store";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "../../../../components/ui/skeleton";

const VendorDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { vendorDetail, detailLoading, detailError } = useSelector(
    (state: RootState) => state.vendors
  );

  // Fetch vendor detail on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchVendorDetail(parseInt(id)));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearVendorDetail());
    };
  }, [dispatch, id]);

  // Show error toast when there's an error
  useEffect(() => {
    if (detailError) {
      toast.error(detailError);
      dispatch(clearDetailError());
    }
  }, [detailError, dispatch]);

  const handleBack = () => {
    navigate("/office-management/vender");
  };

  const handleEdit = () => {
    if (vendorDetail) {
      navigate(`/office-management/vender/`);
    }
  };

  const handleDelete = () => {
    if (vendorDetail) {
      navigate(`/office-management/vender/`);
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!vendorDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vendor Not Found
              </h1>
              <p className="text-gray-600">
                The requested vendor could not be found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vendorDetail.name}
            </h1>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Vendor Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {vendorDetail.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Vendor Type
                  </label>
                  <Badge variant="secondary" className="w-fit">
                    {vendorDetail.vendor_type_display}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Contact Person
                  </label>
                  <p className="text-gray-900">{vendorDetail.contact_person}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Tax ID
                  </label>
                  <p className="text-gray-900 font-mono">
                    {vendorDetail.tax_id}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Payment Terms
                  </label>
                  <p className="text-gray-900">{vendorDetail.payment_terms}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-900">{vendorDetail.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information & Additional Details */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p>{vendorDetail.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p>{vendorDetail.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="text-gray-900">
                  {new Date(vendorDetail.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {new Date(vendorDetail.updated_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Vendor ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  #{vendorDetail.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expense Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Expense Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {vendorDetail.expense_count || 0}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                PKR{" "}
                {vendorDetail.total_expense_amount?.toLocaleString() || "0.00"}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      {vendorDetail.expenses && vendorDetail.expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Expenses ({vendorDetail.expenses.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {vendorDetail.expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="border rounded-lg p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {expense.description || "No description provided"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        PKR {parseFloat(expense.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Category
                      </label>
                      <p className="text-sm text-gray-900">
                        {expense.category_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Type
                      </label>
                      <p className="text-sm text-gray-900">
                        {expense.expense_type_display}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Payment Method
                      </label>
                      <p className="text-sm text-gray-900">
                        {expense.payment_method_display}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(expense.expense_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {expense.notes && (
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Notes
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {expense.notes}
                      </p>
                    </div>
                  )}

                  {/* Receipt Documents */}
                  {expense.receipt_documents &&
                    expense.receipt_documents.length > 0 && (
                      <div className="border-t pt-4">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                          Receipt Documents ({expense.receipt_documents.length})
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {expense.receipt_documents.map((receipt: any) => (
                            <div
                              key={receipt.id}
                              className="flex items-center justify-between p-3 bg-white border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {receipt.receipt_number}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {receipt.document_type} •{" "}
                                    {(receipt.file_size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `http://localhost:8000${receipt.file_url}`;
                                    link.download = receipt.file_name;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t">
                    <span>
                      Created:{" "}
                      {new Date(expense.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                    <span>
                      Updated:{" "}
                      {new Date(expense.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Expenses Message */}
      {(!vendorDetail.expenses || vendorDetail.expenses.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Expenses Found
            </h3>
            <p className="text-gray-600">
              This vendor doesn't have any expenses recorded yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorDetailPage;
