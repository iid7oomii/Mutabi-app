# Clinic Leads Business Rules

## Submit Clinic Lead

### BR-01 - Clinic Name Required

A clinic lead can only be submitted when the clinic name is provided.

If clinic_name is missing, empty, or contains only whitespace, the request must be rejected.

---

### BR-02 - Contact Name Required

A clinic lead must include the name of the person to contact at the clinic.

If contact_name is missing, empty, or contains only whitespace, the request must be rejected.

---

### BR-03 - Valid Email Required

A clinic lead must include an email address that can be used for follow-up communication.

The email must use a valid email format.

If the email is missing or invalid, the request must be rejected.

---

### BR-04 - Valid Saudi Contact Number Required

A clinic lead must include a valid Saudi contact number.

Accepted phone number categories are:

* Saudi mobile numbers.
* Saudi fixed line numbers.
* Saudi unified numbers starting with 9200.
* Saudi toll-free numbers starting with 800.

Short emergency, government, or public service numbers must not be accepted as clinic lead contact numbers.

Non-Saudi phone numbers must not be accepted.

---

### BR-05 - City Required

A clinic lead must include the city or governorate where the clinic is located.

The submitted city must exist in the approved Saudi cities and major governorates list used by the system.

If the city is missing or not approved, the request must be rejected.

---

### BR-06 - Notes Are Optional

notes is optional.

If notes are provided, they are sent with the clinic lead for additional context.

If notes are omitted, the clinic lead can still be submitted.

---

### BR-07 - Source Is Added Automatically

The system must add the lead source automatically.

For clinic leads submitted from the public landing page, the source must be landing_page.

The source is internal metadata and must not be supplied by the user.

---

### BR-08 - Submission Timestamp Is Added Automatically

The system must add the submission timestamp automatically when the lead is accepted.

The user must not provide or control the submitted_at value.

---

### BR-09 - Lead Must Be Sent to n8n

After validation succeeds, the backend must send the clinic lead payload to the configured n8n webhook.

The payload sent to n8n must include the validated lead data plus the internal metadata fields source and submitted_at.

---

### BR-10 - Do Not Return False Success When n8n Fails

If n8n is unavailable, returns an error, or the webhook request fails, the backend must not return a successful response.

The request should fail with an integration error response so the user is not told that the lead was submitted when it was not delivered.

---

# Submit Clinic Lead Validation Rules

### VR-01 - Clinic Name Must Be a Valid Length String

clinic_name must be provided as a string value.

Leading and trailing whitespace must be trimmed before validation.

Internal spaces are allowed and must be preserved.

After trimming, clinic_name must be at least 2 characters and no more than 100 characters.

Empty strings and whitespace-only values are invalid.

---

### VR-02 - Contact Name Must Be a Valid Length String

contact_name must be provided as a string value.

Leading and trailing whitespace must be trimmed before validation.

Internal spaces are allowed and must be preserved.

After trimming, contact_name must be at least 2 characters and no more than 50 characters.

Empty strings and whitespace-only values are invalid.

---

### VR-03 - Email Must Be Valid

email must be provided as a string value using a valid email format.

Leading and trailing whitespace must be trimmed before validation.

The email must not exceed 254 characters after trimming.

Invalid or malformed email addresses must be rejected.

---

### VR-04 - Phone Must Match an Accepted Saudi Format

phone must be provided as a string value.

Leading and trailing whitespace must be trimmed before validation.

Internal spaces and hyphens are allowed for user convenience.

For validation only, spaces and hyphens must be removed from a temporary cleaned copy of the phone number.

The original trimmed phone value must be preserved and sent to n8n.

The cleaned phone value must match one of the accepted Saudi contact number formats.

Accepted mobile formats:

* 05xxxxxxxx
* 5xxxxxxxx
* +9665xxxxxxxx
* 9665xxxxxxxx
* 009665xxxxxxxx

Accepted fixed line formats:

* 011xxxxxxx
* 012xxxxxxx
* 013xxxxxxx
* 014xxxxxxx
* 016xxxxxxx
* 017xxxxxxx
* +96611xxxxxxx, +96612xxxxxxx, +96613xxxxxxx, +96614xxxxxxx, +96616xxxxxxx, +96617xxxxxxx
* 96611xxxxxxx, 96612xxxxxxx, 96613xxxxxxx, 96614xxxxxxx, 96616xxxxxxx, 96617xxxxxxx
* 0096611xxxxxxx, 0096612xxxxxxx, 0096613xxxxxxx, 0096614xxxxxxx, 0096616xxxxxxx, 0096617xxxxxxx

Accepted unified number formats:

* 9200xxxxx
* +9669200xxxxx
* 9669200xxxxx
* 009669200xxxxx

Accepted toll-free number formats:

* 800xxxxxxx
* +966800xxxxxxx
* 966800xxxxxxx
* 00966800xxxxxxx

---

### VR-05 - City Must Be Approved

city must be provided as a string value.

The city must match a value from the approved Saudi cities and major governorates list.

---

### VR-06 - Notes Must Be a String When Provided

notes is optional.

If provided, it must contain a string value.

Leading and trailing whitespace must be trimmed before validation.

Internal spaces and line breaks are allowed and must be preserved.

After trimming, notes must not exceed 1000 characters.

Non-string values must be rejected.

---

### VR-07 - Empty Request Is Invalid

A clinic lead submission request must contain the required clinic lead data.

An empty request body must be rejected.
