import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import api from '../services/api';
import './BookToken.css';

const BookToken = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    department_id: '',
    service_id: '',
    date: '',
    time_slot: '',
  });
  const [bookedToken, setBookedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Time slots
  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
  ];

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch services when department changes
  useEffect(() => {
    if (formData.department_id) {
      fetchServices(formData.department_id);
    } else {
      setServices([]);
      setFormData(prev => ({ ...prev, service_id: '' }));
    }
  }, [formData.department_id]);

  /**
   * Fetch departments from API
   */
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load departments');
      console.error(err);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  /**
   * Fetch services for a specific department
   */
  const fetchServices = async (departmentId) => {
    try {
      const response = await api.get('/admin/services');
      // Filter services by department
      const filteredServices = response.data.filter(
        svc => svc.department_id === parseInt(departmentId)
      );
      setServices(filteredServices);
    } catch (err) {
      console.error('Failed to load services:', err);
      setServices([]);
    }
  };

  /**
   * Handle form input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  /**
   * Get minimum date (today)
   */
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.department_id || !formData.service_id || !formData.date || !formData.time_slot) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Call API to book token
      const response = await api.post('/token/book', {
        service_id: parseInt(formData.service_id),
        date: formData.date,
        time_slot: formData.time_slot,
      });

      setBookedToken(response.data);
      setShowSuccess(true);
      setFormData({
        department_id: '',
        service_id: '',
        date: '',
        time_slot: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle close success dialog
   */
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate('/dashboard');
  };

  if (departmentsLoading && departments.length === 0) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="book-token-container">
      <div className="book-token-card">
        <div className="book-token-header">
          <h1 className="book-token-title">Book a Token</h1>
          <p className="book-token-subtitle">Select a service and preferred time slot</p>
        </div>

        {error && <div className="book-token-error">{error}</div>}

        <form onSubmit={handleSubmit} className="book-token-form">
          {/* Department Selection */}
          <div className="form-group">
            <label htmlFor="department_id" className="form-label">
              Department <span className="required">*</span>
            </label>
            <select
              id="department_id"
              name="department_id"
              className="form-input"
              value={formData.department_id}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          {formData.department_id && (
            <div className="form-group">
              <label htmlFor="service_id" className="form-label">
                Service <span className="required">*</span>
              </label>
              <select
                id="service_id"
                name="service_id"
                className="form-input"
                value={formData.service_id}
                onChange={handleInputChange}
                disabled={loading || services.length === 0}
                required
              >
                <option value="">
                  {services.length === 0 ? 'No services available' : 'Select a service'}
                </option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Selection */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Preferred Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleInputChange}
              min={getMinDate()}
              disabled={loading}
              required
            />
          </div>

          {/* Time Slot Selection */}
          <div className="form-group">
            <label htmlFor="time_slot" className="form-label">
              Time Slot <span className="required">*</span>
            </label>
            <select
              id="time_slot"
              name="time_slot"
              className="form-input"
              value={formData.time_slot}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="book-token-button"
            disabled={loading || !formData.department_id || !formData.service_id}
          >
            {loading ? 'Booking Token...' : 'Book Token'}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && bookedToken && (
        <div className="modal-overlay">
          <div className="modal-card success-modal">
            <div className="modal-header">
              <h2 className="modal-title">Token Booked Successfully!</h2>
            </div>

            <div className="success-content">
              <div className="token-number-display">
                <p className="token-label">Your Token Number</p>
                <div className="token-number">{bookedToken.token_number}</div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{bookedToken.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time Slot:</span>
                  <span className="detail-value">{bookedToken.time_slot}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-pending">{bookedToken.status}</span>
                </div>
              </div>

              <p className="success-message">
                Please keep your token number for reference. You will be called when it's your turn.
              </p>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleCloseSuccess}
                className="modal-button modal-button-primary"
              >
                Go to My Tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookToken;
