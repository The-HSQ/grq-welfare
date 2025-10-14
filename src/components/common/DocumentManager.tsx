import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveDeleteDialog } from '@/components/common/ResponsiveDeleteDialog';
import { 
  DownloadIcon, 
  FileIcon, 
  ImageIcon, 
  Loader2Icon, 
  UploadIcon, 
  PlusIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  AlertCircleIcon,
  Trash2Icon
} from 'lucide-react';
import { getMediaUrl, formatDateTime } from '../../lib/utils';

// Generic document interface that can be extended
export interface BaseDocument {
  id: number;
  document_name: string;
  description?: string;
  document_path: string;
  file_size: number;
  file_extension: string;
  is_image: boolean;
  is_pdf: boolean;
  uploaded_at: string;
  uploaded_by_name: string;
}

export interface DocumentManagerProps<T extends BaseDocument> {
  // Modal props
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  
  // Data props
  documents: T[];
  entityName: string; // e.g., "patient", "donor", etc.
  entityId: string;
  
  // Loading states
  isLoading?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
  uploadError?: string | null;
  
  // Callbacks
  onDocumentChange?: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  onDelete: (documentId: number) => Promise<void>;
  
  // Optional customization
  allowedFileTypes?: {
    document: string[];
    image: string[];
  };
  maxFileSize?: number; // in MB
  showUploadForm?: boolean;
  customDocumentType?: boolean;
}

