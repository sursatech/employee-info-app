import React, { useEffect, useState } from 'react';

// Employee type
interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
}

const API_URL = 'https://student-info-2-yltgce2minsyx1fw0ma1c6mz.preview.sursakit.com/students'; // Using same API for now

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    position: '', 
    department: '', 
    salary: '', 
    hireDate: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      
      // Transform API data to employee format
      const transformedData = data.map((employee: any) => ({
        id: employee?.id,
        name: employee?.name,
        email: employee?.email,
        position: employee?.position || 'Not Specified',
        department: employee?.department || 'Not Assigned',
        salary: employee?.salary || 0,
        hireDate: employee?.hireDate || 'Not Available'
      }));
      setEmployees(transformedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Open modal for create or edit
  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditEmployee(employee);
      setForm({ 
        name: employee.name, 
        email: employee.email, 
        position: employee.position,
        department: employee.department,
        salary: String(employee.salary),
        hireDate: employee.hireDate
      });
    } else {
      setEditEmployee(null);
      setForm({ name: '', email: '', position: '', department: '', salary: '', hireDate: '' });
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditEmployee(null);
    setForm({ name: '', email: '', position: '', department: '', salary: '', hireDate: '' });
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update employee
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        age: 25, // Default age for API compatibility
      };
      let res;
      if (editEmployee) {
        res = await fetch(`${API_URL}/${editEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error('Failed to save employee');
      closeModal();
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete employee
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Employee Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Streamline your workforce management with our modern employee tracking system
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header with Stats and Add Button */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Team Members</h2>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">{employees.length} Active Employees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">All Departments</span>
                </div>
              </div>
            </div>
            <button
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
              onClick={() => openModal()}
            >
              <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Employee
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Connection Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <p className="mt-6 text-lg text-gray-600 font-medium">Loading your team...</p>
            </div>
          ) : (
            /* Employees Table */
            <div className="overflow-hidden rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <tr>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Compensation</th>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tenure</th>
                      <th className="px-8 py-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200/50">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No employees yet</h3>
                            <p className="text-gray-500 text-lg max-w-md">Start building your team by adding your first employee. Click the button above to get started.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200">
                                  {employee.name}
                                </div>
                                <div className="text-sm text-gray-500">ID: #{employee.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.email}</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {employee.position}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              {employee.department}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-lg font-semibold text-gray-900">
                              ${employee.salary.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Annual</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {employee.hireDate !== 'Not Available' ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">Hired</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                                onClick={() => openModal(employee)}
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                                onClick={() => handleDelete(employee.id)}
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative transform transition-all">
            <div className="absolute top-6 right-6">
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                onClick={closeModal}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {editEmployee ? 'Update Employee' : 'Add New Employee'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {editEmployee ? 'Modify employee information' : 'Enter the details for your new team member'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                      placeholder="Enter employee name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                      placeholder="employee@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                      placeholder="Software Developer"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Department</label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg appearance-none bg-white"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Annual Salary</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                        placeholder="75000"
                        required
                        min={0}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Hire Date</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={form.hireDate}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold text-lg shadow-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      editEmployee ? 'Update Employee' : 'Create Employee'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Powered by Sursakit Footer */}
      <footer className="w-full text-center py-6 mt-12 text-gray-500 text-sm opacity-80">
        Powered by <a href="https://sursakit.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline">Sursakit</a>
      </footer>
    </div>
  );
}

export default App;
