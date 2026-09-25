import HttpError from "../../models/HttpError.js";
import Project from "../../models/projectModel.js";
import { notify } from "../../utils/notify.js";

const proposalStatuses = [
  "under_review",
  "needs_revision",
  "approved",
  "rejected",
];

const getProposalQueue = async (req, res, next) => {
  try {
    const projects = await Project.find({ supervisorId: req.userId })
      .select(
        "title className semester memberNames proposalText proposalDescription proposalObjectives proposalScope proposalMethodology proposalTechnologies proposalExpectedOutcome proposalStatus proposalSubmittedAt proposalReviewedAt proposalVersion proposalFeedback proposalAttachments",
      )
      .sort({ proposalSubmittedAt: 1 });
    res.json({ projects });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve proposal queue", 500));
  }
};

const reviewProposal = async (req, res, next) => {
  const { status, feedback } = req.body;
  if (!proposalStatuses.includes(status)) {
    return next(new HttpError("Invalid proposal status", 400));
  }
  if (!feedback?.trim()) {
    return next(new HttpError("Feedback is required", 400));
  }

  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      supervisorId: req.userId,
    });
    if (!project) return next(new HttpError("Proposal not found", 404));

    project.proposalStatus = status;
    project.proposalReviewedAt = new Date();
    project.proposalFeedback.push({
      message: feedback.trim(),
      authorId: req.userId,
      authorName: req.body.teacherName || "Supervisor",
      role: "Teacher",
    });
    await project.save();

    await Promise.all(
      project.memberNames.map((member) =>
        notify({
          recipientId: member.id,
          recipientRole: "Student",
          title: "Proposal review update",
          body: `Your proposal for ${project.title} is now ${status.replace("_", " ")}.`,
          type: "proposal",
          link: "/proposals",
        }),
      ),
    );

    res.json({ message: "Proposal review saved", project });
  } catch (error) {
    return next(new HttpError("Couldn't save proposal review", 500));
  }
};

export default { getProposalQueue, reviewProposal };
