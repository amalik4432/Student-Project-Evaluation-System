import multer from "multer";

const storage = multer.memoryStorage();

const pdfOnly = (req, file, callback) => {
  if (
    file.mimetype !== "application/pdf" ||
    !file.originalname.toLowerCase().endsWith(".pdf")
  ) {
    return callback(new Error("Only PDF files are allowed"));
  }
  callback(null, true);
};

export const proposalUpload = multer({
  storage,
  fileFilter: pdfOnly,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

const projectFileTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

const projectFileFilter = (req, file, callback) => {
  if (!projectFileTypes.has(file.mimetype)) {
    return callback(
      new Error("Only PDF, Word, PowerPoint, and text files are allowed"),
    );
  }
  callback(null, true);
};

export const projectFileUpload = multer({
  storage,
  fileFilter: projectFileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
