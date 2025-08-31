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
    header: "Bed Name",
    sortable: true,
  },
  {
    key: "ward_name",
    header: "Ward",
    sortable: true,
  },
  {
    key: "is_available",
    header: "Status",
    sortable: true,
    render: (value: boolean) => (
      <Badge
        variant={value ? "default" : "secondary"}
        className={value ? "bg-green-500 text-white" : "bg-red-500 text-white"}
      >
        {value ? "Available" : "Occupied"}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Created At",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];
