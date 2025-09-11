import React from 'react';
import { DocumentManager, type BaseDocument } from '@/components/common/DocumentManager';
import type { PatientDocument } from '../../../../store/slices/dialysisSlice';
import { useAppDispatch } from '../../../../store/hooks';
import { uploadPatientDocument, deletePatientDocument } from '../../../../store/slices/dialysisSlice';

interface DocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: PatientDocument[];
  patientName: string;
  patientId: string;
  isLoading?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
  uploadError?: string | null;
  onDocumentChange?: () => void; // Callback when documents are uploaded or deleted
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  open,
  onOpenChange,
  documents,
  patientName,
  patientId,
  isLoading = false,
  isUploading = false,
  isDeleting = false,
  uploadError = null,
  onDocumentChange,
}) => {
  const dispatch = useAppDispatch();

  const handleUpload = async (formData: FormData) => {
    await dispatch(uploadPatientDocument(formData)).unwrap();
  };

  const handleDelete = async (documentId: number) => {
    await dispatch(deletePatientDocument(documentId)).unwrap();
  };

  return (
    <DocumentManager<PatientDocument>
      open={open}
      onOpenChange={onOpenChange}
      title={`Documents for ${patientName}`}
      description="View, upload, and manage patient documents and images"
      documents={documents}
      entityName="patient"
      entityId={patientId}
      isLoading={isLoading}
      isUploading={isUploading}
      isDeleting={isDeleting}
      uploadError={uploadError}
      onDocumentChange={onDocumentChange}
      onUpload={handleUpload}
      onDelete={handleDelete}
      allowedFileTypes={{
        document: ['.pdf'],
        image: ['image/*']
      }}
      maxFileSize={10}
    />
  );
};
