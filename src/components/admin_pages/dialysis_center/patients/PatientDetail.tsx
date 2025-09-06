import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import {
  getPatientById,
  deletePatient,
  clearError,
  type Dialysis,
  Patient,
} from "../../../../store/slices/dialysisSlice";
import { useAppDispatch } from "../../../../store/hooks";
import type { RootState } from "../../../../store";
import { getMediaUrl, formatDateTime } from "../../../../lib/utils";

export const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentPatient, dialysis, isLoading, error } = useSelector(
    (state: RootState) => state.dialysis
  );

  useEffect(() => {
    if (id) {
      dispatch(getPatientById(id));
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id]);

  const handleEdit = () => {
    if (currentPatient) {
      navigate(`/dialysis-center/patients/`);
    }
  };

  const handleDelete = async () => {
    if (currentPatient && id) {
      try {
        await dispatch(deletePatient(id)).unwrap();
        navigate("/dialysis-center/patients");
      } catch (error) {
        // Error is handled by the slice
      }
    }
  };

  const handleDownloadDocument = () => {
    if (currentPatient?.document_path) {
      const link = document.createElement("a");
      const documentUrl = getMediaUrl(currentPatient.document_path);
      if (documentUrl) {
        link.href = documentUrl;
        link.download = `patient_document_${currentPatient.name}.pdf`;
        link.click();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => navigate("/dialysis-center/patients")}>
          Back to Patients
        </Button>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Patient not found</div>
        <Button onClick={() => navigate("/dialysis-center/patients")}>
          Back to Patients
        </Button>
      </div>
    );
  }

  // Separate component for image cell that can use hooks
  const ImageCell = ({ patient }: { patient: Patient }) => {
    const image = getMediaUrl(patient.image);

    return (
      <div className="flex justify-center">
        {patient.image ? (
          <img
            src={image || ""}
            alt="image"
            className="w-42 h-42 rounded-full object-contain border-4 border-gray-200"
          />
        ) : (
          <div className="w-42 h-42 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
            <span className="text-gray-500 text-lg">No Image</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dialysis-center/patients")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Patient Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {/* <Button onClick={handleDelete} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Image and Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageCell patient={currentPatient} />

            <div className="text-center">
              <h2 className="text-xl font-semibold">{currentPatient.name}</h2>
              <p className="text-gray-600">{currentPatient.nic}</p>
              <div className="flex flex-col gap-2 mt-2">
                <Badge
                  variant={
                    currentPatient.status === "active" ? "default" : "secondary"
                  }
                >
                  {currentPatient.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  variant={
                    currentPatient.zakat_eligible ? "default" : "secondary"
                  }
                >
                  {currentPatient.zakat_eligible
                    ? "Zakat Eligible"
                    : "Not Zakat Eligible"}
                </Badge>
                {currentPatient.handicapped && (
                  <Badge variant="destructive">Handicapped</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">
                  {currentPatient.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="text-gray-900">
                  {currentPatient.address || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Access Type
                </label>
                <p className="text-gray-900 capitalize">
                  {currentPatient.access_type?.replace("_", " ") ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 pl-4 pr-4">
          {/* Medical Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dialysis Per Week
                  </label>
                  <p className="text-lg font-semibold">
                    {currentPatient.dialysis_per_week} sessions
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Next Dialysis Date
                  </label>
                  <p className="text-lg font-semibold">
                    {currentPatient.manually_set_dialysis_date
                      ? formatDateTime(
                          currentPatient.manually_set_dialysis_date
                        )
                      : currentPatient.next_dialysis_date
                      ? formatDateTime(currentPatient.next_dialysis_date)
                      : "Not scheduled"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Zakat Eligibility
                  </label>
                  <p className="text-lg font-semibold">
                    {currentPatient.zakat_eligible ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Handicapped
                  </label>
                  <p className="text-lg font-semibold">
                    {currentPatient.handicapped ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blood Test Results */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Blood Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    HBSAG
                  </label>
                  <p className="text-gray-900">
                    {currentPatient.hbsag !== null
                      ? currentPatient.hbsag
                        ? "Positive"
                        : "Negative"
                      : "Not tested"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    HCV
                  </label>
                  <p className="text-gray-900">
                    {currentPatient.hcv !== null
                      ? currentPatient.hcv
                        ? "Positive"
                        : "Negative"
                      : "Not tested"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    HIV
                  </label>
                  <p className="text-gray-900">
                    {currentPatient.hiv !== null
                      ? currentPatient.hiv
                        ? "Positive"
                        : "Negative"
                      : "Not tested"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Blood Test CBC
                  </label>
                  <p className="text-gray-900">
                    {currentPatient.blood_test_cbc ? "Done" : "Not done"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    RFT Creatinine
                  </label>
                  <p className="text-gray-900">
                    {currentPatient.rft_creatinine ? "Done" : "Not done"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    RFT Urea
                  </label>
                  <p className="text-gray-900">
                    {currentPatient.rft_urea ? "Done" : "Not done"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Card>

        {/* Relative Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Relative Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Relative Name
                </label>
                <p className="text-gray-900">
                  {currentPatient.relative_name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Relative Phone
                </label>
                <p className="text-gray-900">
                  {currentPatient.relative_phone || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents and Timestamps */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Documents & Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPatient.document_path && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Patient Document
                </label>
                <div className="mt-2">
                  <Button
                    onClick={handleDownloadDocument}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialysis History */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Dialysis History</CardTitle>
          </CardHeader>
          <CardContent>
            {dialysis && dialysis.length > 0 ? (
              <div className="space-y-4">
                {dialysis.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {session.shift_no} - {session.bed_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Machine: {session.machine_name} (
                          {session.machine_status})
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatDateTime(session.created_at)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-gray-500">Start Time</label>
                        <p className="font-medium">{session.start_time}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">End Time</label>
                        <p className="font-medium">{session.end_time}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Blood Pressure</label>
                        <p className="font-medium">
                          {session.blood_pressure || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-500">Weight</label>
                        <p className="font-medium">{session.weight || "N/A"}</p>
                      </div>
                    </div>

                    {(session.technician_comment || session.doctor_comment) && (
                      <div className="space-y-2">
                        {session.technician_comment && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Technician Comment
                            </label>
                            <p className="text-sm bg-gray-50 p-2 rounded">
                              {session.technician_comment}
                            </p>
                          </div>
                        )}
                        {session.doctor_comment && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Doctor Comment
                            </label>
                            <p className="text-sm bg-blue-50 p-2 rounded">
                              {session.doctor_comment}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No dialysis history available for this patient.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
