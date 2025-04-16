// backend/utils/validate.js

const allowedPurposes = [
  "רפואה שלמה",
  "הצלחה",
  "זיווג",
  "שלום בית",
  "פרנסה",
  "אחר",
];

function validateNewRequest(body) {
  const { name, purpose, chapterIndices } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "חסר שם תקין לבקשה";
  }

  if (!allowedPurposes.includes(purpose)) {
    return "מטרה לא תקינה";
  }

  if (
    !Array.isArray(chapterIndices) ||
    chapterIndices.length === 0 ||
    !chapterIndices.every((n) => Number.isInteger(n))
  ) {
    return "חובה לשלוח רשימת פרקים תקינה (מספרים)";
  }

  return null;
}

function validateInt(value, label = "ערך") {
  if (!Number.isInteger(value)) return `${label} לא תקין`;
  return null;
}

module.exports = {
  validateNewRequest,
  validateInt,
};
