import HttpError from "../../models/HttpError.js";
import Project from "../../models/projectModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";

const generateAiFeedback = (text) => {
  const normalized = text.toLowerCase();
  const has = (...terms) => terms.some((term) => normalized.includes(term));
  const missingPoints = [];
  if (!has("problem", "challenge", "issue"))
    missingPoints.push("State the problem and who it affects.");
  if (!has("objective", "goal", "aim"))
    missingPoints.push("Add measurable project objectives.");
  if (!has("method", "agile", "waterfall", "design"))
    missingPoints.push("Explain the proposed methodology.");
  if (!has("scope", "include", "exclude"))
    missingPoints.push("Define the project scope and boundaries.");
  return {
    problemStatement: has("problem", "challenge", "issue")
      ? "A problem statement is present for review."
      : "The problem statement needs clearer context and impact.",
    objectives: has("objective", "goal", "aim")
      ? "Objectives are identified; make them measurable where possible."
      : "Objectives are not clearly identified yet.",
    methodology: has("method", "agile", "waterfall", "design")
      ? "A methodology is mentioned and can be refined with steps."
      : "The proposal should explain how the work will be carried out.",
    scope: has("scope", "include", "exclude")
      ? "Scope boundaries are mentioned; verify they are achievable."
      : "Add inclusions, exclusions, and expected users.",
    missingPoints,
    overall: missingPoints.length
      ? "The proposal is a promising draft. Address the improvement points before formal review."
      : "The proposal covers the initial review areas and is ready for supervisor feedback.",
    generatedAt: new Date(),
  };
};

const findStudentProject = (studentId) =>
  Project.findOne({ memberNames: { $elemMatch: { id: studentId } } });

const getProposal = async (req, res, next) => {
  try {
    const project = await findStudentProject(req.query.studentId);
    if (!project) return next(new HttpError("Project not found", 404));

    res.json({
      proposal: {
        id: project._id,
        title: project.title,
        semester: project.semester,
        text: project.proposalText,
        status: project.proposalStatus,
        submittedAt: project.proposalSubmittedAt,
        reviewedAt: project.proposalReviewedAt,
        version: project.proposalVersion,
        feedback: project.proposalFeedback,
        attachments: project.proposalAttachments.map(
          ({ data, ...file }) => file,
        ),
        aiFeedback: project.aiFeedback,
      },
    });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve proposal", 500));
  }
};

const submitProposal = async (req, res, next) => {
  const { studentId, proposalText, semester, attachments = [] } = req.body;
  if (!studentId || !proposalText?.trim()) {
    return next(new HttpError("Proposal content is required", 400));
  }

  try {
    const project = await findStudentProject(studentId);
    if (!project) return next(new HttpError("Project not found", 404));

    project.proposalText = proposalText.trim();
    project.semester = semester?.trim() || project.semester;
    project.proposalStatus = "submitted";
    project.proposalSubmittedAt = new Date();
    project.proposalReviewedAt = undefined;
    project.proposalVersion += 1;
    project.proposalAttachments = attachments.map((file) => ({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      data: file.data,
    }));
    project.aiFeedback = generateAiFeedback(project.proposalText);
    await project.save();

    res.status(200).json({
      message: "Proposal submitted for review",
      proposal: {
        status: project.proposalStatus,
        submittedAt: project.proposalSubmittedAt,
        version: project.proposalVersion,
      },
    });
  } catch (error) {
    return next(new HttpError("Couldn't submit proposal", 500));
  }
};

const getAvailableSupervisors = async (req, res, next) => {
  try {
    const teachers = await Teacher.find(
      {},
      "name designation projectsLimit assignedProjectsCount",
    );
    res.json({ teachers });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve supervisors", 500));
  }
};

const requestSupervisor = async (req, res, next) => {
  const { studentId, teacherId, message = "" } = req.body;
  try {
    const [student, teacher] = await Promise.all([
      Student.findById(studentId),
      Teacher.findById(teacherId),
    ]);
    if (!student || !teacher)
      return next(new HttpError("Student or supervisor not found", 404));
    const existing = await SupervisorRequest.findOne({
      studentId,
      teacherId,
      status: "pending",
    });
    if (existing) return next(new HttpError("Request is already pending", 409));
    const request = await SupervisorRequest.create({
      studentId,
      studentName: student.name,
      teacherId,
      teacherName: teacher.name,
      projectId: student.assignedProjectId,
      message,
    });
    res.status(201).json({ request, message: "Supervisor request sent" });
  } catch (error) {
    return next(new HttpError("Couldn't send supervisor request", 500));
  }
};

export default {
  getProposal,
  submitProposal,
  getAvailableSupervisors,
  requestSupervisor,
};
