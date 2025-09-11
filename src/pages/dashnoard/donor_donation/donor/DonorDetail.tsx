import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import {
  fetchDonorDetail,
  clearDetailError,
  clearDonorDetail,
  Donation,
} from '../../../../store/slices/donorSlice';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, Calendar, Image as ImageIcon, DollarSign, Heart, Target } from 'lucide-react';
import { formatDate } from '../../../../lib/utils';
import { getMediaUrl } from '../../../../lib/mediaUtils';
import { Skeleton } from '../../../../components/ui/skeleton';

const DonorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    donorDetail,
    detailLoading,
    detailError,
  } = useSelector((state: RootState) => state.donors);

  useEffect(() => {
    if (id) {
      dispatch(fetchDonorDetail(parseInt(id)));
    }

    return () => {
      dispatch(clearDonorDetail());
      dispatch(clearDetailError());
    };
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/office-management/donors`);
  };

  const handleDelete = () => {
    navigate(`/office-management/donors`);
  };

  const handleBack = () => {
    navigate('/office-management/donors');
  };

  if (detailLoading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
              <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 rounded-lg mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 sm:h-5 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-3/4 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                        <Skeleton className="h-3 sm:h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Donations Skeleton */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="flex items-center space-x-2">
                              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                              <div className="space-y-1 flex-1">
                                <Skeleton className="h-3 w-12 sm:w-16" />
                                <Skeleton className="h-3 w-full" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="px-4">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-4">
            Error loading donor details
          </div>
          <div className="text-gray-600 mb-6">{detailError}</div>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Donors
          </Button>
        </div>
      </div>
    );
  }

  if (!donorDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium mb-4">
            Donor not found
          </div>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Donors
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{donorDetail.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">Donor Details</p>
            </div>
          </div>
          
          <div className="flex space-x-2 sm:space-x-2">
            <Button onClick={handleEdit} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button onClick={handleDelete} variant="destructive" size="sm" className="flex-1 sm:flex-none">
              <Trash2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={getMediaUrl(donorDetail.image) || '/placeholder-avatar.png'}
                      alt={donorDetail.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-lg object-cover border-2 sm:border-4 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full">
                      <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                    {donorDetail.name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Donor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Contact Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">
                    Contact Information
                  </h4>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Contact Number</p>
                      <p className="text-sm sm:text-base text-gray-900 break-all">{donorDetail.contact}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm sm:text-base text-gray-900 break-words">{donorDetail.address}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">
                    Account Information
                  </h4>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Created Date</p>
                      <p className="text-sm sm:text-base text-gray-900">{formatDate(donorDetail.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Donations Section */}
        <div className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <span className="text-base sm:text-lg">Donation History</span>
                </div>
                <Badge variant="outline" className="w-fit text-xs sm:text-sm">
                  {donorDetail.donations?.length || 0} donations
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donorDetail.donations && donorDetail.donations.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Summary */}
                  <div className="p-3 sm:p-4 pt-0 bg-gray-50 rounded-lg">
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Donation Summary</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-blue-600">
                          {donorDetail.donations.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Total Donations</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-purple-600">
                          {donorDetail.donations.reduce((sum: number, donation: Donation) => sum + (donation.in_rupees || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Total in PKR</p>
                      </div>
                    </div>
                  </div>

                  {donorDetail.donations.map((donation: Donation) => (
                    <div key={donation.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                              {donation.amount?.toLocaleString()} {donation.currency}
                            </h4>
                            {donation.in_rupees && (
                              <Badge variant="secondary" className="w-fit text-xs">
                                {donation.in_rupees.toLocaleString()} PKR
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex items-center space-x-2">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">Purpose</p>
                                <p className="text-sm sm:text-base text-gray-900 truncate">{donation.purpose_display}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">Date</p>
                                <p className="text-sm sm:text-base text-gray-900">{formatDate(donation.date)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">Type</p>
                                <p className="text-sm sm:text-base text-gray-900 capitalize">{donation.donation_type}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full flex-shrink-0"></div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">Donation ID</p>
                                <p className="text-sm sm:text-base text-gray-900">#{donation.id}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Donations Yet</h3>
                  <p className="text-sm sm:text-base text-gray-500">This donor hasn't made any donations yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default DonorDetail;
