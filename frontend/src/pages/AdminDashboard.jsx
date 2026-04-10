import { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dashboard data
  const [reports, setReports] = useState(null);

  // Employees
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', password: '' });
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Departments
  const [departments, setDepartments] = useState([]);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({ name: '', description: '' });
  const [editingDepartment, setEditingDepartment] = useState(null);

  // Services
  const [services, setServices] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', department_id: '' });
  const [editingService, setEditingService] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchReports();
    } else if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    } else if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab]);

  // ==================== Reports ====================

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports/summary');
      setReports(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== Employees ====================

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email || !employeeForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/employees', employeeForm);
      setSuccess('Employee added successfully');
      setEmployeeForm({ name: '', email: '', password: '' });
      setShowEmployeeForm(false);
      fetchEmployees();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    setLoading(true);
    try {
      await api.delete(`/admin/employees/${employeeId}`);
      setSuccess('Employee deleted successfully');
      fetchEmployees();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Departments ====================

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!departmentForm.name) {
      setError('Department name is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/departments', departmentForm);
      setSuccess('Department added successfully');
      setDepartmentForm({ name: '', description: '' });
      setShowDepartmentForm(false);
      fetchDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure? This will delete all associated services.')) return;

    setLoading(true);
    try {
      await api.delete(`/admin/departments/${deptId}`);
      setSuccess('Department deleted successfully');
      fetchDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Services ====================

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/services');
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.department_id) {
      setError('Service name and department are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/services', {
        ...serviceForm,
        department_id: parseInt(serviceForm.department_id),
      });
      setSuccess('Service added successfully');
      setServiceForm({ name: '', description: '', department_id: '' });
      setShowServiceForm(false);
      fetchServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    setLoading(true);
    try {
      await api.delete(`/admin/services/${serviceId}`);
      setSuccess('Service deleted successfully');
      fetchServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'N/A';
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage system resources and view reports</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          👥 Employees
        </button>
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          🏢 Departments
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🔧 Services
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : reports ? (
            <div className="reports-grid">
              <div className="report-card">
                <div className="report-icon">📋</div>
                <div className="report-data">
                  <div className="report-value">{reports.total_tokens}</div>
                  <div className="report-label">Total Tokens</div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">⏳</div>
                <div className="report-data">
                  <div className="report-value">{reports.pending_tokens}</div>
                  <div className="report-label">Pending Tokens</div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">▶️</div>
                <div className="report-data">
                  <div className="report-value">{reports.active_tokens}</div>
                  <div className="report-label">Active Tokens</div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">✅</div>
                <div className="report-data">
                  <div className="report-value">{reports.completed_tokens}</div>
                  <div className="report-label">Completed Tokens</div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">❌</div>
                <div className="report-data">
                  <div className="report-value">{reports.cancelled_tokens}</div>
                  <div className="report-label">Cancelled Tokens</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Employees</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowEmployeeForm(!showEmployeeForm)}
            >
              {showEmployeeForm ? 'Cancel' : '+ Add Employee'}
            </button>
          </div>

          {showEmployeeForm && (
            <form onSubmit={handleAddEmployee} className="form-card">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Adding...' : 'Add Employee'}
              </button>
            </form>
          )}

          {loading && !showEmployeeForm ? (
            <div className="loading">Loading employees...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteEmployee(emp.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {employees.length === 0 && <p className="empty-message">No employees found</p>}
            </div>
          )}
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Departments</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowDepartmentForm(!showDepartmentForm)}
            >
              {showDepartmentForm ? 'Cancel' : '+ Add Department'}
            </button>
          </div>

          {showDepartmentForm && (
            <form onSubmit={handleAddDepartment} className="form-card">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                  disabled={loading}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Adding...' : 'Add Department'}
              </button>
            </form>
          )}

          {loading && !showDepartmentForm ? (
            <div className="loading">Loading departments...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(dept => (
                    <tr key={dept.id}>
                      <td>{dept.id}</td>
                      <td>{dept.name}</td>
                      <td>{dept.description || '-'}</td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteDepartment(dept.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {departments.length === 0 && <p className="empty-message">No departments found</p>}
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="tab-content">
          <div className="content-header">
            <h2 className="content-title">Services</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowServiceForm(!showServiceForm)}
            >
              {showServiceForm ? 'Cancel' : '+ Add Service'}
            </button>
          </div>

          {showServiceForm && (
            <form onSubmit={handleAddService} className="form-card">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  disabled={loading}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={serviceForm.department_id}
                  onChange={(e) => setServiceForm({ ...serviceForm, department_id: e.target.value })}
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
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Adding...' : 'Add Service'}
              </button>
            </form>
          )}

          {loading && !showServiceForm ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc.id}>
                      <td>{svc.id}</td>
                      <td>{svc.name}</td>
                      <td>{getDepartmentName(svc.department_id)}</td>
                      <td>{svc.description || '-'}</td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteService(svc.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {services.length === 0 && <p className="empty-message">No services found</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
