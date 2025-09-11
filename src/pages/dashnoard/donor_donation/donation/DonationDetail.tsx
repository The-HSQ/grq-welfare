import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchDonationDetail,
  clearErrors,
  clearDonationDetail,
} from '../../../../store/slices/donationSlice';
import { formatDate } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, User, Target, Tag } from 'lucide-react';

const DonationDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    donationDetail,
    detailLoading,
    detailError,
  } = useSelector((state: RootState) => state.donations);

  useEffect(() => {
    if (id) {
      dispatch(fetchDonationDetail(parseInt(id)));
    }

    return () => {
      dispatch(clearErrors());
      dispatch(clearDonationDetail());
    };
  }, [dispatch, id]);

  const handleEdit = () => {
    if (donationDetail) {
      navigate(`/donations/${donationDetail.id}/edit`);
    }
  };

  const handleDelete = () => {
    if (donationDetail) {
      navigate(`/donations/${donationDetail.id}/delete`);
    }
  };

  const handleBack = () => {
    navigate('/donations');
  };

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <h3 className="font-medium">Error loading donation details</h3>
            <p className="text-sm mt-1">{detailError}</p>
          </div>
          <div className="mt-4">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Donations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!donationDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md">
            <h3 className="font-medium">Donation not found</h3>
            <p className="text-sm mt-1">The donation you're looking for doesn't exist or has been deleted.</p>
          </div>
          <div className="mt-4">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Donations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donation Details</h1>
              <p className="text-gray-600">Donation ID: #{donationDetail.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donation Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Donation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-gray-900">
                      {donationDetail.currency} {donationDetail.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount in Rupees</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {donationDetail.in_rupees ? `PKR ${donationDetail.in_rupees.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-sm">
                        {donationDetail.purpose_display}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Donation Type</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm capitalize">
                        {donationDetail.donation_type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Donation Date</label>
                  <p className="text-lg text-gray-900">{formatDate(donationDetail.date)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donor Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Donor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Donor Name</label>
                  <p className="text-lg font-semibold text-gray-900">{donationDetail.donner_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Donor ID</label>
                  <p className="text-gray-900">#{donationDetail.donner}</p>
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={() => navigate(`/donors/${donationDetail.donner}`)} 
                    variant="outline" 
                    className="w-full"
                  >
                    View Donor Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Created Date</label>
                <p className="text-gray-900">{formatDate(donationDetail.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(donationDetail.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonationDetail;
