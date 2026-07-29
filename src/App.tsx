import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Role = "patient" | "doctor" | "receptionist" | "lab" | "admin";
type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Checked in"
  | "Completed"
  | "Cancelled";
type ModalName =
  | "book"
  | "appointment"
  | "reschedule"
  | "consultation"
  | "invoice"
  | "lab"
  | "user"
  | null;

type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  room: string;
};

type LabTest = {
  id: string;
  patient: string;
  doctor: string;
  test: string;
  date: string;
  status: "Pending" | "In progress" | "Completed";
  result?: string;
};

type Invoice = {
  id: string;
  patient: string;
  service: string;
  amount: number;
  date: string;
  status: "Pending" | "Paid";
};

type ClinicUser = {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "lab"> | "Lab Technician";
  status: "Active" | "Inactive";
};

const roleMeta: Record<Role, { label: string; title: string; initials: string }> = {
  patient: { label: "Patient", title: "Patient Dashboard", initials: "AS" },
  doctor: { label: "Doctor", title: "Doctor Dashboard", initials: "LH" },
  receptionist: {
    label: "Receptionist",
    title: "Reception Dashboard",
    initials: "MA",
  },
  lab: { label: "Lab Technician", title: "Lab Dashboard", initials: "OS" },
  admin: { label: "Administrator", title: "Admin Dashboard", initials: "AD" },
};

const roleNames: Record<Role, string> = {
  patient: "Ahmed Saad",
  doctor: "Dr. Lina Hassan",
  receptionist: "Maya Adel",
  lab: "Omar Saleh",
  admin: "System Admin",
};

const navByRole: Record<Role, { label: string; icon: string }[]> = {
  patient: [
    { label: "Overview", icon: "OV" },
    { label: "Appointments", icon: "AP" },
    { label: "Doctors", icon: "DR" },
    { label: "Medical Records", icon: "MR" },
    { label: "Messages", icon: "MS" },
    { label: "Settings", icon: "ST" },
  ],
  doctor: [
    { label: "Overview", icon: "OV" },
    { label: "Schedule", icon: "SC" },
    { label: "Patients", icon: "PT" },
    { label: "Consultations", icon: "CO" },
    { label: "Lab Results", icon: "LR" },
    { label: "Settings", icon: "ST" },
  ],
  receptionist: [
    { label: "Overview", icon: "OV" },
    { label: "Appointments", icon: "AP" },
    { label: "Patients", icon: "PT" },
    { label: "Invoices", icon: "IN" },
    { label: "Settings", icon: "ST" },
  ],
  lab: [
    { label: "Overview", icon: "OV" },
    { label: "Lab Requests", icon: "RQ" },
    { label: "Completed", icon: "OK" },
    { label: "Settings", icon: "ST" },
  ],
  admin: [
    { label: "Overview", icon: "OV" },
    { label: "Users & Roles", icon: "UR" },
    { label: "Doctors", icon: "DR" },
    { label: "Reports", icon: "RP" },
    { label: "Audit Logs", icon: "AL" },
    { label: "Settings", icon: "ST" },
  ],
};

const doctors = [
  {
    name: "Dr. Lina Hassan",
    specialty: "Cardiology",
    room: "Room 204",
    initials: "LH",
    availability: "Today",
  },
  {
    name: "Dr. Omar Khalil",
    specialty: "Dermatology",
    room: "Room 108",
    initials: "OK",
    availability: "Tomorrow",
  },
  {
    name: "Dr. Sarah Naser",
    specialty: "Pediatrics",
    room: "Room 302",
    initials: "SN",
    availability: "Today",
  },
  {
    name: "Dr. Youssef Ali",
    specialty: "General Medicine",
    room: "Room 101",
    initials: "YA",
    availability: "Thursday",
  },
];

const initialAppointments: Appointment[] = [
  {
    id: "APT-2401",
    patient: "Ahmed Saad",
    doctor: "Dr. Lina Hassan",
    specialty: "Cardiology",
    date: "2026-07-29",
    time: "10:30",
    status: "Confirmed",
    reason: "Routine heart follow-up",
    room: "Room 204",
  },
  {
    id: "APT-2402",
    patient: "Mariam Ahmad",
    doctor: "Dr. Lina Hassan",
    specialty: "Cardiology",
    date: "2026-07-29",
    time: "11:15",
    status: "Checked in",
    reason: "Chest discomfort",
    room: "Room 204",
  },
  {
    id: "APT-2403",
    patient: "Khaled Naser",
    doctor: "Dr. Omar Khalil",
    specialty: "Dermatology",
    date: "2026-07-29",
    time: "12:00",
    status: "Pending",
    reason: "Skin irritation",
    room: "Room 108",
  },
  {
    id: "APT-2404",
    patient: "Ahmed Saad",
    doctor: "Dr. Sarah Naser",
    specialty: "Pediatrics",
    date: "2026-08-03",
    time: "09:15",
    status: "Pending",
    reason: "Child wellness visit",
    room: "Room 302",
  },
  {
    id: "APT-2394",
    patient: "Ahmed Saad",
    doctor: "Dr. Youssef Ali",
    specialty: "General Medicine",
    date: "2026-06-19",
    time: "13:00",
    status: "Completed",
    reason: "General check-up",
    room: "Room 101",
  },
];

const initialLabTests: LabTest[] = [
  {
    id: "LAB-1084",
    patient: "Mariam Ahmad",
    doctor: "Dr. Lina Hassan",
    test: "Complete Blood Count",
    date: "2026-07-29",
    status: "Pending",
  },
  {
    id: "LAB-1083",
    patient: "Ahmed Saad",
    doctor: "Dr. Lina Hassan",
    test: "Lipid Profile",
    date: "2026-07-28",
    status: "In progress",
  },
  {
    id: "LAB-1079",
    patient: "Khaled Naser",
    doctor: "Dr. Omar Khalil",
    test: "Allergy Panel",
    date: "2026-07-26",
    status: "Completed",
    result: "Results within the expected range.",
  },
];

const initialInvoices: Invoice[] = [
  {
    id: "INV-4032",
    patient: "Mariam Ahmad",
    service: "Cardiology Consultation",
    amount: 45,
    date: "2026-07-29",
    status: "Pending",
  },
  {
    id: "INV-4031",
    patient: "Ahmed Saad",
    service: "Laboratory Tests",
    amount: 30,
    date: "2026-07-28",
    status: "Paid",
  },
  {
    id: "INV-4028",
    patient: "Khaled Naser",
    service: "Dermatology Consultation",
    amount: 40,
    date: "2026-07-26",
    status: "Paid",
  },
];

