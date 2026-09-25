import HttpError from "../../models/HttpError.js";
import Project from "../../models/projectModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";
import { notify } from "../../utils/notify.js";

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

const ensureProject = async (student, extras = {}) => {
  let project = await findStudentProject(student._id);
  if (project) return project;
  const klass = await Class.findById(student.classId);
  if (!klass) throw new Error("Student class not found");
  project = await Project.create({
    title: extras.title || `${student.name}'s Final Year Project`,
    description: extras.description || "",
    semester: extras.semester || "",
    memberNames: [{ name: student.name, id: student._id }],
    supervisorName: "Unassigned",
    classId: klass._id,
    className: klass.name,
  });
  student.assignedProjectId = project._id;
  await student.save();
  klass.totalProjects += 1;
  await klass.save();
  return project;
};

const getProposal = async (req, res, next) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) return next(new HttpError("Student not found", 404));
    const project = await findStudentProject(req.userId);
    if (!project) {
      return res.json({
        proposal: {
          title: "",
          semester: "",
          text: "",
          description: "",
          objectives: "",
          scope: "",
          methodology: "",
          technologies: "",
          expectedOutcome: "",
          status: "not_submitted",
          feedback: [],
          attachments: [],
        },
        message: "No project yet. Submit a proposal to get started.",
      });
    }

    res.json({
      proposal: {
        id: project._id,
        title: project.title,
        semester: project.semester,
        text: project.proposalText,
        description: project.proposalDescription,
        objectives: project.proposalObjectives,
        scope: project.proposalScope,
        methodology: project.proposalMethodology,
        technologies: project.proposalTechnologies,
        expectedOutcome: project.proposalExpectedOutcome,
        status: project.proposalStatus,
        submittedAt: project.proposalSubmittedAt,
        reviewedAt: project.proposalReviewedAt,
        version: project.proposalVersion,
        feedback: project.proposalFeedback,
        attachments: project.proposalAttachments.map(
          ({ data, ...file }) => file,
        ),
        aiFeedback: project.aiFeedback,
        supervisorName: project.supervisorName,
      },
    });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve proposal", 500));
  }
};

const submitProposal = async (req, res, next) => {
  const {
    proposalText,
    semester,
    attachments = [],
    title,
    description,
    objectives,
    scope,
    methodology,
    technologies,
    expectedOutcome,
  } = req.body;
  const combinedText = [
    description,
    objectives,
    scope,
    methodology,
    technologies,
    expectedOutcome,
  ]
    .filter((value) => value?.trim())
    .join("\n\n");
  if (!title?.trim() || (!combinedText.trim() && !proposalText?.trim())) {
    return next(
      new HttpError("Project title and proposal content are required", 400),
    );
  }

  try {
    const student = await Student.findById(req.userId);
    if (!student) return next(new HttpError("Student not found", 404));
    const project = await ensureProject(student, { title, semester });

    if (title?.trim()) project.title = title.trim();
    project.proposalText = proposalText?.trim() || combinedText.trim();
    project.proposalDescription = description?.trim() || "";
    project.proposalObjectives = objectives?.trim() || "";
    project.proposalScope = scope?.trim() || "";
    project.proposalMethodology = methodology?.trim() || "";
    project.proposalTechnologies = technologies?.trim() || "";
    project.proposalExpectedOutcome = expectedOutcome?.trim() || "";
    project.semester = semester?.trim() || project.semester;
    project.proposalStatus = "submitted";
    project.proposalSubmittedAt = new Date();
    project.proposalReviewedAt = undefined;
    project.proposalVersion += 1;
    const uploadedFiles = (req.files || []).map((file) => ({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      data: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    }));
    project.proposalAttachments = uploadedFiles.length
      ? uploadedFiles
      : attachments.map((file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data: file.data,
        }));
    project.aiFeedback = generateAiFeedback(project.proposalText);
    await project.save();

    if (project.supervisorId) {
      await notify({
        recipientId: project.supervisorId,
        recipientRole: "Teacher",
        title: "Proposal submitted",
        body: `${student.name} submitted a proposal for ${project.title}.`,
        type: "proposal",
        link: "/proposals",
      });
    }
    await notify({
      recipientId: process.env.ADMIN_ID,
      recipientRole: "Admin",
      title: "New proposal submitted",
      body: `${student.name} submitted ${project.title} for review.`,
      type: "proposal",
      link: "/proposals",
    });

    res.status(200).json({
      message: "Proposal submitted for review",
      proposal: {
        status: project.proposalStatus,
        submittedAt: project.proposalSubmittedAt,
        version: project.proposalVersion,
        id: project._id,
      },
    });
  } catch (error) {
    console.error(error);
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
  const { teacherId, message = "" } = req.body;
  try {
    const [student, teacher] = await Promise.all([
      Student.findById(req.userId),
      Teacher.findById(teacherId),
    ]);
    if (!student || !teacher)
      return next(new HttpError("Student or supervisor not found", 404));
    const existing = await SupervisorRequest.findOne({
      studentId: student._id,
      teacherId,
      status: "pending",
    });
    if (existing) return next(new HttpError("Request is already pending", 409));

    const project = await findStudentProject(student._id);
    const request = await SupervisorRequest.create({
      studentId: student._id,
      studentName: student.name,
      teacherId,
      teacherName: teacher.name,
      projectId: project?._id || student.assignedProjectId,
      message,
    });

    await notify({
      recipientId: teacher._id,
      recipientRole: "Teacher",
      title: "New supervisor request",
      body: `${student.name} requested you as supervisor.`,
      type: "supervisor",
      link: "/requests",
    });

    res.status(201).json({ request, message: "Supervisor request sent" });
  } catch (error) {
    return next(new HttpError("Couldn't send supervisor request", 500));
  }
};

const getMySupervisorRequests = async (req, res, next) => {
  try {
    const requests = await SupervisorRequest.find({
      studentId: req.userId,
    }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    return next(new HttpError("Couldn't load supervisor requests", 500));
  }
};

export default {
  getProposal,
  submitProposal,
  getAvailableSupervisors,
  requestSupervisor,
  getMySupervisorRequests,
};
