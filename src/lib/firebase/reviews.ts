
import { db, auth } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, collectionGroup, doc, getDoc, getDocs, setDoc, deleteDoc, runTransaction, query, where, Timestamp } from 'firebase/firestore';
import type { Review, Hotel } from '@/lib/types';
import { getUser } from './users';

const getReviewsCollection = (hotelId: string) => {
    if (!db) throw new Error(firebaseNotConfiguredError);
    return collection(db, 'hotels', hotelId, 'reviews');
}

export async function addOrUpdateReview(
    hotelId: string,
    userId: string,
    rating: number,
    comment: string,
    isEditing: boolean,
) {
    if (!db) throw new Error(firebaseNotConfiguredError);
    
    const hotelRef = doc(db, 'hotels', hotelId);
    const reviewRef = doc(db, 'hotels', hotelId, 'reviews', userId);

    try {
        await runTransaction(db, async (transaction) => {
            const hotelDoc = await transaction.get(hotelRef);
            if (!hotelDoc.exists()) {
                throw "Hotel does not exist!";
            }

            const user = await getUser(userId);
            if (!user) {
                throw "User does not exist!";
            }
            
            const newReviewData: Omit<Review, 'id'> = {
                hotelId,
                customerId: userId,
                customerName: user.name,
                rating,
                comment,
                createdAt: new Date().toISOString()
            };
            
            const hotelData = hotelDoc.data() as Hotel;
            const oldReviewSnap = await transaction.get(reviewRef);

            let currentTotalRating = (hotelData.avgRating || 0) * (hotelData.reviewCount || 0);
            let currentReviewCount = hotelData.reviewCount || 0;
            
            const hotelUpdatePayload: { avgRating: number, reviewCount?: number } = {
                avgRating: 0,
            };
            
            if (oldReviewSnap.exists()) { // This is an edit
                const oldRating = oldReviewSnap.data().rating;
                currentTotalRating = currentTotalRating - oldRating + rating;
                // review count doesn't change on edit, so we only update avgRating
                hotelUpdatePayload.avgRating = currentReviewCount > 0 ? currentTotalRating / currentReviewCount : 0;
            } else { // This is a new review
                currentTotalRating = currentTotalRating + rating;
                currentReviewCount = currentReviewCount + 1;
                // review count changes, so we update both fields
                hotelUpdatePayload.avgRating = currentReviewCount > 0 ? currentTotalRating / currentReviewCount : 0;
                hotelUpdatePayload.reviewCount = currentReviewCount;
            }
            
            transaction.set(reviewRef, newReviewData);
            transaction.update(hotelRef, hotelUpdatePayload);
        });
        return { success: true };
    } catch (e: any) {
        console.error("Review transaction failed: ", e);
        return { success: false, error: e.toString() };
    }
}


export async function getReviewsByHotel(hotelId: string): Promise<Review[]> {
    const reviewsCollection = getReviewsCollection(hotelId);
    const q = query(reviewsCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}

export async function getUserReviewForHotel(hotelId: string, userId: string): Promise<Review | null> {
    if (!db) throw new Error(firebaseNotConfiguredError);
    const reviewDocRef = doc(db, 'hotels', hotelId, 'reviews', userId);
    const reviewDoc = await getDoc(reviewDocRef);
    if (reviewDoc.exists()) {
        return { id: reviewDoc.id, ...reviewDoc.data() } as Review;
    }
    return null;
}

export async function getAllReviews(): Promise<Review[]> {
    if (!db) throw new Error(firebaseNotConfiguredError);
    const reviews: Review[] = [];
    const q = query(collectionGroup(db, 'reviews'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    return reviews;
}

export async function deleteReview(hotelId: string, reviewId: string): Promise<{ success: boolean; error?: string }> {
     if (!db) throw new Error(firebaseNotConfiguredError);
    
    const hotelRef = doc(db, 'hotels', hotelId);
    const reviewRef = doc(db, 'hotels', hotelId, 'reviews', reviewId);

    try {
        await runTransaction(db, async (transaction) => {
            const hotelDoc = await transaction.get(hotelRef);
            const reviewDoc = await transaction.get(reviewRef);

            if (!hotelDoc.exists()) throw "Hotel does not exist!";
            if (!reviewDoc.exists()) throw "Review does not exist!";
            
            transaction.delete(reviewRef);

            const hotelData = hotelDoc.data() as Hotel;
            const reviewData = reviewDoc.data() as Review;

            const oldTotalRating = (hotelData.avgRating || 0) * (hotelData.reviewCount || 0);
            const oldReviewCount = hotelData.reviewCount || 0;

            if (oldReviewCount <= 1) {
                 transaction.update(hotelRef, {
                    avgRating: 0,
                    reviewCount: 0
                });
            } else {
                const newTotalRating = oldTotalRating - reviewData.rating;
                const newReviewCount = oldReviewCount - 1;
                const newAvgRating = newTotalRating / newReviewCount;
                transaction.update(hotelRef, {
                    avgRating: newAvgRating,
                    reviewCount: newReviewCount
                });
            }
        });
        return { success: true };
    } catch (e: any) {
        console.error("Delete review transaction failed: ", e);
        return { success: false, error: e.toString() };
    }
}
