import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { SEED_ARTICLES, SEED_DEALERS, SEED_LISTINGS, SEED_VERIFICATION_RECORDS } from '../data/seedData';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';
import { slugify } from '../lib/format';
import type {
  Article,
  ArticleCategory,
  AuditLog,
  AvailabilityStatus,
  Dealer,
  DealerDocument,
  Enquiry,
  ListingReport,
  ModerationStatus,
  PriceType,
  VehicleListing,
  VerificationRecord,
  VerificationType,
} from '../types/supercars';

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Public readers with seed showcase fallback when Firestore collection is empty on initial launch
export async function fetchPublishedListings(): Promise<VehicleListing[]> {
  try {
    const q = query(
      collection(db, 'vehicle_listings'),
      where('listingStatus', '==', 'published')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_LISTINGS;
    }
    const items = snap.docs.map((d) => d.data() as VehicleListing);
    return items;
  } catch (error) {
    console.warn('Using curated showcase fallback while reading listings:', error);
    return SEED_LISTINGS;
  }
}

export async function fetchVerifiedDealers(): Promise<Dealer[]> {
  try {
    const q = query(
      collection(db, 'dealers'),
      where('verificationStatus', '==', 'verified')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_DEALERS;
    }
    return snap.docs.map((d) => d.data() as Dealer);
  } catch (error) {
    console.warn('Using curated dealership fallback:', error);
    return SEED_DEALERS;
  }
}

export async function fetchPublishedArticles(): Promise<Article[]> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_ARTICLES;
    }
    return snap.docs.map((d) => d.data() as Article);
  } catch (error) {
    console.warn('Using curated journal fallback:', error);
    return SEED_ARTICLES;
  }
}

export async function fetchVerificationRecordsForListing(
  listingId: string
): Promise<VerificationRecord[]> {
  try {
    const q = query(
      collection(db, 'verification_records'),
      where('listingId', '==', listingId),
      where('status', '==', 'verified')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_VERIFICATION_RECORDS.filter((r) => r.listingId === listingId);
    }
    return snap.docs.map((d) => d.data() as VerificationRecord);
  } catch {
    return SEED_VERIFICATION_RECORDS.filter((r) => r.listingId === listingId);
  }
}

