import { FormSchema } from '@/components/common/FormSchema';

// Machine form schema for add dialog
export const machineAddSchema = new FormSchema({
  fields: [
    {
      name: 'machine_name',
      label: 'Machine Name',
      type: 'text',
      required: true,
      placeholder: 'Enter machine name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'machine_type',
      label: 'Machine Type',
      type: 'select',
      required: true,
      placeholder: 'Select machine type',
      options: [
        { value: 'dialysis', label: 'Dialysis' },
        { value: 'ro', label: 'RO Machine' },
      ],
    },
    {
      name: 'maintenance_date',
      label: 'Maintenance Date',
      type: 'date',
      required: true,
      placeholder: 'Select maintenance date',
    },
    {
      name: 'next_maintenance_date',
      label: 'Next Maintenance Date',
      type: 'date',
      required: true,
      placeholder: 'Select next maintenance date',
    },
    {
      name: 'disinfection_chemical_change',
      label: 'Disinfection Chemical Change Date',
      type: 'date',
      required: false,
      placeholder: 'Select disinfection chemical change date',
    },
    {
      name: 'dia_safe_filter_change',
      label: 'Dia Safe Filter Change Date',
      type: 'date',
      required: false,
      placeholder: 'Select dia safe filter change date',
    },
  ],
  layout: 'two-column',
});

// Machine form schema for edit dialog
export const machineEditSchema = new FormSchema({
  fields: [
    {
      name: 'machine_name',
      label: 'Machine Name',
      type: 'text',
      required: true,
      placeholder: 'Enter machine name',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'machine_type',
      label: 'Machine Type',
      type: 'select',
      required: true,
      placeholder: 'Select machine type',
      options: [
        { value: 'dialysis', label: 'Dialysis' },
        { value: 'ro', label: 'RO Machine' },
      ],
    },
    {
      name: 'maintenance_date',
      label: 'Maintenance Date',
      type: 'date',
      required: true,
      placeholder: 'Select maintenance date',
    },
    {
      name: 'next_maintenance_date',
      label: 'Next Maintenance Date',
      type: 'date',
      required: true,
      placeholder: 'Select next maintenance date',
    },
    {
      name: 'disinfection_chemical_change',
      label: 'Disinfection Chemical Change Date',
      type: 'date',
      required: false,
      placeholder: 'Select disinfection chemical change date',
    },
    {
      name: 'dia_safe_filter_change',
      label: 'Dia Safe Filter Change Date',
      type: 'date',
      required: false,
      placeholder: 'Select dia safe filter change date',
    },
  ],
  layout: 'two-column',
});
