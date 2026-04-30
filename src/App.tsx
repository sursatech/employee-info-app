import React, { useEffect, useMemo, useState } from 'react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  panNumber: string;
  position: string;
  department: string;
  workLocation: string;
  employmentType: string;
  managerName: string;
  salary: number;
  hireDate: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyContactAddress: string;
  isActive: boolean;
}

type EmployeeForm = Omit<Employee, 'id' | 'salary' | 'isActive'> & {
  salary: string;
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/employees';

const emptyForm = (): EmployeeForm => ({
  name: '',
  email: '',
  phone: '',
  panNumber: '',
  position: '',
  department: '',
  workLocation: '',
  employmentType: 'Full-time',
  managerName: '',
  salary: '',
  hireDate: new Date().toISOString().split('T')[0],
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',
  emergencyContactAddress: '',
});

const normaliseDate = (value?: string) => {
  if (!value) return new Date().toISOString().split('T')[0];
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
};

const toEmployee = (employee: any): Employee => ({
  id: employee?.id,
  name: employee?.name || 'Unknown employee',
  email: employee?.email || 'No email',
  phone: employee?.phone || '',
  panNumber: employee?.panNumber || '',
  position: employee?.position || 'Not specified',
  department: employee?.department || 'Not assigned',
  workLocation: employee?.workLocation || '',
  employmentType: employee?.employmentType || 'Full-time',
  managerName: employee?.managerName || '',
  salary: Number(employee?.salary || 0),
  hireDate: normaliseDate(employee?.hireDate),
  emergencyContactName: employee?.emergencyContactName || '',
  emergencyContactRelationship: employee?.emergencyContactRelationship || '',
  emergencyContactPhone: employee?.emergencyContactPhone || '',
  emergencyContactEmail: employee?.emergencyContactEmail || '',
  emergencyContactAddress: employee?.emergencyContactAddress || '',
  isActive: employee?.isActive ?? true,
});

const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Support', 'Administration'];
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'];
const workLocations = ['Bengaluru', 'Chennai', 'Delhi NCR', 'Hyderabad', 'Mumbai', 'Pune', 'Remote', 'Hybrid'];

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Unable to load employees. Please check that the API is running.');
      const data = await res.json();
      setEmployees(data.map(toEmployee));
    } catch (err: any) {
      setError(err.message || 'Something went wrong while loading employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const stats = useMemo(() => {
    const departmentsCount = new Set(employees.map((employee) => employee.department).filter(Boolean)).size;
    const avgSalary = employees.length ? employees.reduce((sum, employee) => sum + employee.salary, 0) / employees.length : 0;
    return { departmentsCount, avgSalary };
  }, [employees]);

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditEmployee(employee);
      setForm({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        panNumber: employee.panNumber,
        position: employee.position,
        department: employee.department,
        workLocation: employee.workLocation,
        employmentType: employee.employmentType,
        managerName: employee.managerName,
        salary: String(employee.salary),
        hireDate: employee.hireDate,
        emergencyContactName: employee.emergencyContactName,
        emergencyContactRelationship: employee.emergencyContactRelationship,
        emergencyContactPhone: employee.emergencyContactPhone,
        emergencyContactEmail: employee.emergencyContactEmail,
        emergencyContactAddress: employee.emergencyContactAddress,
      });
    } else {
      setEditEmployee(null);
      setForm(emptyForm());
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditEmployee(null);
    setForm(emptyForm());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const salary = Number(form.salary);
    if (Number.isNaN(salary) || salary < 0) {
      setError('Annual salary must be a valid positive number.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...form,
        panNumber: form.panNumber.trim().toUpperCase(),
        salary,
      };

      const res = await fetch(editEmployee ? `${API_URL}/${editEmployee.id}` : API_URL, {
        method: editEmployee ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save employee details.');
      }

      closeModal();
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this employee record? This action cannot be undone.')) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee.');
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee.');
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.26),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#164e63_100%)]" />
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur">
            <p className="mb-4 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-sm font-semibold text-teal-100">
              Workforce operations dashboard
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Employee Management</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
              Maintain complete employee records with identity, role, working area, compensation, and emergency contact details in one clean workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <StatCard label="Employees" value={String(employees.length)} tone="teal" />
            <StatCard label="Departments" value={String(stats.departmentsCount)} tone="blue" />
            <StatCard label="Avg salary" value={stats.avgSalary ? `$${Math.round(stats.avgSalary).toLocaleString()}` : '$0'} tone="violet" />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur sm:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-950">Team directory</h2>
              <p className="mt-2 text-slate-600">Review employee profiles, contact details, PAN, working area, and emergency contact information.</p>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200"
              onClick={() => openModal()}
            >
              <span className="mr-2 text-xl">＋</span> Add employee
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
              <strong>Needs attention:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
              <p className="mt-5 font-semibold text-slate-600">Loading employee records…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">👥</div>
              <h3 className="text-2xl font-black text-slate-950">No employees yet</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">Add your first employee to start tracking identity, role, contact, working area, and emergency information.</p>
              <button className="mt-6 rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700" onClick={() => openModal()}>
                Add first employee
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {employees.map((employee) => (
                <article key={employee.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-lg">
                  <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr_1fr_auto] xl:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-xl font-black text-white shadow-lg">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{employee.name}</h3>
                        <p className="text-sm font-semibold text-slate-500">#{employee.id} · {employee.position}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge>{employee.department}</Badge>
                          <Badge>{employee.employmentType}</Badge>
                          {employee.workLocation && <Badge>{employee.workLocation}</Badge>}
                        </div>
                      </div>
                    </div>

                    <DetailBlock title="Contact" lines={[employee.email, employee.phone || 'Phone not added', employee.panNumber ? `PAN: ${employee.panNumber}` : 'PAN not added']} />
                    <DetailBlock title="Work" lines={[`Salary: $${employee.salary.toLocaleString()}`, `Hired: ${new Date(employee.hireDate).toLocaleDateString()}`, employee.managerName ? `Manager: ${employee.managerName}` : 'Manager not assigned']} />
                    <DetailBlock title="Emergency contact" lines={[employee.emergencyContactName || 'Not added', employee.emergencyContactPhone || 'Phone not added', employee.emergencyContactRelationship || 'Relationship not added']} />

                    <div className="flex gap-2 xl:flex-col">
                      <button className="rounded-xl bg-teal-50 px-4 py-2 font-bold text-teal-700 hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-100" onClick={() => openModal(employee)}>
                        Edit
                      </button>
                      <button className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100" onClick={() => handleDelete(employee.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Employee record</p>
                <h2 id="employee-form-title" className="mt-1 text-3xl font-black text-slate-950">{editEmployee ? 'Update employee' : 'Add employee'}</h2>
                <p className="mt-2 text-slate-600">Capture identity, contact person, employment, and working area details.</p>
              </div>
              <button className="rounded-full p-3 text-slate-500 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-100" onClick={closeModal} aria-label="Close form">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(92vh-125px)] overflow-y-auto p-6">
              <FormSection title="Personal and identity details" description="Core profile details used by HR and operations.">
                <TextField label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Aarav Sharma" required />
                <TextField label="Email address" name="email" value={form.email} onChange={handleChange} placeholder="aarav@company.com" type="email" required />
                <TextField label="Phone number" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" type="tel" />
                <TextField label="PAN number" name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} />
              </FormSection>

              <FormSection title="Role and working area" description="Where the employee works and who they report to.">
                <TextField label="Position" name="position" value={form.position} onChange={handleChange} placeholder="Senior Developer" required />
                <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={departments} placeholder="Select department" required />
                <SelectField label="Working area / location" name="workLocation" value={form.workLocation} onChange={handleChange} options={workLocations} placeholder="Select working area" />
                <SelectField label="Employment type" name="employmentType" value={form.employmentType} onChange={handleChange} options={employmentTypes} placeholder="Select type" required />
                <TextField label="Reporting manager" name="managerName" value={form.managerName} onChange={handleChange} placeholder="Manager name" />
                <TextField label="Annual salary" name="salary" value={form.salary} onChange={handleChange} placeholder="75000" type="number" min="0" required />
                <TextField label="Hire date" name="hireDate" value={form.hireDate} onChange={handleChange} type="date" required />
              </FormSection>

              <FormSection title="Emergency / contact person details" description="A trusted contact for urgent employee support.">
                <TextField label="Contact person name" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Priya Sharma" />
                <TextField label="Relationship" name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={handleChange} placeholder="Spouse, parent, sibling" />
                <TextField label="Contact person phone" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} placeholder="+91 98765 43210" type="tel" />
                <TextField label="Contact person email" name="emergencyContactEmail" value={form.emergencyContactEmail} onChange={handleChange} placeholder="contact@example.com" type="email" />
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="emergencyContactAddress">Contact person address</label>
                  <textarea
                    id="emergencyContactAddress"
                    name="emergencyContactAddress"
                    value={form.emergencyContactAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Street, city, state, postal code"
                  />
                </div>
              </FormSection>

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 flex flex-col gap-3 border-t border-slate-200 bg-white/95 p-6 backdrop-blur sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Saving…' : editEmployee ? 'Update employee' : 'Create employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'teal' | 'blue' | 'violet' }) {
  const toneClasses = {
    teal: 'from-teal-400 to-emerald-500',
    blue: 'from-blue-400 to-cyan-500',
    violet: 'from-violet-400 to-fuchsia-500',
  }[tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/95 p-5 shadow-xl">
      <div className={`mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${toneClasses}`} />
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{children}</span>;
}

function DetailBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="space-y-1 text-sm font-medium text-slate-700">
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-3xl border border-slate-200 p-5">
      <div className="mb-5">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">{children}</div>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: keyof EmployeeForm;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: string;
};

function TextField({ label, name, value, onChange, placeholder, type = 'text', required, maxLength, min }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        required={required}
        maxLength={maxLength}
        min={min}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder, required }: FieldProps & { options: string[] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

export default App;
