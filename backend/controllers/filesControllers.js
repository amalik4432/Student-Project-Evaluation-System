import ProjectFile from "../models/projectFileModel.js";
import Project from "../models/projectModel.js";
import Student from "../models/studentModel.js";
import HttpError from "../models/HttpError.js";
import { notify } from "../utils/notify.js";

const canAccessProject = async (req, project) => {
  if (!project) return false;
  if (req.role === "Admin") return true;
  if (req.role === "Teacher") {
    return String(project.supervisorId || "") === String(req.userId);
  }
  return project.memberNames.some(
    (member) => String(member.id) === String(req.userId),
  );
};

const listFiles = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const filter = {};
    if (req.role === "Admin") {
      if (projectId) filter.projectId = projectId;
    } else if (req.role === "Student") {
      const student = await Student.findById(req.userId);
      const project = await Project.findOne({
        memberNames: { $elemMatch: { id: req.userId } },
      });
      if (!project && !student?.assignedProjectId) {
        return res.json({ files: [] });
      }
      filter.projectId = project?._id || student.assignedProjectId;
    } else {
      const projects = await Project.find({ supervisorId: req.userId }).select(
        "_id",
      );
      const ids = projects.map((p) => p._id);
      if (projectId) {
        if (!ids.some((id) => String(id) === String(projectId))) {
          return next(new HttpError("Not allowed to view these files", 403));
        }
        filter.projectId = projectId;
      } else {
        filter.projectId = { $in: ids };
      }
    }

    const files = await ProjectFile.find(filter)
      .select("-data")
      .sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    return next(new HttpError("Couldn't load files", 500));
  }
};

const uploadFile = async (req, res, next) => {
  const { projectId, name, type, size, data, category } = req.body;
  const uploadedFile = req.file;
  const fileName = uploadedFile?.originalname || name;
  const fileType = uploadedFile?.mimetype || type;
  const fileSize = uploadedFile?.size || size;
  const fileData = uploadedFile
    ? `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString("base64")}`
    : data;
  if (!projectId || !fileName || !fileData) {
    return next(new HttpError("File, name, and project are required", 400));
  }
  if (Number(fileSize) > 10000000) {
    return next(new HttpError("File is larger than 10MB", 400));
  }

  try {
    const project = await Project.findById(projectId);
    if (!(await canAccessProject(req, project))) {
      return next(new HttpError("Not allowed to upload to this project", 403));
    }

    const file = await ProjectFile.create({
      projectId,
      name: fileName,
      type: fileType || "application/octet-stream",
      size: fileSize || 0,
      data: fileData,
      category: category || "other",
      uploadedById: String(req.userId),
      uploadedByName:
        req.role === "Admin"
          ? "Administrator"
          : req.body.uploaderName || "User",
      uploadedByRole: req.role,
    });

    if (req.role === "Student" && project.supervisorId) {
      await notify({
        recipientId: project.supervisorId,
        recipientRole: "Teacher",
        title: "New project file",
        body: `${file.name} was uploaded to ${project.title}.`,
        type: "file",
        link: "/files",
      });
    }
    if (req.role === "Teacher") {
      await Promise.all(
        project.memberNames.map((member) =>
          notify({
            recipientId: member.id,
            recipientRole: "Student",
            title: "Supervisor uploaded a file",
            body: `${file.name} was added to ${project.title}.`,
            type: "file",
            link: "/files",
          }),
        ),
      );
    }

    const { data: _omit, ...safe } = file.toObject();
    res.status(201).json({ file: safe, message: "File uploaded" });
  } catch (error) {
    return next(new HttpError("Couldn't upload file", 500));
  }
};

const getFile = async (req, res, next) => {
  try {
    const file = await ProjectFile.findById(req.params.fileId);
    if (!file) return next(new HttpError("File not found", 404));
    const project = await Project.findById(file.projectId);
    if (!(await canAccessProject(req, project))) {
      return next(new HttpError("Not allowed to download this file", 403));
    }
    res.json({ file });
  } catch (error) {
    return next(new HttpError("Couldn't download file", 500));
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await ProjectFile.findById(req.params.fileId);
    if (!file) return next(new HttpError("File not found", 404));
    const project = await Project.findById(file.projectId);
    if (!(await canAccessProject(req, project))) {
      return next(new HttpError("Not allowed to delete this file", 403));
    }
    if (
      req.role === "Student" &&
      String(file.uploadedById) !== String(req.userId)
    ) {
      return next(new HttpError("You can only delete files you uploaded", 403));
    }
    await file.deleteOne();
    res.json({ message: "File deleted" });
  } catch (error) {
    return next(new HttpError("Couldn't delete file", 500));
  }
};

export default { listFiles, uploadFile, getFile, deleteFile };
