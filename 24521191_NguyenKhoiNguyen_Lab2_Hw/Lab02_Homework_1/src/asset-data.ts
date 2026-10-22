
import type { ColumnDef } from "./data-grid-contract";

export interface ITAsset {
  id: string;
  device: string;
  category: string;
  department: string;
  status: "Active" | "Maintenance" | "Inactive";
}

export const assetData: ITAsset[] = [
  {
    id: "IT001",
    device: "Dell Latitude 7440",
    category: "Laptop",
    department: "Engineering",
    status: "Active"
  },
  {
    id: "IT002",
    device: "MacBook Pro M3",
    category: "Laptop",
    department: "Design",
    status: "Active"
  },
  {
    id: "IT003",
    device: "HP EliteDesk 800",
    category: "Desktop",
    department: "Finance",
    status: "Maintenance"
  },
  {
    id: "IT004",
    device: "Cisco Catalyst 9200",
    category: "Network",
    department: "Infrastructure",
    status: "Active"
  },
  {
    id: "IT005",
    device: "Dell PowerEdge R750",
    category: "Server",
    department: "IT Operations",
    status: "Inactive"
  },
  {
    id: "IT006",
    device: "Lenovo ThinkPad X1",
    category: "Laptop",
    department: "Management",
    status: "Active"
  },
  {
    id: "IT007",
    device: "Synology DS923+",
    category: "Storage",
    department: "Infrastructure",
    status: "Maintenance"
  },
  {
    id: "IT008",
    device: "HP LaserJet Pro",
    category: "Printer",
    department: "Administration",
    status: "Active"
  },
  {
    id: "IT009",
    device: "Dell UltraSharp U2723QE",
    category: "Monitor",
    department: "Engineering",
    status: "Active"
  },
  {
    id: "IT010",
    device: "Ubiquiti UniFi U6 Pro",
    category: "Network",
    department: "Infrastructure",
    status: "Active"
  },
  {
    id: "IT011",
    device: "Apple Mac Mini M2",
    category: "Desktop",
    department: "Development",
    status: "Maintenance"
  },
  {
    id: "IT012",
    device: "Lenovo ThinkSystem SR650",
    category: "Server",
    department: "IT Operations",
    status: "Inactive"
  }
];

export const assetColumns: ColumnDef<ITAsset>[] = [
  {
    header: "Asset ID",
    accessorKey: "id",
    sortable: true
  },
  {
    header: "Device Name",
    accessorKey: "device",
    sortable: true
  },
  {
    header: "Category",
    accessorKey: "category",
    sortable: true
  },
  {
    header: "Department",
    accessorKey: "department",
    sortable: true
  },
  {
    header: "Status",
    accessorKey: "status",
    sortable: true
  }
];
