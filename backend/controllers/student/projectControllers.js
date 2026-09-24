import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Project from "../../models/projectModel.js";

const getProjectPage = async (req, res, next) => {
  const { studentId } = req.query;

  let project,
    projectMembers = [],
    supervisor;

  try {
    project = await Project.findOne({
      memberNames: {
        $elemMatch: {
          id: studentId,
        },
      },
    });

    for (const member of project.memberNames) {
      const student = await Student.findById(
        member.id,
        "name rollNo image hasTopped",
      );
      if (student) {
        projectMembers.push(student);
      }
    }
    supervisor = await Teacher.findById(project.supervisorId);

    res.send({
      project: project.toObject({ getters: true }),
      supervisor: supervisor.toObject({ getters: true }),
      projectMembers: projectMembers.map((m) => m.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve Project", 500));
  }
};

const editProjectDescription = async (req, res, next) => {
  const { projectId } = req.params;
  const { description } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { description: description },
      { new: true },
    );
    res.status(200).json({
      message: "Description Edited Successfully",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve Project", 500));
  }
};

export default {
  getProjectPage,
  editProjectDescription,
};
