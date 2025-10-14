import { FormSchema } from "@/components/common/FormSchema";
import type { FormFieldConfig } from "@/components/common/FormField";
import type { Column } from "@/components/common/DataTable";
import type { Bed } from "@/store/slices/dialysisSlice";
import { Badge } from "@/components/ui/badge";

// Bed form field configurations
export const bedFormFields: FormFieldConfig[] = [
  {
    name: "bed_name",
    label: "Bed Name",
    type: "text",
    placeholder: "Enter bed name",
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  {
    name: "ward",
    label: "Ward",
    type: "select",
    placeholder: "Select a ward",
    required: true,
    options: [], // Will be populated dynamically with wards data
  },
];

// Create bed schema
export const createBedSchema = new FormSchema({
  fields: bedFormFields,
  layout: "single",
  className: "space-y-4",
});

// Edit bed schema
export const editBedSchema = new FormSchema({
  fields: bedFormFields,
  layout: "single",
  className: "space-y-4",
});

// Data table columns configuration
export const bedTableColumns: Column<Bed>[] = [
  {
    key: "bed_name",
    header: "BED NAME",
    sortable: true,
  },
  {
    key: "ward_name",
    header: "WARD",
    sortable: true,
  },
  {
    key: "created_at",
    header: "CREATED AT",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];
