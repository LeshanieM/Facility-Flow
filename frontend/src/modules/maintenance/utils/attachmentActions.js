import api from '../../../services/api';

export const getAttachmentName = (attachment) => {
  if (!attachment) return 'Attachment';
  return attachment.fileName || attachment.name || attachment.originalFilename || 'Attachment';
};

const createBlobUrl = (response) => {
  const blob = response?.data instanceof Blob
    ? response.data
    : new Blob([response?.data], { type: response?.headers?.['content-type'] || 'application/octet-stream' });

  return URL.createObjectURL(blob);
};

export const viewAttachment = async (attachment) => {
  if (!attachment?.viewUrl) {
    throw new Error('This attachment is not available for preview.');
  }

  const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
  const response = await api.get(attachment.viewUrl, { responseType: 'blob' });
  const blobUrl = createBlobUrl(response);

  if (previewWindow) {
    previewWindow.location.href = blobUrl;
  } else {
    window.location.href = blobUrl;
  }

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};

export const downloadAttachment = async (attachment) => {
  if (!attachment?.downloadUrl) {
    throw new Error('This attachment is not available for download.');
  }

  const response = await api.get(attachment.downloadUrl, { responseType: 'blob' });
  const blobUrl = createBlobUrl(response);
  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = getAttachmentName(attachment);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 5_000);
};
