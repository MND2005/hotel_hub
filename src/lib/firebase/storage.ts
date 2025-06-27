import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export function uploadImage(file: File, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!storage) {
            return reject(new Error("Firebase Storage is not configured."));
        }
         if (!storage.app.options.storageBucket) {
            console.error("Firebase Storage bucket is not configured. Please check your NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable.");
            return reject(new Error("Firebase Storage bucket is not configured in your environment variables."));
        }

        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, `${path}/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Optional: observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error("Firebase Storage upload error:", error.code, error.message);
                switch (error.code) {
                    case 'storage/unauthorized':
                        reject(new Error("You do not have permission to upload files. Check your Firebase Storage rules."));
                        break;
                    case 'storage/canceled':
                        reject(new Error("The file upload was canceled."));
                        break;
                    case 'storage/retry-limit-exceeded':
                        reject(new Error("Network error: The upload timed out. Please check your connection and try again."));
                        break;
                    case 'storage/unknown':
                        reject(new Error("An unknown error occurred during upload. Check your network and Firebase Storage CORS settings."));
                        break;
                    default:
                         reject(new Error(`File upload failed: ${error.message}`));
                }
            }, 
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(reject);
            }
        );
    });
}
