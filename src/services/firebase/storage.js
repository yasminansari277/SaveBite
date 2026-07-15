import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isSimulationMode } from './config';

/**
 * Upload an image to Firebase Storage (or returns base64 string in simulation mode)
 * @param {File} file - The file object to upload
 * @param {string} path - The folder path in storage (e.g. 'avatars' or 'ingredients')
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImage = async (file, path = 'ingredients') => {
  if (!file) return '';

  if (isSimulationMode) {
    // Generate a Base64 string for local simulation
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  } else {
    try {
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `${path}/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Firebase Storage upload failed:', error);
      throw error;
    }
  }
};
