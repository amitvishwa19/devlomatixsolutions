// Curated gallery of Meta-approved WhatsApp template patterns.
// Each preset describes the exact `components[]` payload that Meta expects
// for create_template, plus a small UI hint used to render the preview card.
//
// References: WhatsApp Business Platform → Message Templates docs.
// Categories: MARKETING | UTILITY | AUTHENTICATION

export const TEMPLATE_TYPES = [
  { id: "text", label: "Text", description: "Simple body-only message" },
  { id: "media", label: "Media header", description: "Image / video / document header" },
  { id: "buttons_quick_reply", label: "Quick reply buttons", description: "Up to 3 tap-to-reply buttons" },
  { id: "buttons_cta", label: "Call-to-action buttons", description: "URL + phone number buttons" },
  { id: "list", label: "List menu", description: "Structured list (sent at runtime)" },
  { id: "form", label: "Form / flow", description: "Collect inputs via a Flow CTA" },
  { id: "authentication", label: "Authentication (OTP)", description: "One-time password code" },
  { id: "registration", label: "Registration / onboarding", description: "Sign-up nudge with CTA" },
  { id: "carousel", label: "Carousel", description: "Multiple media cards in one template" },
];

export const GALLERY_PRESETS = [
  // ─────────── TEXT ───────────
  {
    id: "text_welcome",
    type: "text",
    name: "welcome_message",
    title: "Welcome message",
    category: "MARKETING",
    language: "en_US",
    description: "Friendly intro after a customer opts in.",
    components: [
      { type: "BODY", text: "Hi {{1}} 👋, welcome to {{2}}! We're glad you're here." },
      { type: "FOOTER", text: "Reply STOP to unsubscribe" },
    ],
  },
  {
    id: "text_order_update",
    type: "text",
    name: "order_status_update",
    title: "Order status update",
    category: "UTILITY",
    language: "en_US",
    description: "Plain text status notification.",
    components: [
      { type: "HEADER", format: "TEXT", text: "Order update" },
      { type: "BODY", text: "Hi {{1}}, your order #{{2}} is now *{{3}}*. We'll keep you posted." },
    ],
  },

  // ─────────── MEDIA HEADER ───────────
  {
    id: "media_promo_image",
    type: "media",
    name: "promo_image_offer",
    title: "Promo with image header",
    category: "MARKETING",
    language: "en_US",
    description: "Image header + promo body + footer.",
    components: [
      { type: "HEADER", format: "IMAGE", example: { header_handle: ["https://example.com/promo.jpg"] } },
      { type: "BODY", text: "Hi {{1}}, get *{{2}}% off* on your next purchase. Code: {{3}}" },
      { type: "FOOTER", text: "Limited time offer" },
    ],
  },
  {
    id: "media_invoice_doc",
    type: "media",
    name: "invoice_document",
    title: "Invoice (document header)",
    category: "UTILITY",
    language: "en_US",
    description: "Send a PDF invoice as document header.",
    components: [
      { type: "HEADER", format: "DOCUMENT", example: { header_handle: ["https://example.com/invoice.pdf"] } },
      { type: "BODY", text: "Hi {{1}}, attached is invoice #{{2}} for {{3}}. Thank you!" },
    ],
  },
  {
    id: "media_video_demo",
    type: "media",
    name: "product_video_demo",
    title: "Product video demo",
    category: "MARKETING",
    language: "en_US",
    description: "Short product video header.",
    components: [
      { type: "HEADER", format: "VIDEO", example: { header_handle: ["https://example.com/demo.mp4"] } },
      { type: "BODY", text: "Hey {{1}}, check out our newest {{2}} in this 30-second demo!" },
    ],
  },

  // ─────────── QUICK REPLY ───────────
  {
    id: "qr_feedback",
    type: "buttons_quick_reply",
    name: "feedback_quick_reply",
    title: "Feedback (quick reply)",
    category: "UTILITY",
    language: "en_US",
    description: "Yes / No / Maybe quick replies.",
    components: [
      { type: "BODY", text: "Hi {{1}}, did you enjoy your recent order from {{2}}?" },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "👍 Yes" },
          { type: "QUICK_REPLY", text: "👎 No" },
          { type: "QUICK_REPLY", text: "Maybe" },
        ],
      },
    ],
  },

  // ─────────── CTA BUTTONS ───────────
  {
    id: "cta_track_order",
    type: "buttons_cta",
    name: "track_order_cta",
    title: "Track order (URL + call)",
    category: "UTILITY",
    language: "en_US",
    description: "URL button + phone number button.",
    components: [
      { type: "BODY", text: "Hi {{1}}, your order #{{2}} has shipped 📦. Track it below." },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Track order", url: "https://example.com/track/{{1}}", example: ["ABC123"] },
          { type: "PHONE_NUMBER", text: "Call support", phone_number: "+1-555-0100" },
        ],
      },
    ],
  },

  // ─────────── LIST ───────────
  // Note: list/section payloads are sent at message-send time via interactive
  // messages, but the *template* itself is typically a BODY + URL CTA stub.
  {
    id: "list_menu",
    type: "list",
    name: "menu_list_intro",
    title: "Menu list (interactive)",
    category: "MARKETING",
    language: "en_US",
    description: "Body that introduces an interactive list menu.",
    components: [
      { type: "HEADER", format: "TEXT", text: "Today's menu" },
      { type: "BODY", text: "Hi {{1}}, tap below to browse our {{2}} categories and pick what you'd like." },
      { type: "FOOTER", text: "Powered by WhatsApp" },
      {
        type: "BUTTONS",
        buttons: [{ type: "URL", text: "Open menu", url: "https://example.com/menu" }],
      },
    ],
  },

  // ─────────── FORM / FLOW ───────────
  {
    id: "form_flow",
    type: "form",
    name: "lead_capture_flow",
    title: "Lead capture form",
    category: "MARKETING",
    language: "en_US",
    description: "Open a Flow to collect name, email & preference.",
    components: [
      { type: "BODY", text: "Hi {{1}}, takes 30 seconds — share a few details so we can tailor {{2}} for you." },
      {
        type: "BUTTONS",
        buttons: [{ type: "URL", text: "Start form", url: "https://example.com/flow/lead" }],
      },
    ],
  },
  {
    id: "form_signup_full",
    type: "form",
    name: "signup_form_full",
    title: "Sign-up form (email · mobile · DOB)",
    category: "MARKETING",
    language: "en_US",
    description:
      "Opens an in-WhatsApp Flow that collects full name, email, mobile, and date of birth. Replace flow_id with the Flow you publish in Meta Business Manager.",
    components: [
      { type: "HEADER", format: "TEXT", text: "Quick sign-up" },
      {
        type: "BODY",
        text:
          "Hi {{1}}, please share a few details so we can set up your account:\n\n• Full name\n• Email\n• Mobile\n• Date of birth\n\nIt only takes 30 seconds.",
      },
      { type: "FOOTER", text: "Your details are kept private." },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "FLOW",
            text: "Fill the form",
            // Replace flow_id with the published Flow ID from Meta Business Manager
            flow_id: "REPLACE_WITH_FLOW_ID",
            flow_action: "navigate",
            navigate_screen: "SIGNUP",
          },
        ],
      },
    ],
  },

  // ─────────── AUTHENTICATION ───────────
  {
    id: "auth_otp",
    type: "authentication",
    name: "verification_otp",
    title: "OTP verification code",
    category: "AUTHENTICATION",
    language: "en_US",
    description: "One-time passcode template.",
    components: [
      { type: "BODY", text: "{{1}} is your verification code. For your security, do not share this code." },
      { type: "FOOTER", text: "This code expires in 10 minutes." },
      {
        type: "BUTTONS",
        buttons: [{ type: "URL", text: "Copy code", url: "https://example.com/verify?code={{1}}", example: ["123456"] }],
      },
    ],
  },

  // ─────────── REGISTRATION ───────────
  {
    id: "registration_signup",
    type: "registration",
    name: "registration_signup_nudge",
    title: "Registration nudge",
    category: "MARKETING",
    language: "en_US",
    description: "Encourage account creation with a CTA.",
    components: [
      { type: "HEADER", format: "TEXT", text: "Almost there, {{1}}!" },
      { type: "BODY", text: "Complete your registration on {{2}} to unlock member benefits and early access." },
      { type: "FOOTER", text: "Takes less than a minute" },
      {
        type: "BUTTONS",
        buttons: [{ type: "URL", text: "Finish sign-up", url: "https://example.com/signup" }],
      },
    ],
  },

  // ─────────── CAROUSEL ───────────
  {
    id: "carousel_products",
    type: "carousel",
    name: "product_carousel",
    title: "Product carousel",
    category: "MARKETING",
    language: "en_US",
    description: "Up to 10 swipeable product cards.",
    components: [
      { type: "BODY", text: "Hi {{1}}, take a look at our top picks for you this week:" },
      {
        type: "CAROUSEL",
        cards: [
          {
            components: [
              { type: "HEADER", format: "IMAGE", example: { header_handle: ["https://example.com/p1.jpg"] } },
              { type: "BODY", text: "{{1}} — only {{2}}. Don't miss out!" },
              {
                type: "BUTTONS",
                buttons: [{ type: "URL", text: "Shop now", url: "https://example.com/p/{{1}}", example: ["sku-1"] }],
              },
            ],
          },
          {
            components: [
              { type: "HEADER", format: "IMAGE", example: { header_handle: ["https://example.com/p2.jpg"] } },
              { type: "BODY", text: "{{1}} — only {{2}}. Limited stock!" },
              {
                type: "BUTTONS",
                buttons: [{ type: "URL", text: "Shop now", url: "https://example.com/p/{{1}}", example: ["sku-2"] }],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Helpers for the preview card
export function getHeader(components) {
  return (components || []).find((c) => String(c.type).toUpperCase() === "HEADER");
}
export function getBody(components) {
  return (components || []).find((c) => String(c.type).toUpperCase() === "BODY");
}
export function getFooter(components) {
  return (components || []).find((c) => String(c.type).toUpperCase() === "FOOTER");
}
export function getButtons(components) {
  const block = (components || []).find((c) => String(c.type).toUpperCase() === "BUTTONS");
  return block?.buttons || [];
}
export function getCarousel(components) {
  return (components || []).find((c) => String(c.type).toUpperCase() === "CAROUSEL");
}