export const DocumentManager = <T extends BaseDocument>({
  open,
  onOpenChange,
  title,
  description = "View, upload, and manage documents and images",
  documents,
  entityName,
  entityId,
  isLoading = false,
  isUploading = false,
  isDeleting = false,
  uploadError = null,
  onDocumentChange,
  onUpload,
  onDelete,
  allowedFileTypes = {
    document: ['.pdf'],
    image: ['image/*']
  },
  maxFileSize = 10,
  showUploadForm: initialShowUploadForm = false,
  customDocumentType = true,
}: DocumentManagerProps<T>) => {
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [showUploadForm, setShowUploadForm] = useState(initialShowUploadForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<T | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    document_name: '',
    description: '',
    document_path: null as File | null,
    document_type: 'document' as 'document' | 'image',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleDownloadDocument = async (doc: T) => {
    const documentUrl = getMediaUrl(doc.document_path);
    if (documentUrl) {
      // Add to downloading state
      setDownloadingIds(prev => new Set(prev).add(doc.id));
      
      try {
        // Create a proper filename with extension
        const fileName = doc.document_name.includes('.') 
          ? doc.document_name 
          : `${doc.document_name}.${doc.file_extension}`;
        
        // Try to fetch the file first to handle CORS issues
        const response = await fetch(documentUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          // Create a temporary link element for download
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          
          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the object URL
          window.URL.revokeObjectURL(url);
        } else {
          // Fallback to direct link if fetch fails
          const link = document.createElement('a');
          link.href = documentUrl;
          link.download = fileName;
          link.target = '_blank';
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab
        window.open(documentUrl, '_blank');
      } finally {
        // Remove from downloading state
        setDownloadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(doc.id);
          return newSet;
        });
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (doc: T) => {
    if (doc.is_image) {
      return <ImageIcon className="w-5 h-5 text-primary" />;
    } else if (doc.is_pdf) {
      return <FileIcon className="w-5 h-5 text-primary" />;
    } else {
      return <FileIcon className="w-5 h-5 text-primary" />;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, document_path: file }));
    }
  };

  const validateFile = (file: File, type: 'document' | 'image'): string | null => {
    if (type === 'document') {
      const allowedExtensions = allowedFileTypes.document;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension) && !allowedExtensions.includes(file.type)) {
        return `Only ${allowedExtensions.join(', ')} files are allowed for documents`;
      }
    } else if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        return 'Only image files are allowed for images';
      }
    }
    
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    return null;
  };

  const handleUpload = async () => {
    if (!uploadForm.document_name.trim()) {
      alert('Please enter a document name');
      return;
    }
    
    if (!uploadForm.document_path) {
      alert('Please select a file');
      return;
    }

    const validationError = validateFile(uploadForm.document_path, uploadForm.document_type);
    if (validationError) {
      alert(validationError);
      return;
    }

    const formData = new FormData();
    formData.append(entityName, entityId);
    formData.append('document_name', uploadForm.document_name);
    formData.append('description', uploadForm.description);
    formData.append('document_path', uploadForm.document_path);

    try {
      await onUpload(formData);
      // Reset form
      setUploadForm({
        document_name: '',
        description: '',
        document_path: null,
        document_type: 'document',
      });
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Notify parent component that documents have changed
      onDocumentChange?.();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleCancelUpload = () => {
    setUploadForm({
      document_name: '',
      description: '',
      document_path: null,
      document_type: 'document',
    });
    setShowUploadForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = (doc: T) => {
    setDocumentToDelete(doc);
    setDeleteError(null); // Clear any previous errors
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    // Clear any previous errors
    setDeleteError(null);
    
    // Add to deleting state
    setDeletingIds(prev => new Set(prev).add(documentToDelete.id));
    
    try {
      await onDelete(documentToDelete.id);
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      setDeleteError(null);
      
      // Notify parent component that documents have changed
      onDocumentChange?.();
    } catch (error: any) {
      console.error('Delete failed:', error);
      const errorMessage = error?.message || 'Failed to delete document';
      setDeleteError(errorMessage);
    } finally {
      // Remove from deleting state
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentToDelete.id);
        return newSet;
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
    setDeleteError(null);
  };

  // Skeleton loading component for documents
  const DocumentSkeleton = ({ showDescription = true }: { showDescription?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon Skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="w-12 h-12 rounded-lg" />
          </div>
          
          {/* Document Info Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Document Name Skeleton */}
                <Skeleton className="h-5 w-3/4 mb-2" />
                
                {/* Description Skeleton - sometimes shown, sometimes not */}
                {showDescription && (
                  <>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </>
                )}
                
                {/* Document Details Skeleton */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-18" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getAcceptString = (type: 'document' | 'image'): string => {
    if (type === 'document') {
      return allowedFileTypes.document.join(',');
    } else {
      return allowedFileTypes.image.join(',');
    }
  };

  const getFileTypeDescription = (type: 'document' | 'image'): string => {
    if (type === 'document') {
      return `Only ${allowedFileTypes.document.join(', ')} files are allowed (max ${maxFileSize}MB)`;
    } else {
      return `Image files only (max ${maxFileSize}MB)`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Upload Section */}
        <div className="px-6 py-4 border-b bg-foreground/10">
          {!showUploadForm ? (
            <Button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Document/Image</span>
            </Button>
          ) : (
            <Card className="border-0 shadow-sm overflow-y-auto max-h-[70dvh]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg font-medium text-foreground flex items-center gap-4">
                    <UploadIcon className="size-6 text-primary" />
                    Upload New Document/Image
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
                  {customDocumentType && (
                    <div className="space-y-2">
                      <Label htmlFor="document_type" className="text-sm font-medium text-gray-700">
                        Document Type
                      </Label>
                      <Select
                        value={uploadForm.document_type}
                        onValueChange={(value: 'document' | 'image') => setUploadForm(prev => ({ 
                          ...prev, 
                          document_type: value,
                          document_path: null // Reset file when type changes
                        }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Document ({allowedFileTypes.document.join(', ')})</SelectItem>
                          <SelectItem value="image">Image (Any type)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="document_name" className="text-sm font-medium text-gray-700">
                      Document Name *
                    </Label>
                    <Input
                      id="document_name"
                      value={uploadForm.document_name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, document_name: e.target.value }))}
                      placeholder="Enter document name"
                      className="p-3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description (optional)"
                    rows={3}
                    className="resize-none p-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_path" className="text-sm font-medium text-gray-700">
                    File *
                  </Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 hover:border-primary/10 transition-colors">
                    <Input
                      ref={fileInputRef}
                      id="document_path"
                      type="file"
                      onChange={handleFileChange}
                      accept={getAcceptString(uploadForm.document_type)}
                      className="border-0 p-0 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/10 cursor-pointer file:cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {getFileTypeDescription(uploadForm.document_type)}
                    </p>
                  </div>
                  {uploadForm.document_path && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <FileIcon className="w-4 h-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {uploadForm.document_path.name}
                        </p>
                        <p className="text-xs text-primary">
                          {(uploadForm.document_path.size / 1024 / 1024).toFixed(2)} MB
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
                    disabled={isUploading || isDeleting || !uploadForm.document_name.trim() || !uploadForm.document_path}
                    className="px-6"
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
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
              </div>
              
              <div className="grid gap-4">
                <DocumentSkeleton showDescription={true} />
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-2 py-12">
              <FileIcon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-mute mb-2">No documents found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                This {entityName} doesn't have any documents yet. Click "Add Document/Image" to upload the first one.
              </p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Documents ({documents.length})
                </h3>
              </div>
              
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* File Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            {getFileIcon(doc)}
                          </div>
                        </div>
                        
                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground truncate">
                                {doc.document_name}
                              </h4>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}
                              
                              {/* Document Details */}
                              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FileIcon className="w-3 h-3" />
                                  <span>{formatFileSize(doc.file_size)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge 
                                    variant={doc.is_image ? 'default' : 'secondary'} 
                                    className="text-xs px-2 py-1"
                                  >
                                    {doc.is_image ? 'Image' : doc.is_pdf ? 'PDF' : 'Document'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  <span className="hidden sm:inline">{formatDateTime(doc.uploaded_at)}</span>
                                  <span className="sm:hidden">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserIcon className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{doc.uploaded_by_name}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc)}
                                disabled={downloadingIds.has(doc.id)}
                                className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none"
                              >
                                {downloadingIds.has(doc.id) ? (
                                  <Loader2Icon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <DownloadIcon className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">
                                  {downloadingIds.has(doc.id) ? 'Downloading...' : 'Download'}
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc)}
                                disabled={deletingIds.has(doc.id) || isDeleting}
                                className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                {deletingIds.has(doc.id) ? (
                                  <Loader2Icon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2Icon className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">
                                  {deletingIds.has(doc.id) ? 'Deleting...' : 'Delete'}
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

      {/* Delete Confirmation Dialog */}
      <ResponsiveDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        itemName={documentToDelete?.document_name}
        description={`Are you sure you want to delete "${documentToDelete?.document_name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete Document"
        cancelText="Cancel"
        loading={documentToDelete ? deletingIds.has(documentToDelete.id) : false}
        error={deleteError}
      />
    </Dialog>
  );
};
