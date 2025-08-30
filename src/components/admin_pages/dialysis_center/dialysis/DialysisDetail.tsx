import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PageHeader
} from '@/components/common';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Bed, Settings, Activity } from 'lucide-react';
import { 
  getDialysisById, 
  clearError,
  type Dialysis 
} from '@/store/slices/dialysisSlice';
import { RootState, AppDispatch } from '@/store';

const DialysisDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentDialysis, isLoading, error } = useSelector((state: RootState) => state.dialysis);

  useEffect(() => {
    if (id) {
      dispatch(getDialysisById(id));
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-lg">{error}</div>
        <Button onClick={() => navigate('/dialysis-center/dialysis')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dialysis
        </Button>
      </div>
    );
  }

  if (!currentDialysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-gray-500 text-lg">Dialysis session not found</div>
        <Button onClick={() => navigate('/dialysis-center/dialysis')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dialysis
        </Button>
      </div>
    );
  }

  const dialysis = currentDialysis;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dialysis Session Details"
        description={`Session details for ${dialysis.patient_name}`}
      >
        <Button variant="outline" onClick={() => navigate('/dialysis-center/dialysis')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dialysis
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Patient Name</label>
                <p className="text-lg font-semibold">{dialysis.patient_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Patient ID</label>
                <p className="text-sm text-gray-600">{dialysis.patient}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Session ID</label>
                <p className="text-sm text-gray-600">{dialysis.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-600">
                  {new Date(dialysis.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bed Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Bed Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Bed Name</label>
                <p className="text-lg font-semibold">{dialysis.bed_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bed ID</label>
                <p className="text-sm text-gray-600">{dialysis.bed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Machine Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Machine Name</label>
                <p className="text-lg font-semibold">{dialysis.machine_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Machine ID</label>
                <p className="text-sm text-gray-600">{dialysis.machine}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge 
                    variant={dialysis.machine_status === 'working' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {dialysis.machine_status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Shift</label>
                <p className="text-lg font-semibold">{dialysis.shift_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Shift ID</label>
                <p className="text-sm text-gray-600">{dialysis.shift}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Time</label>
                <p className="text-lg font-semibold">{dialysis.start_time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Time</label>
                <p className="text-lg font-semibold">{dialysis.end_time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Blood Pressure</label>
                <p className="text-lg font-semibold text-blue-600">{dialysis.blood_pressure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Previous Blood Pressure</label>
                <p className="text-lg font-semibold text-gray-600">{dialysis.last_blood_pressure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Weight</label>
                <p className="text-lg font-semibold text-green-600">{dialysis.weight}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Previous Weight</label>
                <p className="text-lg font-semibold text-gray-600">{dialysis.last_weight}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Technician Comments</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{dialysis.technician_comment}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Doctor Comments</label>
              <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{dialysis.doctor_comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DialysisDetail;
