export type VehicleCondition = 'brand_new' | 'foreign_used' | 'nigeria_used';
export type PriceType = 'fixed' | 'negotiable' | 'price_on_request';
export type ListingStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export type AvailabilityStatus = 'available' | 'reserved' | 'sold' | 'unavailable';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'revision_required';
export type VerificationType =
  | 'seller_identity'
  | 'dealer_business'
  | 'vehicle_identity'
  | 'ownership_documentation'
  | 'physical_inspection';

export type VehicleCategory =
  | 'Exotic'
  | 'Luxury'
  | 'Executive'
  | 'Performance'
  | 'Luxury SUVs'
  | 'Premium sedans';

export type ArticleCategory =
  | 'News'
  | 'Reviews'
  | 'Buying guides'
  | 'Comparisons'
  | 'Ownership'
  | 'Market';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'dealer' | 'private_seller' | 'admin';
  status: 'active' | 'suspended';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Dealer {
  id: string;
  ownerId: string;
  businessName: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  state: string;
  city: string;
  address?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'info_requested';
  isFeatured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DealerDocument {
  id: string;
  dealerId: string;
  ownerId: string;
  documentType: 'cac_certificate' | 'showroom_proof' | 'director_id' | 'import_permit';
  referenceCode: string;
  notes?: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VehicleListing {
  id: string;
  sellerId: string;
  dealerId?: string;
  sellerType: 'dealer' | 'private_seller' | 'curated';
  sellerName: string;
  sellerWhatsapp?: string;
  make: string;
  makeSlug: string;
  model: string;
  modelSlug: string;
  generationName?: string;
  variantName?: string;
  category: VehicleCategory;
  title: string;
  slug: string;
  year: number;
  price: number;
  currency: 'NGN' | 'USD';
  priceType: PriceType;
  mileageKm: number;
  condition: VehicleCondition;
  bodyType: string;
  transmission: string;
  fuelType: string;
  drivetrain?: string;
  engine?: string;
  horsepower?: string;
  torque?: string;
  zeroTo100?: string;
  topSpeed?: string;
  exteriorColor?: string;
  interiorColor?: string;
  description: string;
  state: string;
  city: string;
  imageUrls: string[];
  listingStatus: ListingStatus;
  availabilityStatus: AvailabilityStatus;
  moderationStatus: ModerationStatus;
  moderationFeedback?: string;
  isFeatured: boolean;
  collectionTag?: string;
  enquiryCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VerificationRecord {
  id: string;
  listingId: string;
  verificationType: VerificationType;
  status: 'verified' | 'pending' | 'failed';
  notes: string;
  evidenceReference: string;
  verifiedBy: string;
  verifiedAt?: unknown;
}

export interface Enquiry {
  id: string;
  listingId?: string;
  listingTitle?: string;
  dealerId?: string;
  sellerId: string;
  buyerUid?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  message: string;
  preferredContact: 'whatsapp' | 'phone' | 'email';
  enquiryStatus: 'new' | 'contacted' | 'qualified' | 'closed';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SavedListing {
  id: string;
  profileId: string;
  listingId: string;
  createdAt?: unknown;
}

export interface Article {
  id: string;
  authorId: string;
  authorName: string;
  category: ArticleCategory;
  seriesName?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImageUrl: string;
  researchDate?: string;
  relatedMake?: string;
  relatedModel?: string;
  status: 'draft' | 'published';
  publishedAt?: unknown;
  updatedAt?: unknown;
}

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle?: string;
  reason: 'misleading_price' | 'fake_photos' | 'already_sold' | 'suspected_fraud' | 'other';
  details: string;
  reporterEmail?: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAt?: unknown;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt?: unknown;
}

export interface CatalogueVariant {
  id: string;
  name: string;
  engine: string;
  horsepower: string;
  torque: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  zeroTo100: string;
  topSpeed: string;
}

export interface CatalogueGeneration {
  id: string;
  generationName: string;
  generationCode: string;
  startYear: number;
  endYear: number | null;
  summary: string;
  variants: CatalogueVariant[];
}

export interface CatalogueModel {
  id: string;
  manufacturerSlug: string;
  name: string;
  slug: string;
  bodyType: string;
  category: VehicleCategory;
  introductionYear: number;
  overview: string;
  nigeriaNotes: string;
  heroImage: string;
  generations: CatalogueGeneration[];
}

export interface CatalogueManufacturer {
  id: string;
  name: string;
  slug: string;
  countryOfOrigin: string;
  foundedYear: number;
  description: string;
  featuredMakesLine: string;
}
