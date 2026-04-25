// Helpers for generating WhatsApp Flow JSON (v3.1) for the Meta Flows builder.
// The user pastes the generated JSON into Meta Business Manager → WhatsApp Manager → Flows
// → Endpoint = "Without endpoint", then publishes to receive a numeric Flow ID.

export const FIELD_LIBRARY = [
  { key: "full_name", label: "Full name", type: "TextInput", required: true, input_type: "text" },
  { key: "email", label: "Email address", type: "TextInput", required: true, input_type: "email" },
  { key: "mobile", label: "Mobile number", type: "TextInput", required: true, input_type: "phone" },
  { key: "dob", label: "Date of birth", type: "DatePicker", required: true },
  { key: "address", label: "Address", type: "TextArea", required: false },
  { key: "city", label: "City", type: "TextInput", required: false, input_type: "text" },
  { key: "country", label: "Country", type: "TextInput", required: false, input_type: "text" },
  { key: "company", label: "Company", type: "TextInput", required: false, input_type: "text" },
  {
    key: "gender",
    label: "Gender",
    type: "RadioButtonsGroup",
    required: false,
    options: [
      { id: "female", title: "Female" },
      { id: "male", title: "Male" },
      { id: "other", title: "Prefer not to say" },
    ],
  },
  { key: "consent", label: "I agree to receive updates", type: "OptIn", required: true },
];

export const DEFAULT_SIGNUP_FIELDS = ["full_name", "email", "mobile", "dob", "consent"];

function fieldToFlowChild(field) {
  const base = {
    type: field.type,
    name: field.key,
    label: field.label,
    required: !!field.required,
  };
  if (field.type === "TextInput") {
    base["input-type"] = field.input_type || "text";
  }
  if (field.type === "RadioButtonsGroup" && Array.isArray(field.options)) {
    base["data-source"] = field.options.map((o) => ({ id: o.id, title: o.title }));
  }
  return base;
}

/**
 * Build a single-screen signup Flow JSON.
 * @param {object} opts
 * @param {string} opts.title          Screen title shown in the WhatsApp UI
 * @param {string} opts.cta            Primary submit button label
 * @param {string} opts.screenId       Screen identifier (e.g. SIGNUP)
 * @param {string[]} opts.fieldKeys    Ordered list of FIELD_LIBRARY keys to include
 */
export function buildSignupFlowJson({ title, cta, screenId, fieldKeys }) {
  const fields = (fieldKeys || []).map((k) => FIELD_LIBRARY.find((f) => f.key === k)).filter(Boolean);
  const children = fields.map(fieldToFlowChild);
  // Footer with submit button — payload echoes user input back to the business
  children.push({
    type: "Footer",
    label: cta || "Submit",
    "on-click-action": {
      name: "complete",
      payload: fields.reduce((acc, f) => {
        acc[f.key] = `\${form.${f.key}}`;
        return acc;
      }, {}),
    },
  });

  return {
    version: "3.1",
    screens: [
      {
        id: screenId || "SIGNUP",
        title: title || "Sign up",
        terminal: true,
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            {
              type: "Form",
              name: "form",
              children,
            },
          ],
        },
      },
    ],
  };
}
