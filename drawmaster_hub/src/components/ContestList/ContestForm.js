import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContestContext from '../../context/ContestContext';

/**
 * ContestForm Component
 * 
 * A form for creating or editing contests.
 * Admin-only component that handles validation and submission.
 */
const ContestForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  // Get contest context functions and state
  const { 
    createContest, 
    updateContest, 
    getContest, 
    currentContest,
    loading, 
    error, 
    clearError,
    isAdmin
  } = useContext(ContestContext);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    startDate: '',
    deadline: '',
    status: 'draft',
    prizes: [{ rank: 1, description: '' }],
    categories: []
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  
  // If in edit mode, load contest data when component mounts
  useEffect(() => {
    if (isEditMode) {
      const loadContest = async () => {
        const contest = await getContest(id);
        if (contest) {
          // Format dates for form inputs
          const formattedContest = {
            ...contest,
            startDate: formatDateForInput(contest.startDate),
            deadline: formatDateForInput(contest.deadline)
          };
          setFormData(formattedContest);
        }
      };
      
      loadContest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);
  
  // Check for admin permission
  useEffect(() => {
    if (!isAdmin) {
      navigate('/contests');
    }
  }, [isAdmin, navigate]);
  
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear context error
    if (error) {
      clearError();
    }
  };
  
  // Handle prize field changes
  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index] = {
      ...updatedPrizes[index],
      [field]: field === 'rank' ? parseInt(value, 10) : value
    };
    
    setFormData(prev => ({
      ...prev,
      prizes: updatedPrizes
    }));
    
    // Clear error for prizes if it exists
    if (formErrors.prizes) {
      setFormErrors(prev => ({
        ...prev,
        prizes: ''
      }));
    }
  };
  
  // Add a new prize
  const addPrize = () => {
    const newRank = formData.prizes.length + 1;
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { rank: newRank, description: '' }]
    }));
  };
  
  // Remove a prize
  const removePrize = (index) => {
    if (formData.prizes.length <= 1) return;
    
    const updatedPrizes = formData.prizes.filter((_, i) => i !== index);
    // Re-number ranks
    const rerankedPrizes = updatedPrizes.map((prize, i) => ({
      ...prize,
      rank: i + 1
    }));
    
    setFormData(prev => ({
      ...prev,
      prizes: rerankedPrizes
    }));
  };
  
  // Handle category input
  const handleCategoryInputChange = (e) => {
    setCategoryInput(e.target.value);
  };
  
  // Add category to list
  const addCategory = () => {
    if (!categoryInput.trim()) return;
    
    if (!formData.categories.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()]
      }));
    }
    
    setCategoryInput('');
  };
  
  // Remove category from list
  const removeCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Convert dates from string to Date objects for API
    const contestData = {
      ...formData,
      startDate: new Date(formData.startDate),
      deadline: new Date(formData.deadline)
    };
    
    try {
      if (isEditMode) {
        await updateContest(id, contestData);
      } else {
        await createContest(contestData);
      }
      
      // If no errors, redirect to contests page
      if (!error) {
        navigate('/contests');
      }
    } catch (err) {
      console.error('Error submitting contest:', err);
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.rules.trim()) {
      errors.rules = 'Rules are required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.deadline) {
      errors.deadline = 'Deadline is required';
    } else if (formData.startDate && new Date(formData.deadline) <= new Date(formData.startDate)) {
      errors.deadline = 'Deadline must be after start date';
    }
    
    // Check if prizes are valid
    if (formData.prizes.some(prize => !prize.description.trim())) {
      errors.prizes = 'All prizes must have a description';
    }
    
    return errors;
  };
  
  // If not admin, redirect would have happened
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="contest-form-container">
      <h2 className="form-title">
        {isEditMode ? 'Edit Contest' : 'Create New Contest'}
      </h2>
      
      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}
      
      {loading && !formSubmitted ? (
        <div className="loading-indicator">
          <p>Loading contest data...</p>
        </div>
      ) : (
        <form className="contest-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contest title"
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <span className="form-error">{formErrors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed contest description"
              rows={5}
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && <span className="form-error">{formErrors.description}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="rules">Rules</label>
            <textarea
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              placeholder="Contest rules and guidelines"
              rows={4}
              className={formErrors.rules ? 'error' : ''}
            />
            {formErrors.rules && <span className="form-error">{formErrors.rules}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={formErrors.startDate ? 'error' : ''}
              />
              {formErrors.startDate && <span className="form-error">{formErrors.startDate}</span>}
            </div>
            
            <div className="form-group half-width">
              <label htmlFor="deadline">Deadline</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={formErrors.deadline ? 'error' : ''}
              />
              {formErrors.deadline && <span className="form-error">{formErrors.deadline}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="form-section">
            <h3>Prizes</h3>
            {formErrors.prizes && <span className="form-error">{formErrors.prizes}</span>}
            
            {formData.prizes.map((prize, index) => (
              <div key={index} className="prize-row">
                <div className="prize-rank">
                  <label htmlFor={`prize-rank-${index}`}>Rank</label>
                  <input
                    type="number"
                    id={`prize-rank-${index}`}
                    value={prize.rank}
                    onChange={(e) => handlePrizeChange(index, 'rank', e.target.value)}
                    min="1"
                    disabled
                  />
                </div>
                
                <div className="prize-description">
                  <label htmlFor={`prize-desc-${index}`}>Prize</label>
                  <input
                    type="text"
                    id={`prize-desc-${index}`}
                    value={prize.description}
                    onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                    placeholder="Prize description"
                  />
                </div>
                
                <button 
                  type="button" 
                  className="btn-icon remove-prize"
                  onClick={() => removePrize(index)}
                  disabled={formData.prizes.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button type="button" className="btn add-prize" onClick={addPrize}>
              Add Prize
            </button>
          </div>
          
          <div className="form-section">
            <h3>Categories</h3>
            <div className="category-input">
              <input
                type="text"
                value={categoryInput}
                onChange={handleCategoryInputChange}
                placeholder="Add category"
              />
              <button type="button" className="btn add-category" onClick={addCategory}>
                Add
              </button>
            </div>
            
            <div className="category-list">
              {formData.categories.map((category, index) => (
                <div key={index} className="category-tag">
                  {category}
                  <button 
                    type="button" 
                    className="remove-category"
                    onClick={() => removeCategory(category)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.categories.length === 0 && (
                <span className="no-categories">No categories added</span>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn submit-btn" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Contest' : 'Create Contest'}
            </button>
            <button 
              type="button" 
              className="btn cancel-btn"
              onClick={() => navigate('/contests')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContestForm;
