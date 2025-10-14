import React, { useState, useEffect } from "react";
import {
  DocumentManager,
  type BaseDocument,
} from "@/components/common/DocumentManager";
import { Expense } from "../../../../store/slices/expenseSlice";
import api from "../../../../lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  UploadIcon,
  Loader2Icon,
  PlusIcon,
  AlertCircleIcon,
  FileIcon,
} from "lucide-react";

// Interface for expense documents based on the API response
export interface ExpenseDocument extends BaseDocument {
  id: number;
  expense_title: string;
  document_type_display: string;
  file_url: string;
  receipt_number: string;
  document_type: string;
  file: string;
  file_name: string;
  file_size: number;
  description: string;
  uploaded_at: string;
  expense: number;
  // Map to BaseDocument interface
  document_name: string;
  document_path: string;
  file_extension: string;
  is_image: boolean;
  is_pdf: boolean;
  uploaded_by_name: string;
}

interface ExpenseDocumentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onDocumentChange?: () => void;
}

export const ExpenseDocumentManager: React.FC<ExpenseDocumentManagerProps> = ({
  open,
  onOpenChange,
  expense,
  onDocumentChange,
}) => {
  const [documents, setDocuments] = useState<ExpenseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    receipt_number: "",
    description: "",
    document_path: null as File | null,
    document_type: "",
  });

  // Fetch documents when modal opens and expense changes
  useEffect(() => {
    if (open && expense) {
      fetchDocuments();
      // Clear any previous errors when opening the modal
      setUploadError(null);
      setDeleteError(null);
    }
  }, [open, expense]);

  const fetchDocuments = async () => {
    if (!expense) return;

    setIsLoading(true);
    try {
      const response = await api.get(
        `/financial/receipt-documents/by_expense/?expense_id=${expense.id}`
      );
      const fetchedDocuments = response.data.map((doc: any) => ({
        ...doc,
        // Map API response to BaseDocument interface
        document_name:
          doc.file_name || doc.receipt_number || `Document ${doc.id}`,
        document_path: doc.file_url || doc.file,
        file_extension: doc.file_name
          ? doc.file_name.split(".").pop()?.toLowerCase() || "pdf"
          : "pdf",
        is_image:
          doc.document_type === "image" ||
          (doc.file_name &&
            /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.file_name)),
        is_pdf:
          doc.document_type === "receipt" ||
          (doc.file_name && doc.file_name.toLowerCase().endsWith(".pdf")),
        uploaded_by_name: "System", // API doesn't provide this, using default
      }));
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.delete(`/financial/receipt-documents/${documentId}/`);
      // Remove the deleted document from the local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      onDocumentChange?.();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      setDeleteError(
        error?.response?.data?.message || "Failed to delete document"
      );
      throw error; // Re-throw to let DocumentManager handle the error
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpload = async () => {
    if (!expense) {
      throw new Error("No expense selected");
    }

    if (!uploadForm.receipt_number.trim()) {
      setUploadError("Receipt number is required");
      return;
    }

    if (!uploadForm.document_path) {
      setUploadError("Please select a file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create a new FormData object with the correct field names for the API
      const uploadFormData = new FormData();

      // Add the expense ID (the API expects 'expense' field)
      uploadFormData.append("expense", expense.id.toString());

      // Add receipt number
      uploadFormData.append("receipt_number", uploadForm.receipt_number);

      // Add the file
      uploadFormData.append("file", uploadForm.document_path);

      // Add description if provided
      if (uploadForm.description) {
        uploadFormData.append("description", uploadForm.description);
      }

      // Add document type
      uploadFormData.append("document_type", uploadForm.document_type);

      // Upload the document
      const response = await api.post(
        "/financial/receipt-documents/",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Reset form
      setUploadForm({
        receipt_number: "",
        description: "",
        document_path: null,
        document_type: "receipt",
      });
      setShowUploadForm(false);

      // Refresh the documents list after successful upload
      await fetchDocuments();
      onDocumentChange?.();

      return response.data;
    } catch (error: any) {
      console.error("Error uploading document:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload document";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, document_path: file }));
    }
  };

  const handleCancelUpload = () => {
    setUploadForm({
      receipt_number: "",
      description: "",
      document_path: null,
      document_type: "receipt",
    });
    setShowUploadForm(false);
    setUploadError(null);
  };

  if (!expense) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b bg-primary/5">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileIcon className="w-5 h-5 text-primary" />
            Receipt Documents for {expense.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            View, upload, and manage receipt documents for this expense
          </DialogDescription>
        </DialogHeader>

        {deleteError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{deleteError}</span>
          </div>
        )}

        {/* Upload Section */}
        <div className="px-6 py-4 border-b bg-gray-50/50">
          {!showUploadForm ? (
            <Button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Receipt Document</span>
            </Button>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-4">
                    <UploadIcon className="size-6 text-blue-600" />
                    Upload New Receipt Document
                  </CardTitle>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCancelUpload}
                    className="text-white hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {uploadError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{uploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="receipt_number"
                      className="text-sm font-medium text-gray-700"
                    >
                      Receipt Number *
                    </Label>
                    <Input
                      id="receipt_number"
                      value={uploadForm.receipt_number}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          receipt_number: e.target.value,
                        }))
                      }
                      placeholder="e.g., RCP-2024-001"
                      className="p-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="document_type"
                      className="text-sm font-medium text-gray-700"
                    >
                      Document Type *
                    </Label>
                    <Input
                      id="document_type"
                      value={uploadForm.document_type}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          document_type: e.target.value,
                        }))
                      }
                      placeholder="Enter document type"
                      className="p-3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter description (optional)"
                    rows={3}
                    className="resize-none p-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="document_path"
                    className="text-sm font-medium text-gray-700"
                  >
                    File *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <Input
                      id="document_path"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="border-0 p-0 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      PDF and image files only (max 10MB)
                    </p>
                  </div>
                  {uploadForm.document_path && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileIcon className="w-4 h-4 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">
                          {uploadForm.document_path.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(
                            uploadForm.document_path.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelUpload}
                    disabled={isUploading}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      isUploading ||
                      !uploadForm.receipt_number.trim() ||
                      !uploadForm.document_path
                    }
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="px-6 py-4">
              <div className="text-center text-gray-500">
                Loading documents...
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-2 py-12">
              <FileIcon className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                This expense doesn't have any receipt documents yet. Click "Add
                Receipt Document" to upload the first one.
              </p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Documents ({documents.length})
                </h3>
              </div>

              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FileIcon className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {doc.receipt_number || doc.file_name}
                              </h4>
                              {doc.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}

                              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FileIcon className="w-3 h-3" />
                                  <span>
                                    {(doc.file_size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {doc.document_type_display ||
                                      doc.document_type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>
                                    {new Date(
                                      doc.uploaded_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    doc.file_url || doc.file,
                                    "_blank"
                                  )
                                }
                                className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none"
                              >
                                <FileIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                                disabled={isDeleting}
                                className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                              >
                                {isDeleting ? (
                                  <Loader2Icon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FileIcon className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
