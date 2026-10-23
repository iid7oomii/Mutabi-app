# Appointments Business Rules

## Create Appointment

### BR-01 — Existing Child Required

A new appointment can only be created for a child that already exists in the system.

If the specified child does not exist, the appointment creation must be rejected.

---

### BR-02 — Same Clinic Required

The child and the assigned doctor must belong to the same clinic.

If the child and doctor belong to different clinics, the appointment creation must be rejected.

---

### BR-03 — Allowed Roles for Appointment Creation

Only users with the following roles are allowed to create appointments:

* Doctor
* Admin

The behavior depends on the role:

#### Doctor

A doctor can only create an appointment for themselves as the appointment doctor.

The doctor identity must be obtained from the authenticated user's identity and must not be selected arbitrarily by the doctor.

#### Admin

An admin may create an appointment and select the doctor who will handle the appointment.

The selected doctor must still satisfy all appointment business rules.

Users with any other role must not be allowed to create appointments.

---

### BR-04 — Assigned Doctor Required

The doctor assigned to the appointment must be the child's currently assigned supervising doctor.

A doctor from the same clinic is not sufficient if that doctor is not currently assigned to supervise the child.

If another doctor is selected, the appointment creation must be rejected.

---

### BR-05 — Appointment Must Be in the Future

The appointment start time must be in the future at the time the appointment is created.

Appointments must not be created for a date or time in the past.

---

### BR-06 — No Scheduling Conflict

An appointment must not conflict with another appointment belonging to:

* The same doctor.
* The same child.

Both the doctor and the child must be available for the entire requested appointment period.

---

### BR-07 — Active Doctor and Child Required

Both the child and the doctor must be active at the time the appointment is created.

If either the child or the doctor is inactive, the appointment creation must be rejected.

---

BR-08 — Fixed Appointment Duration

Every appointment has a fixed duration of 30 minutes.

The user only selects the appointment start time.
The appointment end time is automatically calculated as:

end_time = start_time + 30 minutes

The appointment duration cannot be changed by the Doctor or Admin during appointment creation.
---

BR-09 — No Overlap and Minimum 10-Minute Buffer

Each appointment occupies a 30-minute time period starting from its scheduled start time.

There must be a minimum 10-minute buffer before and after any appointment for both:
- the assigned doctor
- the child

---

### BR-10 — Appointment Ownership and Historical Visibility

Appointments remain associated with the doctor who originally created or booked them, even if the child's supervising doctor changes later.

Changing the child's supervising doctor must not transfer existing appointments to the newly assigned doctor.

A doctor may only view appointments that were booked under that doctor's appointment ownership.

For example:

```text
Doctor A supervises Child A.
Doctor A creates Appointment #1.

Later:
Child A is reassigned to Doctor B.
```

The expected behavior is:

```text
Doctor A → Can still view Appointment #1.
Doctor B → Cannot view Appointment #1.
```

Doctor B may create and view new appointments after becoming the child's assigned supervising doctor.

---

### BR-11 — Duplicate Request Protection

The same appointment creation request must not create multiple appointments.

If the same request is submitted more than once, only the first valid request must create the appointment.

Repeated submissions of the same request must not result in duplicate appointment records.

The implementation may use an idempotency mechanism, but the business requirement is that a single logical request produces at most one appointment.

---

# Create Appointment Validation Rules

### VR-01 — Child ID Is Required

`child_id` must be provided when creating an appointment.

A request without `child_id` must be rejected.

---

### VR-02 — Start Time Is Required

`start_time` must be provided when creating an appointment.

A request without `start_time` must be rejected.

---

### VR-03 — End Time Is Required

`end_time` must be provided when creating an appointment.

A request without `end_time` must be rejected.

---

### VR-04 — Valid Date-Time Format

Both `start_time` and `end_time` must contain valid date-time values that can be parsed by the system.

Invalid or malformed date-time values must be rejected.

---

### VR-05 — Valid Child ID

`child_id` must use the valid identifier type and format expected by the system.

Empty or malformed identifiers must be rejected.

This validation only verifies the identifier format.

Whether the child actually exists is covered by **BR-01**.

---

### VR-06 — Doctor ID Depends on the Authenticated Role

#### Doctor

When the authenticated user is a Doctor, the appointment doctor must be determined from the authenticated user's identity.

The doctor must not be allowed to select another `doctor_id`.

#### Admin

When the authenticated user is an Admin, `doctor_id` must be provided so the admin can select the doctor assigned to the appointment.

The selected doctor must still satisfy BR-02, BR-04, BR-06, BR-07, and BR-09.

---

### VR-07 — Notes Are Optional

`notes` is optional.

If provided, it must contain a string value.

Non-string values must be rejected.

---

### VR-08 — Empty Request Is Invalid

An appointment creation request must contain the required appointment data.

An empty JSON object or a missing request body must be rejected.

---

### VR-09 — Unknown Fields Are Rejected

The create appointment request must only accept explicitly supported fields.

Unexpected or unsupported fields must be rejected.

Examples of fields that must not be accepted unless explicitly supported by the API include:

```text
id
status
created_at
clinic_id
```

The API must not allow clients to arbitrarily set internal or system-managed appointment fields.
