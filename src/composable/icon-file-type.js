export const useIconFileType = (type) => {
  const iconTypes = {
    "video/mp4": "icon-type-video",
    "image/jpeg": "icon-type-image",
    "image/jpg": "icon-type-image",
    "image/png": "icon-type-image",
    "application/zip": "icon-type-zip",
    "application/msword": "icon-type-doc",
    "application/vnd.ms-excel": "icon-type-excel",
    "application/pdf": "icon-type-pdf",
  };
  return iconTypes[type] ? iconTypes[type] : "icon-type-common";
};
