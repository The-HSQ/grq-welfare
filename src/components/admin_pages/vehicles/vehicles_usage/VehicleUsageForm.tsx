import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { createVehicleUsageSchema, updateVehicleUsageSchema } from './schemas';
import type { Vehicle, CreateVehicleUsageData, UpdateVehicleUsageData } from '../../../../store/slices/vehicleSlice';

interface VehicleUsageFormProps {
  mode: 'create' | 'edit';
  vehicles: Vehicle[];
  defaultValues?: Record<string, any>;
  onSubmit: (data: CreateVehicleUsageData | UpdateVehicleUsageData) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  submitText?: string;
  cancelText?: string;
}

const VehicleUsageForm: React.FC<VehicleUsageFormProps> = ({
  mode,
  vehicles,
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  submitText = mode === 'create' ? 'Add Usage' : 'Save Changes',
  cancelText = 'Cancel'
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  const schema = mode === 'create' ? createVehicleUsageSchema() : updateVehicleUsageSchema();
  const zodSchema = schema.buildZodSchema();
  const formDefaultValues = defaultValues || schema.getDefaultValues();

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: formDefaultValues,
    mode: 'onChange'
  });

  const { handleSubmit, formState: { errors, isValid }, watch, setValue } = methods;

  // Ensure form is properly initialized with default values
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key, value);
        }
      });
    }
  }, [defaultValues, setValue]);

  // Watch the vehicle field
  const watchedVehicle = watch('vehicle');
  const watchedStartMileage = watch('current_mileage');
  const watchedEndMileage = watch('end_mileage');
  const watchedTripPurpose = watch('trip_purpose');

  // Initialize selectedVehicleId from defaultValues (for edit mode)
  useEffect(() => {
    if (defaultValues?.vehicle && !selectedVehicleId) {
      const vehicleId = defaultValues.vehicle.toString();
      setSelectedVehicleId(vehicleId);
      setValue('vehicle', vehicleId);
    }
  }, [defaultValues, selectedVehicleId, setValue]);

  // Update selected vehicle when form value changes
  useEffect(() => {
    if (watchedVehicle) {
      setSelectedVehicleId(watchedVehicle as string);
    }
  }, [watchedVehicle]);

  // Update end mileage minimum when start mileage changes
  useEffect(() => {
    if (watchedStartMileage && typeof watchedStartMileage === 'string') {
      const startMileage = parseFloat(watchedStartMileage);
      if (startMileage > 0) {
        // Set the minimum value for end mileage to be start mileage (equal or greater)
        const endMileageInput = document.getElementById('end_mileage') as HTMLInputElement;
        if (endMileageInput) {
          endMileageInput.min = startMileage.toString();
        }
      }
    }
  }, [watchedStartMileage]);

  // Get selected vehicle
  const selectedVehicle = vehicles.find(vehicle => vehicle.id.toString() === selectedVehicleId);

  // Calculate total amount to pay based on vehicle's rate_per_km
  const calculateAmountToPay = () => {
    if (watchedStartMileage && watchedEndMileage && selectedVehicle?.rate_per_km) {
      const startMileage = parseFloat(watchedStartMileage.toString());
      const endMileage = parseFloat(watchedEndMileage.toString());
      const ratePerKm = parseFloat(selectedVehicle.rate_per_km.toString());
      
      if (startMileage >= 0 && endMileage >= startMileage && ratePerKm > 0) {
        const usedMileageKm = endMileage - startMileage;
        
        // Convert rate per km to rate per mile (1 mile = 1.609344 km)
        const totalAmountPerMileage = ratePerKm * 1.609344;
        
        // Calculate total amount to pay (always based on km usage)
        const totalAmountToPay = usedMileageKm * totalAmountPerMileage;
        
        return {
          usedMileageKm: parseFloat(usedMileageKm.toFixed(2)),
          ratePerKm: parseFloat(ratePerKm.toFixed(2)),
          totalAmountPerMileage: parseFloat(totalAmountPerMileage.toFixed(2)),
          totalAmountToPay: parseFloat(totalAmountToPay.toFixed(2))
        };
      }
    }
    return null;
  };

  const amountCalculation = calculateAmountToPay();

  // Trip purpose options
  const tripPurposeOptions = [
    { value: 'dialysis_use', label: 'Dialysis Use' },
    { value: 'lab_use', label: 'Lab Use' },
    { value: 'women_vocation_use', label: 'Women Vocation Use' },
    { value: 'computer_lab_use', label: 'Computer Lab Use' },
    { value: 'personal_use', label: 'Personal Use' },
  ];

  // Vehicle options
  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle.id.toString(),
    label: `${vehicle.name} (${vehicle.number_plate})`
  }));

  const handleFormSubmit = (data: any) => {
    // Validate mileage constraints
    const startMileage = parseFloat(data.current_mileage);
    const endMileage = parseFloat(data.end_mileage);
    const vehicleCurrentMileage = selectedVehicle?.current_mileage || 0;

    // Only validate start mileage against vehicle's current mileage in create mode
    // In edit mode, allow start mileage to be lower than current vehicle mileage
    if (mode === 'create' && startMileage < vehicleCurrentMileage) {
      methods.setError('current_mileage', {
        type: 'manual',
        message: `Start mileage must be at least ${vehicleCurrentMileage.toLocaleString()} miles (vehicle's current mileage)`
      });
      return;
    }

    // Check if end mileage is less than start mileage
    if (endMileage <= startMileage) {
      methods.setError('end_mileage', {
        type: 'manual',
        message: 'End mileage must be greater than start mileage'
      });
      return;
    }

    // Check if paid amount is greater than total amount to pay
    const paidAmount = parseFloat(data.paid_amount);
    const totalAmountToPay = amountCalculation?.totalAmountToPay || 0;
    
    if (paidAmount > totalAmountToPay) {
      methods.setError('paid_amount', {
        type: 'manual',
        message: `Paid amount cannot be greater than total amount to pay (PKR ${totalAmountToPay.toLocaleString()})`
      });
      return;
    }

    // Check if personal_used_by is required when trip_purpose is personal_use
    if (data.trip_purpose === 'personal_use' && (!data.personal_used_by || data.personal_used_by.trim() === '')) {
      methods.setError('personal_used_by', {
        type: 'manual',
        message: 'Personal Used By is required when trip purpose is Personal Use'
      });
      return;
    }

    // Convert string values to appropriate types
    const submitData = {
      ...data,
      vehicle: parseInt(data.vehicle),
      current_mileage: startMileage,
      end_mileage: endMileage,
      paid_amount: parseFloat(data.paid_amount)
    };
    onSubmit(submitData);
  };

  console.log(vehicles);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle *</Label>
            <Select
              value={selectedVehicleId}
              onValueChange={(value) => {
                setSelectedVehicleId(value);
                setValue('vehicle', value);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicle && (
              <p className="text-sm text-red-600">{errors.vehicle.message}</p>
            )}
          </div>

          {/* Current Mileage Display */}
          <div className="space-y-2">
            <Label>Current Vehicle Mileage</Label>
            <div className="p-3 bg-gray-50 border rounded-md">
              <span className="text-sm font-medium text-gray-700">
                {selectedVehicle ? `${selectedVehicle.current_mileage.toLocaleString()} miles` : 'Select a vehicle to see current mileage'}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              {...methods.register('date')}
              disabled={disabled}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Trip Purpose */}
          <div className="space-y-2">
            <Label htmlFor="trip_purpose">Trip Purpose *</Label>
            <Select
              value={methods.watch('trip_purpose') as string || ''}
              onValueChange={(value) => setValue('trip_purpose', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trip purpose" />
              </SelectTrigger>
              <SelectContent>
                {tripPurposeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trip_purpose && (
              <p className="text-sm text-red-600">{errors.trip_purpose.message}</p>
            )}
          </div>

            {/* Start Mileage */}
            <div className="space-y-2">
              <Label htmlFor="current_mileage">Start Mileage *</Label>
              <Input
                id="current_mileage"
                type="number"
                min={mode === 'create' ? (selectedVehicle?.current_mileage || 0) : 0}
                step="1"
                {...methods.register('current_mileage')}
                disabled={disabled}
                className={errors.current_mileage ? 'border-red-500' : ''}
                placeholder={mode === 'create' && selectedVehicle ? `Min: ${selectedVehicle.current_mileage.toLocaleString()} miles` : 'Enter start mileage'}
              />
              {errors.current_mileage && (
                <p className="text-sm text-red-600">{errors.current_mileage.message}</p>
              )}
              {mode === 'create' && selectedVehicle && (
                <p className="text-xs text-gray-500">
                  Minimum: {selectedVehicle.current_mileage.toLocaleString()} miles (vehicle's current mileage)
                </p>
              )}
              {mode === 'edit' && selectedVehicle && (
                <p className="text-xs text-gray-500">
                  Vehicle's current mileage: {selectedVehicle.current_mileage.toLocaleString()} miles
                </p>
              )}
            </div>

          {/* End Mileage */}
          <div className="space-y-2">
            <Label htmlFor="end_mileage">End Mileage *</Label>
            <Input
              id="end_mileage"
              type="number"
              min={watchedStartMileage && typeof watchedStartMileage === 'string' ? (parseFloat(watchedStartMileage) + 1) : 1} 
              step="1"
              {...methods.register('end_mileage')}
              disabled={disabled}
              className={errors.end_mileage ? 'border-red-500' : ''}
              placeholder={watchedStartMileage && typeof watchedStartMileage === 'string' ? `Min: ${(parseFloat(watchedStartMileage) + 1).toLocaleString()} miles` : 'Enter end mileage'}
            />
            {errors.end_mileage && (
              <p className="text-sm text-red-600">{errors.end_mileage.message}</p>
            )}
            {watchedStartMileage && typeof watchedStartMileage === 'string' ? (
              <p className="text-xs text-gray-500">
                Minimum: {(parseFloat(watchedStartMileage) + 1).toLocaleString()} miles (start mileage)
              </p>
            ) : null}
            {watchedStartMileage && typeof watchedStartMileage === 'string' && 
             watchedEndMileage && typeof watchedEndMileage === 'string' ? (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  Miles Used: {(parseFloat(watchedEndMileage) - parseFloat(watchedStartMileage)).toLocaleString()} miles
                </p>
              </div>
            ) : null}
          </div>

          {/* Amount to Pay Display */}
          {amountCalculation && (
            <div className="space-y-2">
              <Label>Amount to Pay</Label>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="space-y-2">
                  <div className="">
                    <div className="flex gap-2">
                      <span className="">Rate per KM:</span>
                      <span className="font-bold text-blue-900">{amountCalculation.ratePerKm} PKR</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="">Rate per Mile:</span>
                      <span className="font-bold text-blue-900">{amountCalculation.totalAmountPerMileage} PKR</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="">Total Amount to Pay: </span>
                      <span className="font-bold text-blue-900">{amountCalculation.totalAmountToPay} PKR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Driver Name */}
          <div className="space-y-2">
            <Label htmlFor="driver_name">Driver Name *</Label>
            <Input
              id="driver_name"
              {...methods.register('driver_name')}
              disabled={disabled}
              className={errors.driver_name ? 'border-red-500' : ''}
              placeholder="Enter driver name"
            />
            {errors.driver_name && (
              <p className="text-sm text-red-600">{errors.driver_name.message}</p>
            )}
          </div>

          {/* Personal Used By */}
          <div className="space-y-2">
            <Label htmlFor="personal_used_by">
              Personal Used By {watchedTripPurpose === 'personal_use' ? '*' : ''}
            </Label>
            <Input
              id="personal_used_by"
              {...methods.register('personal_used_by')}
              disabled={disabled}
              className={errors.personal_used_by ? 'border-red-500' : ''}
              placeholder={watchedTripPurpose === 'personal_use' ? 'Enter person name (required)' : 'Enter person name (optional)'}
            />
            {errors.personal_used_by && (
              <p className="text-sm text-red-600">{errors.personal_used_by.message}</p>
            )}
            {watchedTripPurpose === 'personal_use' && (
              <p className="text-xs text-gray-500">
                Required when trip purpose is Personal Use
              </p>
            )}
          </div>

          {/* Paid Amount */}
          <div className="space-y-2">
            <Label htmlFor="paid_amount">Paid Amount (PKR) *</Label>
            <Input
              id="paid_amount"
              type="number"
              min="0"
              max={amountCalculation?.totalAmountToPay || undefined}
              step="0.01"
              {...methods.register('paid_amount')}
              disabled={disabled}
              className={errors.paid_amount ? 'border-red-500' : ''}
              placeholder="Enter paid amount"
            />
            {errors.paid_amount && (
              <p className="text-sm text-red-600">{errors.paid_amount.message}</p>
            )}
            {amountCalculation && (
              <p className="text-xs text-gray-500">
                Maximum: PKR {amountCalculation.totalAmountToPay.toLocaleString()} (total amount to pay)
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className='text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || disabled || !isValid}
            className="min-w-[120px] text-sm font-medium cursor-pointer text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Processing...</span>
              </div>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default VehicleUsageForm;
