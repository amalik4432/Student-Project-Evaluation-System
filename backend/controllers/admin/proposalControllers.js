import HttpError from "../../models/HttpError.js";
import Project from "../../models/projectModel.js";

const getProposalOverview = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .select(
        "title className semester supervisorName memberNames proposalStatus proposalSubmittedAt proposalReviewedAt proposalVersion proposalFeedback proposalAttachments",
      )
      .sort({ proposalStatus: 1, proposalSubmittedAt: -1 });

    const summary = projects.reduce(
      (counts, project) => {
        counts[project.proposalStatus] += 1;
        return counts;
      },
      {
        not_submitted: 0,
        submitted: 0,
        under_review: 0,
        needs_revision: 0,
        approved: 0,
        rejected: 0,
      },
    );

    res.json({ projects, summary });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve proposal overview", 500));
  }
};

const approveProposal = async (req, res, next) => {
  const { adminName = "HOD", feedback = "Approved at department level" } =
    req.body;
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return next(new HttpError("Proposal not found", 404));
    project.proposalStatus = "approved";
    project.proposalReviewedAt = new Date();
    project.proposalFeedback.push({
      message: feedback,
      authorName: adminName,
      role: "Admin",
    });
    await project.save();
    res.json({ project, message: "Proposal approved at department level" });
  } catch (error) {
    return next(new HttpError("Couldn't approve proposal", 500));
  }
};

export default { getProposalOverview, approveProposal };