const initialUsers: ClinicUser[] = [
  {
    id: "USR-1001",
    name: "Ahmed Saad",
    email: "ahmed@smartclinic.demo",
    role: "patient",
    status: "Active",
  },
  {
    id: "USR-1002",
    name: "Dr. Lina Hassan",
    email: "lina@smartclinic.demo",
    role: "doctor",
    status: "Active",
  },
  {
    id: "USR-1003",
    name: "Maya Adel",
    email: "maya@smartclinic.demo",
    role: "receptionist",
    status: "Active",
  },
  {
    id: "USR-1004",
    name: "Omar Saleh",
    email: "omar@smartclinic.demo",
    role: "Lab Technician",
    status: "Active",
  },
  {
    id: "USR-1005",
    name: "System Admin",
    email: "admin@smartclinic.demo",
    role: "admin",
    status: "Active",
  },
];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <i />
        <b>+</b>
      </span>
      {!compact && (
        <span>
          <strong>Smart Clinic</strong>
          <small>Health Management</small>
        </span>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>
      <i />
      {status}
    </span>
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return <span className="glyph">{children}</span>;
}

function MetricCard({
  icon,
  label,
  value,
  note,
  tone = "teal",
}: {
  icon: string;
  label: string;
  value: string;
  note?: string;
  tone?: "teal" | "blue" | "green" | "amber";
}) {
  return (
    <article className="metric-card">
      <Glyph>{icon}</Glyph>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {note && <small className={`metric-${tone}`}>{note}</small>}
      </div>
    </article>
  );
}

function Modal({
  title,
  eyebrow,
  children,
  onClose,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function Landing({
  onLogin,
  onDemo,
}: {
  onLogin: () => void;
  onDemo: () => void;
}) {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-links">
          <a href="#services">Services</a>
          <a href="#doctors">Doctors</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
          <button className="button button-ghost" onClick={onLogin}>
            Sign in
          </button>
          <button className="button button-primary" onClick={onDemo}>
            Open live demo
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <i /> Better care starts with better organization
          </span>
          <h1>
            Your clinic,
            <br />
            <em>working smarter.</em>
          </h1>
          <p>
            A secure, role-based platform for appointments, medical records,
            prescriptions, laboratory results, invoices, and clinic reports.
          </p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={onDemo}>
              Explore the system <span>→</span>
            </button>
            <button className="button button-soft button-large" onClick={onLogin}>
              Book an appointment
            </button>
          </div>
          <div className="trust-row">
            <span><b>5</b> user roles</span>
            <span><b>20</b> core requirements</span>
            <span><b>24/7</b> patient access</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Smart Clinic appointment preview">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <article className="appointment-preview">
            <div className="preview-top">
              <span className="mini-calendar">29</span>
              <div>
                <small>Next appointment</small>
                <strong>Today, 10:30 AM</strong>
              </div>
              <StatusPill status="Confirmed" />
            </div>
            <div className="doctor-preview">
              <span className="avatar avatar-lg">LH</span>
              <div>
                <h3>Dr. Lina Hassan</h3>
                <p>Cardiology • Room 204</p>
              </div>
            </div>
            <div className="preview-line">
              <span>Appointment progress</span>
              <strong>Ready for visit</strong>
            </div>
            <div className="progress"><i /></div>
          </article>
          <article className="floating-card floating-patients">
            <Glyph>PT</Glyph>
            <span><b>1,284</b><small>Patient records</small></span>
          </article>
          <article className="floating-card floating-rating">
            <span className="rating-star">★</span>
            <span><b>4.9 / 5</b><small>Patient satisfaction</small></span>
          </article>
        </div>
      </section>

      <section className="landing-section" id="services">
        <div className="section-intro">
          <span className="eyebrow">Connected workflow</span>
          <h2>Everything the clinic team needs, in one place.</h2>
          <p>
            Each role sees only the tools and patient information needed to
            complete its responsibilities.
          </p>
        </div>
        <div className="service-grid">
          {[
            ["AP", "Smart appointments", "Book, confirm, reschedule, check in, and prevent double bookings."],
            ["MR", "Medical records", "Document diagnosis, consultation notes, prescriptions, and visit history."],
            ["LB", "Laboratory workflow", "Create lab requests, upload results, and notify doctors and patients."],
            ["RP", "Reports & billing", "Track invoices, revenue, attendance, cancellations, and doctor workload."],
          ].map(([icon, title, text]) => (
            <article className="service-card" key={title}>
              <Glyph>{icon}</Glyph>
              <h3>{title}</h3>
              <p>{text}</p>
              <span>Learn more →</span>
            </article>
          ))}
        </div>
      </section>

      <section className="doctors-section" id="doctors">
        <div className="section-intro compact">
          <span className="eyebrow">Our medical team</span>
          <h2>Choose the right specialist.</h2>
        </div>
        <div className="landing-doctor-grid">
          {doctors.map((doctor) => (
            <article key={doctor.name}>
              <span className="avatar avatar-xl">{doctor.initials}</span>
              <div>
                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
              </div>
              <span className="availability">{doctor.availability}</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer" id="contact">
        <div>
          <Logo />
          <p>Secure clinic operations. Clearer care. Better patient experience.</p>
        </div>
        <div>
          <strong>Clinic hours</strong>
          <span>Saturday – Thursday</span>
          <span>8:00 AM – 6:00 PM</span>
        </div>
        <div>
          <strong>Contact</strong>
          <span>+970 8 240 0000</span>
          <span>care@smartclinic.demo</span>
        </div>
        <div className="project-credit">
          <strong>Graduation Project 2</strong>
          <span>Ahmed Saad Mousa • 20191705</span>
          <span>Al-Azhar University – Gaza</span>
        </div>
      </footer>
    </main>
  );
}

function Login({
  selectedRole,
  onRoleChange,
  onBack,
  onSubmit,
}: {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <main className="login-page">
      <button className="back-link" onClick={onBack}>← Back to website</button>
      <section className="login-panel">
        <div className="login-brand">
          <Logo />
          <span className="demo-chip">Graduation project demo</span>
        </div>
        <span className="eyebrow">Secure access portal</span>
        <h1>Welcome back</h1>
        <p>Choose a demo role to explore its authorized workflow.</p>

        <div className="role-picker">
          {(Object.keys(roleMeta) as Role[]).map((role) => (
            <button
              key={role}
              className={selectedRole === role ? "active" : ""}
              onClick={() => onRoleChange(role)}
            >
              <span>{roleMeta[role].initials}</span>
              <small>{roleMeta[role].label}</small>
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label>
            Email address
            <input
              type="email"
              defaultValue={`${selectedRole}@smartclinic.demo`}
              key={selectedRole}
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                defaultValue="Demo@2026"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="form-row login-options">
            <label className="check-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="link-button">Forgot password?</button>
          </div>
          <button className="button button-primary login-button" type="submit">
            Sign in as {roleMeta[selectedRole].label}
          </button>
        </form>
        <p className="login-note">
          Demo accounts contain fictional presentation data. Role permissions are
          enforced throughout the interface.
        </p>
      </section>
      <aside className="login-side">
        <div className="security-seal">
          <span>✓</span>
          <strong>Role-Based Access</strong>
          <p>Every user sees only the actions authorized for their role.</p>
        </div>
        <div className="login-quote">
          <span>“</span>
          <p>
            One connected system for the patient journey — from booking to
            consultation, laboratory, billing, and reporting.
          </p>
        </div>
      </aside>
    </main>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"landing" | "login" | "app">("landing");
  const [role, setRole] = useState<Role>("patient");
  const [activeView, setActiveView] = useState("Overview");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [labTests, setLabTests] = useState(initialLabTests);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [users, setUsers] = useState(initialUsers);
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedLab, setSelectedLab] = useState<LabTest | null>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("smart-clinic-demo");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        appointments?: Appointment[];
        labTests?: LabTest[];
        invoices?: Invoice[];
        users?: ClinicUser[];
      };
      const timeout = window.setTimeout(() => {
        if (parsed.appointments) setAppointments(parsed.appointments);
        if (parsed.labTests) setLabTests(parsed.labTests);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.users) setUsers(parsed.users);
      }, 0);
      return () => window.clearTimeout(timeout);
    } catch {
      window.localStorage.removeItem("smart-clinic-demo");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "smart-clinic-demo",
      JSON.stringify({ appointments, labTests, invoices, users }),
    );
  }, [appointments, labTests, invoices, users]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setActiveView("Overview");
    setSearch("");
    showToast(`Switched to ${roleMeta[nextRole].label} demo`);
  };

  const searchResults = useMemo(() => {
    if (search.trim().length < 2) return [];
    const term = search.toLowerCase();
    const appointmentResults = appointments
      .filter((item) =>
        [item.patient, item.doctor, item.id, item.specialty].some((value) =>
          value.toLowerCase().includes(term),
        ),
      )
      .slice(0, 4)
      .map((item) => ({
        title: item.patient,
        meta: `${item.id} • ${item.doctor}`,
        appointment: item,
      }));
    return appointmentResults;
  }, [appointments, search]);

  if (screen === "landing") {
    return (
      <Landing
        onLogin={() => setScreen("login")}
        onDemo={() => {
          setRole("patient");
          setActiveView("Overview");
          setScreen("app");
        }}
      />
    );
  }

  if (screen === "login") {
    return (
      <Login
        selectedRole={role}
        onRoleChange={setRole}
        onBack={() => setScreen("landing")}
        onSubmit={() => {
          setActiveView("Overview");
          setScreen("app");
        }}
      />
    );
  }

  const openAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModal("appointment");
  };

  const renderPatientOverview = () => {
    const patientAppointments = appointments.filter(
      (item) => item.patient === "Ahmed Saad",
    );
    const upcoming =
      patientAppointments.find(
        (item) => item.status === "Confirmed" || item.status === "Pending",
      ) ?? patientAppointments[0];

    return (
      <>
        <div className="welcome-row">
          <div>
            <span className="eyebrow">Wednesday, July 29</span>
            <h1>Good morning, Ahmed</h1>
            <p>Here&apos;s your health overview. Stay on top of your care.</p>
          </div>
          <button className="button button-primary" onClick={() => setModal("book")}>
            <span className="button-icon">+</span> Book Appointment
          </button>
        </div>

        {upcoming && (
          <article className="upcoming-card">
            <div className="card-label"><Glyph>AP</Glyph> Upcoming Appointment</div>
            <div className="upcoming-main">
              <span className="avatar avatar-xl">
                {upcoming.doctor.split(" ").slice(-2).map((part) => part[0]).join("")}
              </span>
              <div className="upcoming-details">
                <StatusPill status={upcoming.status} />
                <h2>{upcoming.doctor}</h2>
                <p>{upcoming.specialty}</p>
                <div className="appointment-meta">
                  <span><b>◷</b> {formatDate(upcoming.date)}, {upcoming.time}</span>
                  <span><b>⌖</b> {upcoming.room}</span>
                </div>
              </div>
              <div className="upcoming-actions">
                <button className="button button-outline" onClick={() => openAppointment(upcoming)}>
                  View Details
                </button>
                <button
                  className="button button-ghost"
                  onClick={() => {
                    setSelectedAppointment(upcoming);
                    setModal("reschedule");
                  }}
                >
                  Reschedule
                </button>
              </div>
            </div>
          </article>
        )}

        <div className="metrics-grid three">
          <MetricCard icon="AP" label="Appointments" value={String(patientAppointments.length).padStart(2, "0")} />
          <MetricCard icon="RX" label="Prescriptions" value="02" />
          <MetricCard icon="MR" label="Health Records" value="12" />
        </div>

        <div className="dashboard-grid patient-lower">
          <article className="panel">
            <header className="panel-header">
              <div><Glyph>RM</Glyph><h3>Today&apos;s Reminders</h3></div>
              <button className="link-button">View all</button>
            </header>
            <div className="reminder">
              <span className="reminder-icon">RX</span>
              <div><strong>Take medication at 8:00 PM</strong><small>Atorvastatin • 1 tablet</small></div>
              <span className="check-circle">✓</span>
            </div>
            <div className="reminder">
              <span className="reminder-icon">LB</span>
              <div><strong>Lipid profile is in progress</strong><small>Expected by tomorrow</small></div>
              <StatusPill status="In progress" />
            </div>
          </article>

          <article className="panel">
            <header className="panel-header">
              <div><Glyph>AC</Glyph><h3>Recent Activity</h3></div>
            </header>
            <div className="activity-list">
              <div><Glyph>AP</Glyph><span><strong>Appointment confirmed</strong><small>Today, 10:30 AM • Cardiology</small></span><b>Confirmed</b></div>
              <div><Glyph>RX</Glyph><span><strong>New prescription added</strong><small>July 24, 2026</small></span><em>›</em></div>
              <div><Glyph>LB</Glyph><span><strong>Lab result available</strong><small>July 18, 2026</small></span><em>›</em></div>
            </div>
          </article>
        </div>
      </>
    );
  };

  const renderDoctorOverview = () => {
    const schedule = appointments.filter(
      (item) => item.doctor === "Dr. Lina Hassan" && item.date === "2026-07-29",
    );
    return (
      <>
        <div className="welcome-row">
          <div>
            <span className="eyebrow">Wednesday, July 29</span>
            <h1>Good morning, Dr. Lina</h1>
            <p>You have {schedule.length} appointments in today&apos;s schedule.</p>
          </div>
          <button className="button button-primary" onClick={() => setActiveView("Schedule")}>
            View full schedule
          </button>
        </div>
        <div className="metrics-grid four">
          <MetricCard icon="PT" label="Patients today" value={String(schedule.length)} note="+1 checked in" tone="green" />
          <MetricCard icon="AP" label="Upcoming" value="01" note="Next at 10:30" />
          <MetricCard icon="LB" label="Pending labs" value="02" note="1 new result" tone="amber" />
          <MetricCard icon="CO" label="Completed" value="06" note="This week" tone="blue" />
        </div>
        <div className="dashboard-grid doctor-grid">
          <article className="panel">
            <header className="panel-header">
              <div><Glyph>SC</Glyph><h3>Today&apos;s patient queue</h3></div>
              <span className="panel-date">July 29, 2026</span>
            </header>
            <AppointmentTable
              appointments={schedule}
              role={role}
              onOpen={openAppointment}
              onAction={(appointment) => {
                setSelectedAppointment(appointment);
                setModal("consultation");
              }}
            />
          </article>
          <article className="panel focus-panel">
            <span className="eyebrow">Next patient</span>
            <span className="avatar avatar-xl">AS</span>
            <h3>Ahmed Saad</h3>
            <p>Routine heart follow-up</p>
            <div className="patient-facts">
              <span><small>Age</small><b>28 years</b></span>
              <span><small>Last visit</small><b>Jun 19</b></span>
              <span><small>Risk</small><b className="good-text">Low</b></span>
            </div>
            <button className="button button-primary" onClick={() => {
              setSelectedAppointment(schedule[0] ?? initialAppointments[0]);
              setModal("consultation");
            }}>
              Open patient record
            </button>
          </article>
        </div>
      </>
    );
  };

  const renderReceptionOverview = () => {
    const today = appointments.filter((item) => item.date === "2026-07-29");
    return (
      <>
        <div className="welcome-row">
          <div>
            <span className="eyebrow">Front desk workspace</span>
            <h1>Today&apos;s clinic flow</h1>
            <p>Confirm bookings, check in patients, and keep the schedule moving.</p>
          </div>
          <button className="button button-primary" onClick={() => setModal("invoice")}>+ Create Invoice</button>
        </div>
        <div className="metrics-grid four">
          <MetricCard icon="AP" label="Appointments" value={String(today.length)} />
          <MetricCard icon="CI" label="Checked in" value={String(today.filter((item) => item.status === "Checked in").length)} note="Waiting now" tone="green" />
          <MetricCard icon="PN" label="Pending" value={String(today.filter((item) => item.status === "Pending").length)} note="Needs confirmation" tone="amber" />
          <MetricCard icon="IN" label="Unpaid invoices" value={String(invoices.filter((item) => item.status === "Pending").length)} />
        </div>
        <article className="panel">
          <header className="panel-header">
            <div><Glyph>AP</Glyph><h3>Appointment desk</h3></div>
            <button className="button button-soft button-small" onClick={() => setActiveView("Appointments")}>View all</button>
          </header>
          <AppointmentTable
            appointments={today}
            role={role}
            onOpen={openAppointment}
            onAction={(appointment) => {
              setAppointments((current) =>
                current.map((item) =>
                  item.id === appointment.id
                    ? {
                        ...item,
                        status:
                          item.status === "Pending" ? "Confirmed" : "Checked in",
                      }
                    : item,
                ),
              );
              showToast(
                appointment.status === "Pending"
                  ? "Appointment confirmed and patient notified"
                  : "Patient checked in successfully",
              );
            }}
          />
        </article>
      </>
    );
  };

  const renderLabOverview = () => {
    const pending = labTests.filter((test) => test.status !== "Completed");
    return (
      <>
        <div className="welcome-row">
          <div>
            <span className="eyebrow">Laboratory workspace</span>
            <h1>Good morning, Omar</h1>
            <p>{pending.length} tests are waiting for processing or results.</p>
          </div>
          <button className="button button-primary" onClick={() => setActiveView("Lab Requests")}>Open work queue</button>
        </div>
        <div className="metrics-grid three">
          <MetricCard icon="RQ" label="Pending requests" value={String(labTests.filter((test) => test.status === "Pending").length).padStart(2, "0")} />
          <MetricCard icon="IP" label="In progress" value={String(labTests.filter((test) => test.status === "In progress").length).padStart(2, "0")} note="On schedule" />
          <MetricCard icon="OK" label="Completed today" value="07" note="+12% this week" tone="green" />
        </div>
        <article className="panel">
          <header className="panel-header">
            <div><Glyph>LB</Glyph><h3>Priority lab requests</h3></div>
            <span className="live-label"><i /> Live queue</span>
          </header>
          <LabTable
            tests={pending}
            onAction={(test) => {
              setSelectedLab(test);
              setModal("lab");
            }}
          />
        </article>
      </>
    );
  };

  const renderAdminOverview = () => (
    <>
      <div className="welcome-row">
        <div>
          <span className="eyebrow">System administration</span>
          <h1>Clinic performance overview</h1>
          <p>Monitor operations, revenue, users, and system activity.</p>
        </div>
        <button className="button button-primary" onClick={() => setActiveView("Reports")}>View reports</button>
      </div>
      <div className="metrics-grid four">
        <MetricCard icon="PT" label="Total patients" value="1,284" note="+8.2% this month" tone="green" />
        <MetricCard icon="AP" label="Appointments" value="326" note="This month" />
        <MetricCard icon="$" label="Monthly revenue" value="$12.8k" note="+6.4% growth" tone="green" />
        <MetricCard icon="DR" label="Active doctors" value="12" note="4 specialties" tone="blue" />
      </div>
      <div className="dashboard-grid admin-grid">
        <article className="panel">
          <header className="panel-header">
            <div><Glyph>RP</Glyph><h3>Appointments this week</h3></div>
            <span className="good-text">+12.4%</span>
          </header>
          <div className="bar-chart">
            {[62, 78, 55, 88, 92, 68, 38].map((height, index) => (
              <div key={index}><i style={{ height: `${height}%` }} /><span>{["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}</span></div>
            ))}
          </div>
        </article>
        <article className="panel">
          <header className="panel-header">
            <div><Glyph>AC</Glyph><h3>System activity</h3></div>
            <button className="link-button" onClick={() => setActiveView("Audit Logs")}>Audit log</button>
          </header>
          <div className="activity-list admin-activity">
            <div><Glyph>UR</Glyph><span><strong>New patient account created</strong><small>Ahmed Saad • 8 minutes ago</small></span></div>
            <div><Glyph>AP</Glyph><span><strong>Appointment status changed</strong><small>Maya Adel • 22 minutes ago</small></span></div>
            <div><Glyph>LB</Glyph><span><strong>Lab result uploaded</strong><small>Omar Saleh • 41 minutes ago</small></span></div>
            <div><Glyph>BK</Glyph><span><strong>Daily backup completed</strong><small>System • Today at 02:00 AM</small></span></div>
          </div>
        </article>
      </div>
    </>
  );

  const renderOverview = () => {
    if (role === "patient") return renderPatientOverview();
    if (role === "doctor") return renderDoctorOverview();
    if (role === "receptionist") return renderReceptionOverview();
    if (role === "lab") return renderLabOverview();
    return renderAdminOverview();
  };

  const renderAppointments = () => {
    const rows =
      role === "patient"
        ? appointments.filter((item) => item.patient === "Ahmed Saad")
        : role === "doctor"
          ? appointments.filter((item) => item.doctor === "Dr. Lina Hassan")
          : appointments;
    return (
      <PageSection
        eyebrow={role === "doctor" ? "Clinical schedule" : "Appointment management"}
        title={role === "doctor" ? "My Schedule" : "Appointments"}
        description={
          role === "patient"
            ? "Track upcoming and previous clinic visits."
            : "Search, confirm, reschedule, and manage the clinic schedule."
        }
        action={
          role === "patient" ? (
            <button className="button button-primary" onClick={() => setModal("book")}>+ Book appointment</button>
          ) : undefined
        }
      >
        <div className="filter-row">
          <div className="segmented">
            <button className="active">All</button><button>Today</button><button>Upcoming</button><button>Completed</button>
          </div>
          <label className="table-search">⌕ <input placeholder="Search appointments..." /></label>
        </div>
        <article className="panel table-panel">
          <AppointmentTable
            appointments={rows}
            role={role}
            onOpen={openAppointment}
            onAction={(appointment) => {
              if (role === "doctor") {
                setSelectedAppointment(appointment);
                setModal("consultation");
              } else if (role === "receptionist") {
                setAppointments((current) =>
                  current.map((item) =>
                    item.id === appointment.id
                      ? { ...item, status: item.status === "Pending" ? "Confirmed" : "Checked in" }
                      : item,
                  ),
                );
                showToast("Appointment status updated");
              } else {
                setSelectedAppointment(appointment);
                setModal("reschedule");
              }
            }}
          />
        </article>
      </PageSection>
    );
  };

  const renderDoctors = () => (
    <PageSection
      eyebrow="Medical team"
      title="Doctors & Specialties"
      description={role === "admin" ? "Manage doctor availability, rooms, and specialties." : "Find the right doctor and review available clinic days."}
      action={role === "admin" ? <button className="button button-primary" onClick={() => showToast("Doctor profile form opened")}>+ Add doctor</button> : undefined}
    >
      <div className="doctor-grid">
        {doctors.map((doctor, index) => (
          <article className="doctor-card" key={doctor.name}>
            <div className="doctor-card-top">
              <span className="avatar avatar-xl">{doctor.initials}</span>
              <StatusPill status={index === 1 ? "In progress" : "Active"} />
            </div>
            <h3>{doctor.name}</h3>
            <p>{doctor.specialty}</p>
            <div className="doctor-data">
              <span><small>Room</small><b>{doctor.room.replace("Room ", "")}</b></span>
              <span><small>Next available</small><b>{doctor.availability}</b></span>
            </div>
            <button className="button button-outline" onClick={() => {
              if (role === "patient") setModal("book");
              else showToast(`${doctor.name}'s profile opened`);
            }}>
              {role === "patient" ? "Book appointment" : "Manage profile"}
            </button>
          </article>
        ))}
      </div>
    </PageSection>
  );

  const renderPatients = () => (
    <PageSection
      eyebrow="Patient management"
      title="Patient Directory"
      description="Search patient profiles and access authorized clinic information."
      action={role === "receptionist" ? <button className="button button-primary" onClick={() => showToast("New patient form opened")}>+ Register patient</button> : undefined}
    >
      <article className="panel table-panel">
        <div className="filter-row">
          <label className="table-search wide">⌕ <input placeholder="Search by name, phone, ID, or appointment number..." /></label>
          <button className="button button-soft">Filter</button>
        </div>
        <div className="data-table patients-table">
          <div className="table-head"><span>Patient</span><span>ID</span><span>Last visit</span><span>Next appointment</span><span>Status</span><span /></div>
          {[
            ["Ahmed Saad", "PT-10284", "Jun 19, 2026", "Today, 10:30", "Active"],
            ["Mariam Ahmad", "PT-10261", "May 05, 2026", "Today, 11:15", "Active"],
            ["Khaled Naser", "PT-10198", "Jul 26, 2026", "Today, 12:00", "Active"],
            ["Noor Sami", "PT-10172", "Apr 11, 2026", "Aug 02, 09:30", "Active"],
          ].map((patient) => (
            <div className="table-row" key={patient[1]}>
              <span className="person-cell"><span className="avatar">{patient[0].split(" ").map((word) => word[0]).join("")}</span><b>{patient[0]}</b></span>
              <span>{patient[1]}</span><span>{patient[2]}</span><span>{patient[3]}</span><span><StatusPill status={patient[4]} /></span>
              <span><button className="row-action" onClick={() => showToast(`${patient[0]}'s record opened`)}>View record</button></span>
            </div>
          ))}
        </div>
      </article>
    </PageSection>
  );

  const renderMedicalRecords = () => (
    <PageSection eyebrow="Health history" title={role === "doctor" ? "Consultations" : "Medical Records"} description="Secure visit summaries, prescriptions, and laboratory history.">
      <div className="record-layout">
        <aside className="panel record-timeline">
          <span className="eyebrow">Visit history</span>
          {[
            ["Jun 19, 2026", "General check-up", "Dr. Youssef Ali"],
            ["Mar 04, 2026", "Cardiology follow-up", "Dr. Lina Hassan"],
            ["Nov 18, 2025", "Routine consultation", "Dr. Youssef Ali"],
          ].map((record, index) => (
            <button className={index === 0 ? "active" : ""} key={record[0]}>
              <i /><span><strong>{record[1]}</strong><small>{record[0]} • {record[2]}</small></span>
            </button>
          ))}
        </aside>
        <article className="panel record-detail">
          <div className="record-title">
            <div><span className="eyebrow">Completed visit</span><h2>General check-up</h2><p>June 19, 2026 • Dr. Youssef Ali</p></div>
            <button className="button button-outline" onClick={() => showToast("Visit summary prepared for printing")}>Print summary</button>
          </div>
          <div className="record-section">
            <h3>Diagnosis</h3>
            <p>General health assessment. Blood pressure within normal range. Mild vitamin D deficiency noted.</p>
          </div>
          <div className="record-section">
            <h3>Doctor&apos;s recommendations</h3>
            <p>Maintain a balanced diet, continue regular light exercise, and repeat laboratory screening after three months.</p>
          </div>
          <div className="prescription-box">
            <div><Glyph>RX</Glyph><span><strong>Vitamin D3</strong><small>1 capsule weekly • 8 weeks • After a meal</small></span></div>
            <StatusPill status="Active" />
          </div>
        </article>
      </div>
    </PageSection>
  );

  const renderLab = (completedOnly = false) => (
    <PageSection
      eyebrow="Laboratory workflow"
      title={completedOnly ? "Completed Tests" : role === "doctor" ? "Lab Results" : "Lab Requests"}
      description={role === "lab" ? "Process test requests and attach verified results." : "Review requested investigations and patient results."}
    >
      <article className="panel table-panel">
        <LabTable
          tests={completedOnly ? labTests.filter((test) => test.status === "Completed") : labTests}
          onAction={(test) => {
            setSelectedLab(test);
            if (role === "lab") setModal("lab");
            else showToast(test.result ?? "Result is not available yet");
          }}
        />
      </article>
    </PageSection>
  );

  const renderInvoices = () => (
    <PageSection
      eyebrow="Clinic billing"
      title="Invoices & Payments"
      description="Create invoices, track payment status, and print receipts."
      action={<button className="button button-primary" onClick={() => setModal("invoice")}>+ Create invoice</button>}
    >
      <div className="metrics-grid three">
        <MetricCard icon="$" label="Collected today" value={money(invoices.filter((item) => item.status === "Paid").reduce((sum, item) => sum + item.amount, 0))} note="Paid invoices" tone="green" />
        <MetricCard icon="PN" label="Pending amount" value={money(invoices.filter((item) => item.status === "Pending").reduce((sum, item) => sum + item.amount, 0))} note="Action required" tone="amber" />
        <MetricCard icon="IN" label="Total invoices" value={String(invoices.length)} />
      </div>
      <article className="panel table-panel">
        <div className="data-table invoice-table">
          <div className="table-head"><span>Invoice</span><span>Patient</span><span>Service</span><span>Date</span><span>Amount</span><span>Status</span><span /></div>
          {invoices.map((invoice) => (
            <div className="table-row" key={invoice.id}>
              <span><b>{invoice.id}</b></span><span>{invoice.patient}</span><span>{invoice.service}</span><span>{formatDate(invoice.date)}</span><span><b>{money(invoice.amount)}</b></span><span><StatusPill status={invoice.status} /></span>
              <span>
                <button className="row-action" onClick={() => {
                  if (invoice.status === "Pending") {
                    setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "Paid" } : item));
                    showToast("Invoice marked as paid");
                  } else showToast("Receipt prepared for printing");
                }}>{invoice.status === "Pending" ? "Mark paid" : "Receipt"}</button>
              </span>
            </div>
          ))}
        </div>
      </article>
    </PageSection>
  );

  const renderUsers = () => (
    <PageSection
      eyebrow="Access control"
      title="Users & Roles"
      description="Manage accounts and apply role-based permissions."
      action={<button className="button button-primary" onClick={() => setModal("user")}>+ Add user</button>}
    >
      <article className="panel table-panel">
        <div className="filter-row">
          <label className="table-search wide">⌕ <input placeholder="Search users by name, email, or role..." /></label>
          <button className="button button-soft">All roles</button>
        </div>
        <div className="data-table users-table">
          <div className="table-head"><span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Last activity</span><span /></div>
          {users.map((user, index) => (
            <div className="table-row" key={user.id}>
              <span className="person-cell"><span className="avatar">{user.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span><b>{user.name}</b></span>
              <span>{user.email}</span><span className="role-label">{typeof user.role === "string" ? user.role.replace(/^\w/, (letter) => letter.toUpperCase()) : user.role}</span><span><StatusPill status={user.status} /></span><span>{index * 17 + 4} min ago</span>
              <span><button className="row-action" onClick={() => {
                setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item));
                showToast(`${user.name}'s account updated`);
              }}>{user.status === "Active" ? "Deactivate" : "Activate"}</button></span>
            </div>
          ))}
        </div>
      </article>
    </PageSection>
  );

  const renderReports = () => (
    <PageSection
      eyebrow="Data & insights"
      title="Clinic Reports"
      description="Appointments, attendance, revenue, doctor workload, and patient feedback."
      action={<button className="button button-outline" onClick={() => showToast("Report exported successfully")}>Export report</button>}
    >
      <div className="metrics-grid four">
        <MetricCard icon="AP" label="Appointments" value="326" note="+12.4%" tone="green" />
        <MetricCard icon="✓" label="Attendance rate" value="91%" note="+3.1%" tone="green" />
        <MetricCard icon="$" label="Revenue" value="$12,840" note="+6.4%" tone="green" />
        <MetricCard icon="★" label="Patient rating" value="4.9" note="184 reviews" tone="blue" />
      </div>
      <div className="dashboard-grid reports-grid">
        <article className="panel">
          <header className="panel-header"><div><Glyph>AP</Glyph><h3>Appointment volume</h3></div><span>Last 7 days</span></header>
          <div className="bar-chart large">
            {[62, 78, 55, 88, 92, 68, 38].map((height, index) => (
              <div key={index}><b>{Math.round(height * 0.55)}</b><i style={{ height: `${height}%` }} /><span>{["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}</span></div>
            ))}
          </div>
        </article>
        <article className="panel">
          <header className="panel-header"><div><Glyph>DR</Glyph><h3>Doctor workload</h3></div></header>
          <div className="workload-list">
            {[["Dr. Lina Hassan", 86, "82 visits"], ["Dr. Omar Khalil", 72, "68 visits"], ["Dr. Sarah Naser", 64, "61 visits"], ["Dr. Youssef Ali", 55, "52 visits"]].map(([name, value, label]) => (
              <div key={name as string}><span><b>{name}</b><small>{label}</small></span><div><i style={{ width: `${value}%` }} /></div></div>
            ))}
          </div>
        </article>
      </div>
    </PageSection>
  );

  const renderAudit = () => (
    <PageSection eyebrow="Security & accountability" title="Audit Logs" description="Review sensitive operations with user, time, and affected entity.">
      <article className="panel audit-panel">
        {[
          ["Today, 11:42 AM", "Omar Saleh", "Uploaded lab result", "Lab Test LAB-1079", "10.0.0.42"],
          ["Today, 11:18 AM", "Maya Adel", "Changed appointment status", "Appointment APT-2402", "10.0.0.18"],
          ["Today, 10:56 AM", "Dr. Lina Hassan", "Opened medical record", "Patient PT-10284", "10.0.0.31"],
          ["Today, 09:20 AM", "System Admin", "Changed user role", "User USR-1012", "10.0.0.11"],
          ["Today, 02:00 AM", "System", "Completed daily backup", "Database", "System"],
        ].map((log) => (
          <div className="audit-row" key={`${log[0]}${log[1]}`}>
            <span className="audit-dot" />
            <span><small>{log[0]}</small><strong>{log[2]}</strong><p>{log[1]} • {log[3]}</p></span>
            <code>{log[4]}</code>
          </div>
        ))}
      </article>
    </PageSection>
  );

  const renderSettings = () => (
    <PageSection eyebrow="Account & system" title="Settings" description="Manage profile preferences, notifications, and authorized clinic configuration.">
      <div className="settings-grid">
        <aside className="panel settings-nav">
          <button className="active">Profile</button>
          <button>Notifications</button>
          <button>Security</button>
          {role === "admin" && <button>Clinic configuration</button>}
          {role === "admin" && <button>Backup & recovery</button>}
        </aside>
        <article className="panel settings-form">
          <h3>{role === "admin" ? "Clinic configuration" : "Profile information"}</h3>
          <p>Keep the information used across the Smart Clinic system up to date.</p>
          <div className="form-grid">
            <label>Display name<input defaultValue={roleNames[role]} /></label>
            <label>Email address<input defaultValue={`${role}@smartclinic.demo`} /></label>
            <label>Phone number<input defaultValue="+970 59 000 0000" /></label>
            <label>{role === "admin" ? "Appointment duration" : "Preferred language"}<select defaultValue="English"><option>English</option><option>العربية</option></select></label>
          </div>
          <div className="toggle-list">
            <label><span><strong>Email notifications</strong><small>Appointment and record updates</small></span><input type="checkbox" defaultChecked /></label>
            <label><span><strong>SMS reminders</strong><small>Receive a reminder before a visit</small></span><input type="checkbox" defaultChecked /></label>
            {role === "admin" && <label><span><strong>Automatic daily backup</strong><small>Last successful backup: today, 02:00 AM</small></span><input type="checkbox" defaultChecked /></label>}
          </div>
          <button className="button button-primary" onClick={() => showToast("Settings saved successfully")}>Save changes</button>
        </article>
      </div>
    </PageSection>
  );

  const renderMessages = () => (
    <PageSection eyebrow="Patient communication" title="Messages" description="Clinic notifications and secure updates.">
      <div className="message-layout">
        <aside className="panel conversation-list">
          {[
            ["SC", "Smart Clinic", "Your appointment is confirmed.", "10:04"],
            ["LH", "Dr. Lina Hassan", "Your lab request has been reviewed.", "Yesterday"],
            ["LB", "Laboratory", "Lipid profile is being processed.", "Jul 28"],
          ].map((message, index) => (
            <button className={index === 0 ? "active" : ""} key={message[1]}>
              <span className="avatar">{message[0]}</span><span><b>{message[1]}</b><small>{message[2]}</small></span><em>{message[3]}</em>
            </button>
          ))}
        </aside>
        <article className="panel chat-panel">
          <header><span className="avatar">SC</span><div><b>Smart Clinic</b><small><i /> Online</small></div></header>
          <div className="chat-body">
            <span className="chat-date">Today</span>
            <div className="bubble">Your appointment with Dr. Lina Hassan is confirmed for today at 10:30 AM in Room 204.<small>10:04 AM</small></div>
            <div className="bubble user-bubble">Thank you. I will arrive 15 minutes early.<small>10:07 AM</small></div>
          </div>
          <div className="chat-input"><input placeholder="Write a message..." /><button className="button button-primary" onClick={() => showToast("Message sent")}>Send</button></div>
        </article>
      </div>
    </PageSection>
  );

  const renderView = () => {
    if (activeView === "Overview") return renderOverview();
    if (activeView === "Appointments" || activeView === "Schedule") return renderAppointments();
    if (activeView === "Doctors") return renderDoctors();
    if (activeView === "Patients") return renderPatients();
    if (activeView === "Medical Records" || activeView === "Consultations") return renderMedicalRecords();
    if (activeView === "Lab Results" || activeView === "Lab Requests") return renderLab();
    if (activeView === "Completed") return renderLab(true);
    if (activeView === "Invoices") return renderInvoices();
    if (activeView === "Users & Roles") return renderUsers();
    if (activeView === "Reports") return renderReports();
    if (activeView === "Audit Logs") return renderAudit();
    if (activeView === "Messages") return renderMessages();
    return renderSettings();
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="sidebar-head">
          <Logo />
          <button className="mobile-close" onClick={() => setMobileNav(false)}>×</button>
        </div>
        <nav className="sidebar-nav" aria-label={`${roleMeta[role].label} navigation`}>
          {navByRole[role].map((item) => (
            <button
              key={item.label}
              className={activeView === item.label ? "active" : ""}
              onClick={() => {
                setActiveView(item.label);
                setMobileNav(false);
              }}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="help-card">
          <Glyph>?</Glyph>
          <strong>Demo Guide</strong>
          <p>Switch roles at the top to present every workflow.</p>
          <button onClick={() => showToast("Presentation guide is ready")}>Open guide →</button>
        </div>
        <div className="sidebar-foot">
          <small>Graduation Project 2</small>
          <span>Ahmed Saad Mousa • 20191705</span>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div className="topbar-title">
            <button className="menu-button" onClick={() => setMobileNav(true)}>☰</button>
            <div><small>{roleMeta[role].label} Portal</small><strong>{roleMeta[role].title}</strong></div>
          </div>
          <div className="global-search">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients, appointments..." />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result) => (
                  <button key={result.appointment.id} onClick={() => {
                    openAppointment(result.appointment);
                    setSearch("");
                  }}>
                    <Glyph>AP</Glyph><span><b>{result.title}</b><small>{result.meta}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="notification-button" aria-label="Notifications" onClick={() => showToast("You have 2 new notifications")}>
            ◇<span>2</span>
          </button>
          <div className="role-switch">
            <span className="avatar">{roleMeta[role].initials}</span>
            <div><strong>{roleNames[role]}</strong><small>{roleMeta[role].label}</small></div>
            <select value={role} onChange={(event) => switchRole(event.target.value as Role)} aria-label="Switch demo role">
              {(Object.keys(roleMeta) as Role[]).map((item) => <option value={item} key={item}>{roleMeta[item].label}</option>)}
            </select>
          </div>
          <button className="logout-button" onClick={() => setScreen("landing")} title="Sign out">↗</button>
        </header>

        <section className="workspace">{renderView()}</section>
      </section>

      {toast && <div className="toast"><span>✓</span>{toast}</div>}

      {modal === "book" && (
        <BookingModal
          appointments={appointments}
          onClose={() => setModal(null)}
          onCreate={(appointment) => {
            setAppointments((current) => [appointment, ...current]);
            setModal(null);
            setActiveView("Appointments");
            showToast("Appointment request created successfully");
          }}
        />
      )}

      {modal === "appointment" && selectedAppointment && (
        <Modal title="Appointment Details" eyebrow={selectedAppointment.id} onClose={() => setModal(null)}>
          <div className="detail-card">
            <div className="detail-person"><span className="avatar avatar-xl">{selectedAppointment.doctor.split(" ").slice(-2).map((part) => part[0]).join("")}</span><span><h3>{selectedAppointment.doctor}</h3><p>{selectedAppointment.specialty}</p></span><StatusPill status={selectedAppointment.status} /></div>
            <div className="detail-grid">
              <span><small>Patient</small><b>{selectedAppointment.patient}</b></span>
              <span><small>Date</small><b>{formatDate(selectedAppointment.date)}</b></span>
              <span><small>Time</small><b>{selectedAppointment.time}</b></span>
              <span><small>Location</small><b>{selectedAppointment.room}</b></span>
              <span className="full"><small>Reason for visit</small><b>{selectedAppointment.reason}</b></span>
            </div>
          </div>
          <div className="modal-actions">
            <button className="button button-ghost" onClick={() => setModal(null)}>Close</button>
            {role === "patient" && <button className="button button-primary" onClick={() => setModal("reschedule")}>Reschedule</button>}
            {role === "doctor" && <button className="button button-primary" onClick={() => setModal("consultation")}>Start consultation</button>}
          </div>
        </Modal>
      )}

      {modal === "reschedule" && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => setModal(null)}
          onSave={(date, time) => {
            setAppointments((current) => current.map((item) => item.id === selectedAppointment.id ? { ...item, date, time, status: "Pending" } : item));
            setModal(null);
            showToast("Reschedule request sent to reception");
          }}
        />
      )}

      {modal === "consultation" && selectedAppointment && (
        <ConsultationModal
          appointment={selectedAppointment}
          onClose={() => setModal(null)}
          onSave={(labName) => {
            setAppointments((current) => current.map((item) => item.id === selectedAppointment.id ? { ...item, status: "Completed" } : item));
            if (labName) {
              setLabTests((current) => [{
                id: `LAB-${1085 + current.length}`,
                patient: selectedAppointment.patient,
                doctor: selectedAppointment.doctor,
                test: labName,
                date: "2026-07-29",
                status: "Pending",
              }, ...current]);
            }
            setModal(null);
            showToast("Consultation record and prescription saved");
          }}
        />
      )}

      {modal === "lab" && selectedLab && (
        <LabResultModal
          test={selectedLab}
          onClose={() => setModal(null)}
          onSave={(result) => {
            setLabTests((current) => current.map((test) => test.id === selectedLab.id ? { ...test, status: "Completed", result } : test));
            setModal(null);
            showToast("Lab result uploaded and notifications sent");
          }}
        />
      )}

      {modal === "invoice" && (
        <InvoiceModal
          onClose={() => setModal(null)}
          onSave={(invoice) => {
            setInvoices((current) => [invoice, ...current]);
            setModal(null);
            setActiveView("Invoices");
            showToast("Invoice created successfully");
          }}
        />
      )}

      {modal === "user" && (
        <UserModal
          onClose={() => setModal(null)}
          onSave={(user) => {
            setUsers((current) => [user, ...current]);
            setModal(null);
            showToast("User account created");
          }}
        />
      )}
    </main>
  );
}

function PageSection({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
        {action}
      </div>
      {children}
    </>
  );
}

function AppointmentTable({
  appointments,
  role,
  onOpen,
  onAction,
}: {
  appointments: Appointment[];
  role: Role;
  onOpen: (appointment: Appointment) => void;
  onAction: (appointment: Appointment) => void;
}) {
  if (appointments.length === 0) return <div className="empty-state"><Glyph>AP</Glyph><h3>No appointments found</h3><p>There are no appointments matching this view.</p></div>;
  return (
    <div className="data-table appointment-table">
      <div className="table-head"><span>Time</span><span>{role === "patient" ? "Doctor" : "Patient"}</span><span>Specialty</span><span>Date</span><span>Status</span><span /></div>
      {appointments.map((appointment) => (
        <div className="table-row" key={appointment.id}>
          <span><b>{appointment.time}</b><small>{appointment.id}</small></span>
          <span className="person-cell"><span className="avatar">{(role === "patient" ? appointment.doctor : appointment.patient).replace("Dr. ", "").split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><b>{role === "patient" ? appointment.doctor : appointment.patient}</b></span>
          <span>{appointment.specialty}</span><span>{formatDate(appointment.date)}</span><span><StatusPill status={appointment.status} /></span>
          <span className="table-actions">
            <button className="row-action" onClick={() => onOpen(appointment)}>Details</button>
            {appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
              <button className="row-action primary" onClick={() => onAction(appointment)}>
                {role === "doctor" ? "Consult" : role === "receptionist" ? appointment.status === "Pending" ? "Confirm" : "Check in" : "Reschedule"}
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function LabTable({
  tests,
  onAction,
}: {
  tests: LabTest[];
  onAction: (test: LabTest) => void;
}) {
  return (
    <div className="data-table lab-table">
      <div className="table-head"><span>Request</span><span>Patient</span><span>Test</span><span>Requested by</span><span>Status</span><span /></div>
      {tests.map((test) => (
        <div className="table-row" key={test.id}>
          <span><b>{test.id}</b><small>{formatDate(test.date)}</small></span>
          <span className="person-cell"><span className="avatar">{test.patient.split(" ").map((part) => part[0]).join("")}</span><b>{test.patient}</b></span>
          <span>{test.test}</span><span>{test.doctor}</span><span><StatusPill status={test.status} /></span>
          <span><button className="row-action primary" onClick={() => onAction(test)}>{test.status === "Completed" ? "View result" : "Process"}</button></span>
        </div>
      ))}
    </div>
  );
}

function BookingModal({
  appointments,
  onClose,
  onCreate,
}: {
  appointments: Appointment[];
  onClose: () => void;
  onCreate: (appointment: Appointment) => void;
}) {
  const [specialty, setSpecialty] = useState("Cardiology");
  const filteredDoctors = doctors.filter((doctor) => doctor.specialty === specialty);
  const [doctorName, setDoctorName] = useState("Dr. Lina Hassan");
  const [date, setDate] = useState("2026-07-30");
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const conflict = appointments.some(
      (appointment) =>
        appointment.doctor === doctorName &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== "Cancelled",
    );
    if (conflict) {
      setError("This time slot has already been reserved. Please choose another time.");
      return;
    }
    const doctor = doctors.find((item) => item.name === doctorName) ?? doctors[0];
    onCreate({
      id: `APT-${2405 + appointments.length}`,
      patient: "Ahmed Saad",
      doctor: doctor.name,
      specialty: doctor.specialty,
      date,
      time,
      status: "Pending",
      reason: reason || "General consultation",
      room: doctor.room,
    });
  };

  return (
    <Modal title="Book an Appointment" eyebrow="Patient booking" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <label>Specialty<select value={specialty} onChange={(event) => {
            const value = event.target.value;
            setSpecialty(value);
            setDoctorName(doctors.find((doctor) => doctor.specialty === value)?.name ?? doctors[0].name);
          }}>{[...new Set(doctors.map((doctor) => doctor.specialty))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Doctor<select value={doctorName} onChange={(event) => setDoctorName(event.target.value)}>{filteredDoctors.map((doctor) => <option key={doctor.name}>{doctor.name}</option>)}</select></label>
          <label>Date<input type="date" value={date} min="2026-07-29" onChange={(event) => setDate(event.target.value)} required /></label>
          <label>Available time<select value={time} onChange={(event) => setTime(event.target.value)}><option>09:00</option><option>09:45</option><option>10:30</option><option>11:15</option><option>12:00</option><option>13:30</option></select></label>
          <label className="full">Reason for visit<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly describe the reason for your appointment..." /></label>
        </div>
        <div className="booking-summary"><Glyph>✓</Glyph><span><strong>No payment is required now</strong><small>Reception will confirm your requested slot.</small></span></div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Confirm booking</button></div>
      </form>
    </Modal>
  );
}

function RescheduleModal({
  appointment,
  onClose,
  onSave,
}: {
  appointment: Appointment;
  onClose: () => void;
  onSave: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  return (
    <Modal title="Reschedule Appointment" eyebrow={appointment.id} onClose={onClose}>
      <div className="modal-form">
        <div className="current-slot"><span>Current appointment</span><strong>{formatDate(appointment.date)} at {appointment.time}</strong><small>{appointment.doctor} • {appointment.specialty}</small></div>
        <div className="form-grid">
          <label>New date<input type="date" value={date} min="2026-07-29" onChange={(event) => setDate(event.target.value)} /></label>
          <label>New time<select value={time} onChange={(event) => setTime(event.target.value)}><option>09:00</option><option>09:45</option><option>10:30</option><option>11:15</option><option>12:00</option></select></label>
        </div>
        <div className="modal-actions"><button className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" onClick={() => onSave(date, time)}>Send request</button></div>
      </div>
    </Modal>
  );
}

function ConsultationModal({
  appointment,
  onClose,
  onSave,
}: {
  appointment: Appointment;
  onClose: () => void;
  onSave: (labName: string) => void;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicine, setMedicine] = useState("");
  const [labName, setLabName] = useState("");
  return (
    <Modal title="Consultation Record" eyebrow={`${appointment.id} • ${appointment.patient}`} onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave(labName); }}>
        <div className="consultation-patient"><span className="avatar avatar-lg">{appointment.patient.split(" ").map((word) => word[0]).join("")}</span><span><strong>{appointment.patient}</strong><small>{appointment.reason}</small></span><button type="button" className="button button-soft button-small">View history</button></div>
        <div className="form-grid">
          <label className="full">Diagnosis<textarea required value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} placeholder="Enter clinical diagnosis..." /></label>
          <label className="full">Clinical notes & recommendations<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Document findings and follow-up recommendations..." /></label>
          <label>Prescription medicine<input value={medicine} onChange={(event) => setMedicine(event.target.value)} placeholder="Medicine name" /></label>
          <label>Lab request<select value={labName} onChange={(event) => setLabName(event.target.value)}><option value="">No lab request</option><option>Complete Blood Count</option><option>Lipid Profile</option><option>Blood Glucose</option><option>Thyroid Function Test</option></select></label>
        </div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Complete consultation</button></div>
      </form>
    </Modal>
  );
}

function LabResultModal({
  test,
  onClose,
  onSave,
}: {
  test: LabTest;
  onClose: () => void;
  onSave: (result: string) => void;
}) {
  const [result, setResult] = useState(test.result ?? "");
  return (
    <Modal title={test.status === "Completed" ? "Lab Result" : "Process Lab Request"} eyebrow={test.id} onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave(result); }}>
        <div className="detail-grid lab-detail">
          <span><small>Patient</small><b>{test.patient}</b></span><span><small>Requested by</small><b>{test.doctor}</b></span><span><small>Test</small><b>{test.test}</b></span><span><small>Status</small><StatusPill status={test.status} /></span>
        </div>
        <label>Result notes<textarea required value={result} onChange={(event) => setResult(event.target.value)} placeholder="Enter verified laboratory result and notes..." /></label>
        <label className="upload-box"><input type="file" accept=".pdf,image/*" /><Glyph>↑</Glyph><span><strong>Attach result file</strong><small>PDF, JPG, or PNG up to 10 MB</small></span></label>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Complete & notify</button></div>
      </form>
    </Modal>
  );
}

function InvoiceModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}) {
  const [patient, setPatient] = useState("Ahmed Saad");
  const [service, setService] = useState("General Consultation");
  const [amount, setAmount] = useState("40");
  return (
    <Modal title="Create Invoice" eyebrow="Clinic billing" onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => {
        event.preventDefault();
        onSave({ id: `INV-${4033 + Math.floor(Math.random() * 50)}`, patient, service, amount: Number(amount), date: "2026-07-29", status: "Pending" });
      }}>
        <div className="form-grid">
          <label>Patient<select value={patient} onChange={(event) => setPatient(event.target.value)}><option>Ahmed Saad</option><option>Mariam Ahmad</option><option>Khaled Naser</option><option>Noor Sami</option></select></label>
          <label>Service<select value={service} onChange={(event) => setService(event.target.value)}><option>General Consultation</option><option>Cardiology Consultation</option><option>Dermatology Consultation</option><option>Laboratory Tests</option></select></label>
          <label>Amount (USD)<input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label>Payment status<select><option>Pending</option><option>Paid</option></select></label>
        </div>
        <div className="invoice-total"><span>Total amount</span><strong>{money(Number(amount || 0))}</strong></div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Create invoice</button></div>
      </form>
    </Modal>
  );
}

function UserModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (user: ClinicUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ClinicUser["role"]>("patient");
  return (
    <Modal title="Create User Account" eyebrow="Access control" onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => {
        event.preventDefault();
        onSave({ id: `USR-${1010 + Math.floor(Math.random() * 100)}`, name, email, role, status: "Active" });
      }}>
        <div className="form-grid">
          <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter full name" required /></label>
          <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@smartclinic.demo" required /></label>
          <label>Role<select value={role} onChange={(event) => setRole(event.target.value as ClinicUser["role"])}><option value="patient">Patient</option><option value="doctor">Doctor</option><option value="receptionist">Receptionist</option><option>Lab Technician</option><option value="admin">Administrator</option></select></label>
          <label>Account status<select><option>Active</option><option>Inactive</option></select></label>
        </div>
        <div className="permission-note"><Glyph>RB</Glyph><span><strong>Role permissions</strong><small>The account will receive the permissions assigned to the selected role.</small></span></div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Create account</button></div>
      </form>
    </Modal>
  );
}
