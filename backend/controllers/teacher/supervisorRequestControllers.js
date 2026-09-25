import HttpError from "../../models/HttpError.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";
import Project from "../../models/projectModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import { notify } from "../../utils/notify.js";

const getRequests = async (req, res, next) => {
  try {
    const requests = await SupervisorRequest.find({
      teacherId: req.userId,
    }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve supervisor requests", 500));
  }
};

const updateRequest = async (req, res, next) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status))
    return next(new HttpError("Invalid request status", 400));
  try {
    const request = await SupervisorRequest.findOne({
      _id: req.params.requestId,
      teacherId: req.userId,
    });
    if (!request) return next(new HttpError("Request not found", 404));
    if (request.status !== "pending") {
      return next(new HttpError("This request has already been processed", 400));
    }

    const teacher = await Teacher.findById(req.userId);
    if (status === "accepted") {
      if (teacher.assignedProjectsCount >= teacher.projectsLimit) {
        return next(
          new HttpError("Supervision limit reached. Cannot accept more students.", 400),
        );
      }

      let project = request.projectId
        ? await Project.findById(request.projectId)
        : await Project.findOne({
            memberNames: { $elemMatch: { id: request.studentId } },
          });

      if (!project) {
        const student = await Student.findById(request.studentId);
        const klass = await Class.findById(student.classId);
        project = await Project.create({
          title: `${student.name}'s Final Year Project`,
          memberNames: [{ name: student.name, id: student._id }],
          supervisorName: teacher.name,
          supervisorId: teacher._id,
          classId: klass._id,
          className: klass.name,
        });
        student.assignedProjectId = project._id;
        await student.save();
        klass.totalProjects += 1;
        await klass.save();
      } else {
        project.supervisorId = teacher._id;
        project.supervisorName = teacher.name;
        await project.save();
      }

      if (!teacher.assignedProjects.some((id) => String(id) === String(project._id))) {
        teacher.assignedProjects.push(project._id);
        teacher.assignedProjectsCount += 1;
        await teacher.save();
      }

      await SupervisorRequest.updateMany(
        {
          studentId: request.studentId,
          _id: { $ne: request._id },
          status: "pending",
        },
        { status: "rejected" },
      );
    }

    request.status = status;
    await request.save();

    await notify({
      recipientId: request.studentId,
      recipientRole: "Student",
      title: `Supervisor request ${status}`,
      body: `${teacher.name} ${status} your supervision request.`,
      type: "supervisor",
      link: "/supervisor",
    });

    res.json({ request, message: `Supervisor request ${status}` });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Couldn't update supervisor request", 500));
  }
};

export default { getRequests, updateRequest };
