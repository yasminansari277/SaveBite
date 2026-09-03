export const uploadImage = async (file) => {
  if (!file) return '';
  return URL.createObjectURL(file);
};
