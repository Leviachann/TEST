
export interface Location {
  id: string;
  name: string;
  row: number;
  grid: number;
  zone: string;
  capacity: number;
  xCoordinates: string;
  yCoordinates: string;
  zCoordinates: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  rackId?: string | null;
  rowNumber?: number | null;
  gridNumber?: number | null;
  rack?: {
    id: string;
    name: string;
    blueprintId: string;
  } | null;
}
export interface Blueprint {
  id: string;
  name: string;
  width: number;
  height: number;
  gridSize: number;
  rackCount: number;
  createdDate: string;
  updatedDate: string;
}

export interface Rack {
  id: string;
  name: string;
  blueprintId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rows: number;
  grids: number;
  locationCount: number;
  createdDate: string;
  updatedDate: string;
}

export interface CreateBlueprintRequest {
  name: string;
  width: number;
  height: number;
  gridSize: number;
}

export interface UpdateBlueprintRequest {
  id: string;
  name: string;
  width: number;
  height: number;
  gridSize: number;
}

export interface CreateRackRequest {
  name: string;
  blueprintId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rows: number;
  grids: number;
}

export interface UpdateRackRequest {
  id: string;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rows: number;
  grids: number;
}

export enum ArrivalStatus {
  Pending = 'Pending',
  Ordered = 'Ordered',
  Shipping = 'Shipping',
  Arrived = 'Arrived',
}

export interface OrderLine {
  id: string;
  orderId: string;
  order?: Order;
  productId: string;
  product?: Product;
  quantityOrdered: number;
  priceAtOrder: number;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}

export interface Order {
  id: string;
  orderDate: string;
  arrivalTime: string;
  orderArrivalStatus: ArrivalStatus;
  supplierId: string;
  supplier?: Supplier;
  orderLines?: OrderLine[];
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}

export interface OrderLineFormData {
  productId: string;
  quantityOrdered: number;
  priceAtOrder: number;
}

export interface OrderFormData {
  orderDate: string;
  arrivalTime: string;
  orderArrivalStatus: ArrivalStatus;
  supplierId: string;
  orderLines: OrderLineFormData[];
}

export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  WareHouseMan = 'WareHouseMan'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}

export interface Supplier {
  id: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  name: string;
  country: string;
  adress: string; 
  email: string;
  phone: string;
  productIds: string[];
  ordersIds: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  salePrice: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  countryOfOrigin: string;
  productionDate: string;
  expirationDate: string;
  categoryId: string;
  category?: Category;
  supplierId: string;
  supplier?: Supplier;
  inventory?: Inventory;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}


export interface Inventory {
  id: string;
  productId: string;
  product?: Product;
  locationId: string;
  location?: Location;
  currentStock : number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestockedDate: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}


export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FilterParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface SupplierFormData {
  id: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  name: string;
  country: string;
  adress: string; 
  email: string;
  phone: string;
  productIds: string[];
  ordersIds: string[];
}


export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  price: number;
  salePrice: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  countryOfOrigin: string;
  productionDate: string;
  expirationDate: string;
  categoryId: string;
  supplierId: string;
}

export interface LocationFormData {

  id: string;
  name: string;
  row: number;
  grid: number;
  zone: string;
  capacity: number;
  xCoordinates: string;
  yCoordinates: string;
  zCoordinates: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  rackId?: string | null;
  rowNumber?: number | null;
  gridNumber?: number | null;
  rack?: {
    id: string;
    name: string;
    blueprintId: string;
  } | null;
}

export interface InventoryFormData {
  id: string;
  productId: string;
  product?: Product;
  locationId: string;
  location?: Location;
  quantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestockedDate: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}