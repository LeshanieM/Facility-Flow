import { useEffect, useMemo, useState } from 'react';
import {
  createMaintenanceRequest,
  getDashboardSummary,
  getMyRequests,
  getNotifications,
  getRequestDetails,
  cancelMaintenanceRequest,
  getResources,
  addComment,
  editComment,
  deleteComment,
} from '../api/studentMaintenanceApi';

const initialForm = {
  title: '',
  description: '',
  location: '',
  room: '',
  category: '',
  priority: 'MEDIUM',
  preferredContact: '',
  attachments: [],
};

const normalizeSummary = (summary) => ({
  totalSubmitted: summary?.totalSubmitted ?? 0,
  pending: summary?.pending ?? 0,
  approved: summary?.approved ?? 0,
  completed: summary?.completed ?? 0,
  rejected: summary?.rejected ?? 0,
  overdue: summary?.overdue ?? 0,
});

const extractErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0]?.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const useStudentMaintenanceDashboard = () => {
  const [summary, setSummary] = useState(() => normalizeSummary());
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [pageError, setPageError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [toasts, setToasts] = useState([]);

  const pushToast = (tone, title, message = '') => {
    const id = `${tone}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, tone, title, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const hasRequests = requests.length > 0;

  const loadDashboard = async ({ background = false } = {}) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsBootstrapping(true);
      setPageError('');
    }

    try {

      const [summaryData, requestsData, notificationsData, resourcesData] = await Promise.all([
        getDashboardSummary(),
        getMyRequests(),
        getNotifications(),
        getResources(),
      ]);

      setSummary(normalizeSummary(summaryData));
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
    } catch (error) {
      const message = extractErrorMessage(error, 'Unable to load your incident ticketing and maintenance dashboard right now.');
      setPageError(message);
      pushToast('error', 'Dashboard unavailable', message);
    } finally {
      setIsBootstrapping(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);
  useEffect(() => {
    if (!selectedRequestId) {
      setSelectedRequest(null);
      return;
    }

    const loadDetails = async () => {
      setIsDetailLoading(true);

      try {
        const detail = await getRequestDetails(selectedRequestId);
        setSelectedRequest(detail);
      } catch (error) {
        setSelectedRequest(null);
        const message = extractErrorMessage(error, 'Unable to load the selected request details.');
        setPageError(message);
        pushToast('error', 'Request details unavailable', message);
      } finally {
        setIsDetailLoading(false);
      }
    };

    loadDetails();
  }, [selectedRequestId]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formValues.title.trim()) nextErrors.title = 'Title is required.';
    // Description is now optional, no limits.

    if (!formValues.location.trim()) nextErrors.location = 'Location is required.';
    if (!formValues.category) nextErrors.category = 'Category is required.';
    if (!formValues.priority) nextErrors.priority = 'Priority is required.';

    if (formValues.attachments && formValues.attachments.length > 3) {
      nextErrors.attachments = 'You can upload a maximum of 3 files.';
    }

    if (formValues.attachments && formValues.attachments.length > 0) {
      const MAX_SIZE = 10 * 1024 * 1024;
      for (let i = 0; i < formValues.attachments.length; i++) {
        if (formValues.attachments[i].size > MAX_SIZE) {
          nextErrors.attachments = 'Each file must not exceed 10MB.';
          break;
        }
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field, value) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === 'attachments') {
      let errorMsg = '';
      if (value && value.length > 3) {
        errorMsg = 'You can upload a maximum of 3 files.';
      } else {
        const MAX_SIZE = 10 * 1024 * 1024;
        for (let i = 0; i < (value || []).length; i++) {
          if (value[i].size > MAX_SIZE) {
            errorMsg = 'Each file must not exceed 10MB.';
            break;
          }
        }
      }
      setFormErrors((current) => ({
        ...current,
        attachments: errorMsg,
      }));
    } else {
      setFormErrors((current) => ({
        ...current,
        [field]: '',
      }));
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const createdRequest = await createMaintenanceRequest(formValues);
      setSubmitMessage('Incident or maintenance ticket submitted successfully.');
      setFormValues(initialForm);
      setSelectedRequestId(createdRequest?.id || selectedRequestId);
      pushToast('success', 'Request submitted', 'Your ticket has been saved and added to your dashboard.');
      await loadDashboard({ background: true });
    } catch (error) {
      const message = extractErrorMessage(error, 'We could not submit your incident or maintenance ticket.');
      setSubmitError(message);
      pushToast('error', 'Submission failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelRequest = async (requestId) => {
    setIsCancelling(true);
    try {
      await cancelMaintenanceRequest(requestId);
      pushToast('success', 'Ticket cancelled', 'Your incident ticket has been cancelled.');
      await loadDashboard({ background: true });
      if (selectedRequestId === requestId) {
         const detail = await getRequestDetails(requestId);
         setSelectedRequest(detail);
      }
    } catch (error) {
      const message = extractErrorMessage(error, 'Unable to cancel this ticket.');
      pushToast('error', 'Cancellation failed', message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAddComment = async (message) => {
    try {
      const updated = await addComment(selectedRequestId, { message, visibleToRequester: true });
      setSelectedRequest(updated);
      pushToast('success', 'Comment added', 'Your update has been posted to the ticket.');
      return true;
    } catch (error) {
      pushToast('error', 'Action failed', extractErrorMessage(error, 'Unable to add comment.'));
      return false;
    }
  };

  const handleEditComment = async (commentId, message) => {
    try {
      const updated = await editComment(selectedRequestId, commentId, { message, visibleToRequester: true });
      setSelectedRequest(updated);
      pushToast('success', 'Comment updated', 'Your comment has been modified.');
      return true;
    } catch (error) {
      pushToast('error', 'Action failed', extractErrorMessage(error, 'Unable to update comment.'));
      return false;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updated = await deleteComment(selectedRequestId, commentId);
      setSelectedRequest(updated);
      pushToast('success', 'Comment deleted', 'Your comment has been removed.');
      return true;
    } catch (error) {
      pushToast('error', 'Action failed', extractErrorMessage(error, 'Unable to delete comment.'));
      return false;
    }
  };

  const requestCards = useMemo(() => {
    return requests.map((request) => ({
      id: request.id,
      title: request.title,
      location: request.location,
      room: request.room,
      category: request.category,
      priority: request.priority,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      description: request.description,
    }));
  }, [requests]);

  return {
    summary,
    requests: requestCards,
    resources,
    notifications,
    selectedRequest,
    selectedRequestId,
    setSelectedRequestId,
    formValues,
    formErrors,
    updateField,
    submitRequest,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    hasRequests,
    isBootstrapping,
    isRefreshing,
    isSubmitting,
    isDetailLoading,
    isCancelling,
    pageError,
    submitMessage,
    submitError,
    toasts,
    cancelRequest,
    refreshDashboard: () => loadDashboard({ background: true }),
    clearSubmitStatus: () => {
      setSubmitMessage('');
      setSubmitError('');
    },
  };
};
