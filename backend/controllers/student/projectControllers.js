import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Project from "../../models/projectModel.js";
import Feedback from "../../models/feedbackModel.js";
import ProjectFile from "../../models/projectFileModel.js";
import ProjectMemberRequest from "../../models/projectMemberRequestModel.js";
import { notify } from "../../utils/notify.js";

const getProjectPage = async (req, res, next) => {
  const studentId = req.userId;
  try {
    const project = await Project.findOne({
      memberNames: { $elemMatch: { id: studentId } },
    });

    if (!project) {
      return res.json({
        project: null,
        supervisor: null,
        projectMembers: [],
        feedback: [],
        files: [],
      });
    }

    const projectMembers = [];
    for (const member of project.memberNames) {
      const student = await Student.findById(
        member.id,
        "name rollNo image hasTopped",
      );
      if (student) projectMembers.push(student);
    }

    const supervisor = project.supervisorId
      ? await Teacher.findById(project.supervisorId).select("-password -salt")
      : null;
    const feedback = await Feedback.find({ projectId: project._id }).sort({
      createdAt: -1,
    });
    const files = await ProjectFile.find({ projectId: project._id })
      .select("-data")
      .sort({ createdAt: -1 });

    res.json({
      project: project.toObject({ getters: true }),
      supervisor: supervisor ? supervisor.toObject({ getters: true }) : null,
      projectMembers: projectMembers.map((m) => m.toObject({ getters: true })),
      feedback,
      files,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve Project", 500));
  }
};

const editProjectDescription = async (req, res, next) => {
  const { projectId } = req.params;
  const { description, title } = req.body;

  try {
    const project = await Project.findOne({
      _id: projectId,
      memberNames: { $elemMatch: { id: req.userId } },
    });
    if (!project) return next(new HttpError("Project not found", 404));
    if (description !== undefined) project.description = description;
    if (title?.trim()) project.title = title.trim();
    await project.save();
    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't update project", 500));
  }
};

const createOrGetProject = async (req, res, next) => {
  const { title, description, semester, subject } = req.body;
  try {
    const student = await Student.findById(req.userId);
    if (!student) return next(new HttpError("Student not found", 404));

    let project = await Project.findOne({
      memberNames: { $elemMatch: { id: student._id } },
      ...(subject?.trim() ? { subject: subject.trim() } : {}),
    });
    if (project) {
      return res.json({ project, message: "Project already exists" });
    }

    const klass = await Class.findById(student.classId);
    if (!klass) return next(new HttpError("Student class not found", 404));

    project = await Project.create({
      title: title?.trim() || `${student.name}'s Final Year Project`,
      subject: subject?.trim() || "",
      description: description || "",
      ...(semester ? { semester: Number(semester) } : {}),
      memberNames: [{ name: student.name, id: student._id }],
      supervisorName: "Unassigned",
      classId: klass._id,
      className: klass.name,
    });

    student.assignedProjectId = project._id;
    await student.save();
    klass.totalProjects += 1;
    await klass.save();

    res.status(201).json({ project, message: "Project created" });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't create project", 500));
  }
};

const createMemberRequest = async (req, res, next) => {
  const { identifier, message = "" } = req.body;
  try {
    const [project, requester] = await Promise.all([
      Project.findOne({
        _id: req.params.projectId,
        memberNames: { $elemMatch: { id: req.userId } },
      }),
      Student.findById(req.userId),
    ]);
    if (!project || !requester)
      return next(new HttpError("Project not found", 404));
    if (!identifier?.trim())
      return next(
        new HttpError(
          "Enter an email, roll number, or registration number",
          400,
        ),
      );

    const student = await Student.findOne({
      $or: [
        { email: identifier.trim().toLowerCase() },
        { rollNo: identifier.trim() },
        { registrationNo: identifier.trim() },
      ],
    });
    if (!student)
      return next(new HttpError("No student matches that identifier", 404));
    if (String(student._id) === String(requester._id))
      return next(new HttpError("You are already in this project", 400));
    if (
      project.memberNames.some(
        (member) => String(member.id) === String(student._id),
      )
    )
      return next(new HttpError("That student is already a group member", 409));

    const pending = await ProjectMemberRequest.findOne({
      projectId: project._id,
      studentId: student._id,
      status: "pending",
    });
    if (pending)
      return next(new HttpError("An invitation is already pending", 409));

    const request = await ProjectMemberRequest.create({
      projectId: project._id,
      requesterId: requester._id,
      requesterName: requester.name,
      studentId: student._id,
      studentName: student.name,
      message,
    });
    await notify({
      recipientId: student._id,
      recipientRole: "Student",
      title: "Project group invitation",
      body: `${requester.name} invited you to join ${project.title}.`,
      type: "project",
      link: "/my-project",
    });
    res.status(201).json({ request, message: "Invitation sent for approval" });
  } catch (error) {
    return next(new HttpError("Couldn't send group invitation", 500));
  }
};

const getMemberRequests = async (req, res, next) => {
  try {
    const requests = await ProjectMemberRequest.find({
      studentId: req.userId,
      status: "pending",
    }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    return next(new HttpError("Couldn't load group invitations", 500));
  }
};

const decideMemberRequest = async (req, res, next) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status))
    return next(new HttpError("Invalid invitation decision", 400));
  try {
    const request = await ProjectMemberRequest.findOne({
      _id: req.params.requestId,
      studentId: req.userId,
      status: "pending",
    });
    if (!request) return next(new HttpError("Invitation not found", 404));
    request.status = status;
    await request.save();

    if (status === "approved") {
      const project = await Project.findById(request.projectId);
      const student = await Student.findById(req.userId);
      if (
        project &&
        student &&
        !project.memberNames.some(
          (member) => String(member.id) === String(student._id),
        )
      ) {
        project.memberNames.push({ name: student.name, id: student._id });
        await project.save();
        student.assignedProjectId = project._id;
        await student.save();
      }
    }
    await notify({
      recipientId: request.requesterId,
      recipientRole: "Student",
      title: `Project invitation ${status}`,
      body: `${request.studentName} ${status} the invitation for your project.`,
      type: "project",
      link: "/my-project",
    });
    res.json({ message: `Invitation ${status}` });
  } catch (error) {
    return next(new HttpError("Couldn't update group invitation", 500));
  }
};

export default {
  getProjectPage,
  editProjectDescription,
  createOrGetProject,
  createMemberRequest,
  getMemberRequests,
  decideMemberRequest,
};
