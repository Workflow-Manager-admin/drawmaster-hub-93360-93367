import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContestContext from '../../context/ContestContext';
import SubmissionContext from '../../context/SubmissionContext';
import AuthContext from '../../context/AuthContext';
import './SubmissionForm.css';

/**
 * Submission Form Component
 * 
 * A form for creating or editing contest submissions.
 * Handles image uploads and form validation.
 */
const SubmissionForm = ({ submissionId = null }) => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  
  const isEditMode = !!submissionId;
  
  // Get contexts
  const { getContest, currentContest } = useContext(ContestContext);
  const { 
    createSubmission,
    getSubmission,
    updateSubmission,
    loading,
    error,
    clearError,
    currentSubmission
  } = useContext(SubmissionContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contestId: contestId || '',
    image: null,
    imageUrl: ''
  });
  
  const [preview, setPreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // If in edit mode, load submission data when component mounts
  useEffect(() => {
    if (isEditMode && submissionId) {
      const loadSubmission = async () => {
        await getSubmission(submissionId);
      };
      loadSubmission();
    }
  }, [isEditMode, submissionId, getSubmission]);
  
  // Load contest details when contestId changes
  useEffect(() => {
    if (contestId) {
      const loadContest = async () => {
        await getContest(contestId);
      };
      loadContest();
    }
  }, [contestId, getContest]);
  
  // Populate form data when submission loads (edit mode)
  useEffect(() => {
    if (isEditMode && currentSubmission) {
      setFormData({
        title: currentSubmission.title || '',
        description: currentSubmission.description || '',
        contestId: currentSubmission.contest || contestId || '',
        image: null,
        imageUrl: currentSubmission.imageUrl || ''
      });
      
      setPreview(currentSubmission.imageUrl || '');
    }
  }, [isEditMode, currentSubmission, contestId]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) {
      clearError();
    }
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file (JPEG, PNG, or GIF)'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Image file is too large (max 5MB)'
        }));
        return;
      }
      
      // Set image and create preview URL
      setFormData(prev => ({
        ...prev,
        image: selectedFile,
        imageUrl: ''
      }));
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      // Clear error if it exists
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.contestId) {
      errors.contestId = 'Contest is required';
    }
    
    if (!isEditMode && !formData.image && !formData.imageUrl) {
      errors.image = 'Please select an image for your submission';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (validateForm()) {
      try {
        if (isEditMode) {
          await updateSubmission(submissionId, formData);
          if (!error) {
            navigate('/submissions');
          }
        } else {
          const result = await createSubmission(formData);
          if (result) {
            navigate('/submissions');
          }
        }
      } catch (err) {
        console.error('Error submitting form:', err);
      }
    }
  };
  
  return (
    <div className="submission-form-container">
      <h2>{isEditMode ? 'Edit Submission' : 'Create New Submission'}</h2>
      
      {/* Show contest info if available */}
      {currentContest && (
        <div className="contest-info-card">
          <h3>Submitting to: {currentContest.title}</h3>
          {currentContest.status === 'active' ? (
            <span className="submission-deadline">
              Deadline: {new Date(currentContest.deadline).toLocaleDateString()}
            </span>
          ) : (
            <span className="submission-error-notice">
              This contest is not active. Submissions are closed.
            </span>
          )}
        </div>
      )}
      
      {error && <div className="submission-error">{error}</div>}
      
      <form className="submission-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title of your submission"
            className={formErrors.title ? 'error' : ''}
            disabled={loading}
          />
          {formErrors.title && <span className="error-message">{formErrors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your submission..."
            rows={4}
            disabled={loading}
          />
        </div>
        
        <div className="form-group image-upload-group">
          <label htmlFor="image">Submission Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className={formErrors.image ? 'error' : ''}
            disabled={loading}
          />
          {formErrors.image && <span className="error-message">{formErrors.image}</span>}
          
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : isEditMode ? 'Update Submission' : 'Submit Entry'}
          </button>
          
          <button
            type="button"
            className="btn cancel-btn"
            onClick={() => navigate('/submissions')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;