// Public submissions (no authentication required)
export async function submitBuyerEnquiry(input: {
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
}): Promise<string> {
  const id = makeId('enq');
  const path = `enquiries/${id}`;
  try {
    await setDoc(doc(db, 'enquiries', id), {
      id,
      listingId: input.listingId || '',
      listingTitle: input.listingTitle || '',
      dealerId: input.dealerId || '',
      sellerId: input.sellerId,
      buyerUid: input.buyerUid || '',
      buyerName: input.buyerName.trim(),
      buyerPhone: input.buyerPhone.trim(),
      buyerEmail: input.buyerEmail.trim(),
      message: input.message.trim(),
      preferredContact: input.preferredContact,
      enquiryStatus: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitSuspiciousListingReport(input: {
  listingId: string;
  listingTitle: string;
  reason: 'misleading_price' | 'fake_photos' | 'already_sold' | 'suspected_fraud' | 'other';
  details: string;
  reporterEmail?: string;
}): Promise<string> {
  const id = makeId('rep');
  const path = `listing_reports/${id}`;
  try {
    await setDoc(doc(db, 'listing_reports', id), {
      id,
      listingId: input.listingId,
      listingTitle: input.listingTitle,
      reason: input.reason,
      details: input.details.trim(),
      reporterEmail: input.reporterEmail?.trim() || '',
      status: 'open',
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function subscribeToNewsletter(email: string): Promise<string> {
  const id = makeId('sub');
  const path = `newsletter_subscribers/${id}`;
  try {
    await setDoc(doc(db, 'newsletter_subscribers', id), {
      id,
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Authenticated Seller & Dealer operations
export async function fetchSellerListings(sellerId: string): Promise<VehicleListing[]> {
  const path = 'vehicle_listings';
  try {
    const q = query(
      collection(db, path),
      where('sellerId', '==', sellerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VehicleListing);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchOwnerDealer(ownerId: string): Promise<Dealer | null> {
  const path = 'dealers';
  try {
    const q = query(collection(db, path), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Dealer;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchOwnerDealerDocuments(ownerId: string): Promise<DealerDocument[]> {
  const path = 'dealer_documents';
  try {
    const q = query(collection(db, path), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DealerDocument);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function registerDealerApplication(input: {
  ownerId: string;
  businessName: string;
  description: string;
  phone: string;
  whatsapp: string;
  website?: string;
  state: string;
  city: string;
  address: string;
  documentType: 'cac_certificate' | 'showroom_proof' | 'director_id' | 'import_permit';
  documentReference: string;
  documentNotes?: string;
}): Promise<string> {
  const dealerId = makeId('dlr');
  const docId = makeId('ddoc');
  const slug = `${slugify(input.businessName)}-${dealerId.slice(-4)}`;

  try {
    await setDoc(doc(db, 'dealers', dealerId), {
      id: dealerId,
      ownerId: input.ownerId,
      businessName: input.businessName.trim(),
      slug,
      description: input.description.trim(),
      coverImageUrl: '/src/assets/images/listing_g63_obsidian_1794813252119.jpg',
      phone: input.phone.trim(),
      whatsapp: input.whatsapp.trim(),
      website: input.website?.trim() || '',
      state: input.state.trim(),
      city: input.city.trim(),
      address: input.address.trim(),
      verificationStatus: 'pending',
      isFeatured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'dealer_documents', docId), {
      id: docId,
      dealerId,
      ownerId: input.ownerId,
      documentType: input.documentType,
      referenceCode: input.documentReference.trim(),
      notes: input.documentNotes?.trim() || '',
      reviewStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return dealerId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `dealers/${dealerId}`);
  }
}

export async function submitDealerSupportingDoc(input: {
  dealerId: string;
  ownerId: string;
  documentType: 'cac_certificate' | 'showroom_proof' | 'director_id' | 'import_permit';
  referenceCode: string;
  notes?: string;
}): Promise<string> {
  const docId = makeId('ddoc');
  try {
    await setDoc(doc(db, 'dealer_documents', docId), {
      id: docId,
      dealerId: input.dealerId,
      ownerId: input.ownerId,
      documentType: input.documentType,
      referenceCode: input.referenceCode.trim(),
      notes: input.notes?.trim() || '',
      reviewStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `dealer_documents/${docId}`);
  }
}

export async function submitVehicleListingForModeration(
  input: Omit<
    VehicleListing,
    | 'id'
    | 'slug'
    | 'listingStatus'
    | 'availabilityStatus'
    | 'moderationStatus'
    | 'isFeatured'
    | 'enquiryCount'
    | 'createdAt'
    | 'updatedAt'
  >
): Promise<string> {
  const id = makeId('lst');
  const slug = `${slugify(`${input.year}-${input.make}-${input.model}-${input.city}`)}-${id.slice(-4)}`;
  const path = `vehicle_listings/${id}`;

  try {
    await setDoc(doc(db, 'vehicle_listings', id), {
      ...input,
      id,
      slug,
      makeSlug: slugify(input.make),
      modelSlug: slugify(input.model),
      listingStatus: 'pending',
      availabilityStatus: 'available',
      moderationStatus: 'pending',
      isFeatured: false,
      enquiryCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSellerListingDetails(
  listingId: string,
  updates: {
    title: string;
    price: number;
    priceType: PriceType;
    availabilityStatus: AvailabilityStatus;
    mileageKm: number;
    description: string;
    resubmit?: boolean;
  }
): Promise<void> {
  const path = `vehicle_listings/${listingId}`;
  try {
    const payload: Record<string, unknown> = {
      title: updates.title.trim(),
      price: updates.price,
      priceType: updates.priceType,
      availabilityStatus: updates.availabilityStatus,
      mileageKm: updates.mileageKm,
      description: updates.description.trim(),
      updatedAt: serverTimestamp(),
    };
    if (updates.resubmit) {
      payload.listingStatus = 'pending';
    }
    await updateDoc(doc(db, 'vehicle_listings', listingId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchSellerEnquiries(sellerId: string): Promise<Enquiry[]> {
  const path = 'enquiries';
  try {
    const q = query(collection(db, path), where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Enquiry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchBuyerEnquiries(buyerUid: string): Promise<Enquiry[]> {
  const path = 'enquiries';
  try {
    const q = query(collection(db, path), where('buyerUid', '==', buyerUid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Enquiry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateEnquiryPipelineStatus(
  enquiryId: string,
  status: 'new' | 'contacted' | 'qualified' | 'closed'
): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'enquiries', enquiryId), {
      enquiryStatus: status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Administrator Control Centre operations
export async function fetchAllAdminData(): Promise<{
  listings: VehicleListing[];
  dealers: Dealer[];
  dealerDocs: DealerDocument[];
  enquiries: Enquiry[];
  reports: ListingReport[];
  articles: Article[];
  auditLogs: AuditLog[];
  verifications: VerificationRecord[];
}> {
  try {
    const [
      listingsSnap,
      dealersSnap,
      docsSnap,
      enquiriesSnap,
      reportsSnap,
      articlesSnap,
      logsSnap,
      verSnap,
    ] = await Promise.all([
      getDocs(collection(db, 'vehicle_listings')),
      getDocs(collection(db, 'dealers')),
      getDocs(collection(db, 'dealer_documents')),
      getDocs(collection(db, 'enquiries')),
      getDocs(collection(db, 'listing_reports')),
      getDocs(collection(db, 'articles')),
      getDocs(query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'verification_records')),
    ]);

    return {
      listings: listingsSnap.docs.map((d) => d.data() as VehicleListing),
      dealers: dealersSnap.docs.map((d) => d.data() as Dealer),
      dealerDocs: docsSnap.docs.map((d) => d.data() as DealerDocument),
      enquiries: enquiriesSnap.docs.map((d) => d.data() as Enquiry),
      reports: reportsSnap.docs.map((d) => d.data() as ListingReport),
      articles: articlesSnap.docs.map((d) => d.data() as Article),
      auditLogs: logsSnap.docs.map((d) => d.data() as AuditLog),
      verifications: verSnap.docs.map((d) => d.data() as VerificationRecord),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin_dashboard');
  }
}

async function writeAuditLog(
  actorId: string,
  actorEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  summary: string
): Promise<void> {
  const id = makeId('aud');
  await setDoc(doc(db, 'audit_logs', id), {
    id,
    actorId,
    actorEmail,
    action,
    targetType,
    targetId,
    summary,
    createdAt: serverTimestamp(),
  });
}

export async function adminModerateListing(input: {
  listingId: string;
  moderationStatus: ModerationStatus;
  listingStatus: 'published' | 'rejected' | 'pending' | 'archived';
  isFeatured: boolean;
  feedback: string;
  actorId: string;
  actorEmail: string;
}): Promise<void> {
  const path = `vehicle_listings/${input.listingId}`;
  try {
    await updateDoc(doc(db, 'vehicle_listings', input.listingId), {
      moderationStatus: input.moderationStatus,
      listingStatus: input.listingStatus,
      isFeatured: input.isFeatured,
      moderationFeedback: input.feedback.trim(),
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      input.actorId,
      input.actorEmail,
      `listing_${input.moderationStatus}`,
      'vehicle_listing',
      input.listingId,
      `Set listing to ${input.listingStatus} (${input.moderationStatus})${input.feedback ? `: ${input.feedback}` : ''}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminAddVerificationRecord(input: {
  listingId: string;
  verificationType: VerificationType;
  status: 'verified' | 'pending' | 'failed';
  notes: string;
  evidenceReference: string;
  actorId: string;
  actorEmail: string;
}): Promise<void> {
  const id = makeId('ver');
  try {
    await setDoc(doc(db, 'verification_records', id), {
      id,
      listingId: input.listingId,
      verificationType: input.verificationType,
      status: input.status,
      notes: input.notes.trim(),
      evidenceReference: input.evidenceReference.trim(),
      verifiedBy: input.actorEmail,
      verifiedAt: serverTimestamp(),
    });
    await writeAuditLog(
      input.actorId,
      input.actorEmail,
      'verification_recorded',
      'vehicle_listing',
      input.listingId,
      `Recorded ${input.verificationType} as ${input.status} (${input.evidenceReference})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `verification_records/${id}`);
  }
}

export async function adminReviewDealer(input: {
  dealerId: string;
  verificationStatus: 'verified' | 'rejected' | 'info_requested';
  isFeatured: boolean;
  actorId: string;
  actorEmail: string;
}): Promise<void> {
  try {
    await updateDoc(doc(db, 'dealers', input.dealerId), {
      verificationStatus: input.verificationStatus,
      isFeatured: input.isFeatured,
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      input.actorId,
      input.actorEmail,
      `dealer_${input.verificationStatus}`,
      'dealer',
      input.dealerId,
      `Updated dealer verification status to ${input.verificationStatus}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `dealers/${input.dealerId}`);
  }
}

export async function adminPublishArticle(input: {
  title: string;
  category: ArticleCategory;
  seriesName?: string;
  excerpt: string;
  body: string;
  featuredImageUrl: string;
  researchDate?: string;
  relatedMake?: string;
  relatedModel?: string;
  actorId: string;
  actorEmail: string;
  authorName: string;
}): Promise<string> {
  const id = makeId('art');
  const slug = `${slugify(input.title)}-${id.slice(-4)}`;
  try {
    await setDoc(doc(db, 'articles', id), {
      id,
      authorId: input.actorId,
      authorName: input.authorName.trim(),
      category: input.category,
      seriesName: input.seriesName?.trim() || '',
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim(),
      body: input.body.trim(),
      featuredImageUrl: input.featuredImageUrl.trim(),
      researchDate: input.researchDate?.trim() || 'Research dated November 2026',
      relatedMake: input.relatedMake?.trim() || '',
      relatedModel: input.relatedModel?.trim() || '',
      status: 'published',
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      input.actorId,
      input.actorEmail,
      'article_published',
      'article',
      id,
      `Published journal article "${input.title.trim()}"`
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `articles/${id}`);
  }
}

export async function adminResolveReport(
  reportId: string,
  status: 'reviewed' | 'resolved',
  actorId: string,
  actorEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'listing_reports', reportId), {
      status,
    });
    await writeAuditLog(
      actorId,
      actorEmail,
      `report_${status}`,
      'listing_report',
      reportId,
      `Marked report as ${status}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `listing_reports/${reportId}`);
  }
}

export async function adminSeedCuratedLaunchInventory(
  actorId: string,
  actorEmail: string
): Promise<number> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const dealer of SEED_DEALERS) {
      batch.set(doc(db, 'dealers', dealer.id), {
        ...dealer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      count += 1;
    }

    for (const listing of SEED_LISTINGS) {
      batch.set(doc(db, 'vehicle_listings', listing.id), {
        ...listing,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      count += 1;
    }

    for (const record of SEED_VERIFICATION_RECORDS) {
      batch.set(doc(db, 'verification_records', record.id), {
        ...record,
        verifiedAt: serverTimestamp(),
      });
      count += 1;
    }

    for (const article of SEED_ARTICLES) {
      batch.set(doc(db, 'articles', article.id), {
        ...article,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      count += 1;
    }

    await batch.commit();
    await writeAuditLog(
      actorId,
      actorEmail,
      'seed_launch_inventory',
      'system',
      'launch_v1',
      `Seeded ${count} curated dealers, listings, verification records, and articles`
    );
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}
