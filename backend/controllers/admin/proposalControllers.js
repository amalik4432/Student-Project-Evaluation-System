import HttpError from "../../models/HttpError.js";
import Project from "../../models/projectModel.js";
import { notify } from "../../utils/notify.js";

const getProposalOverview = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .select(
        "title className semester supervisorName memberNames proposalStatus proposalSubmittedAt proposalReviewedAt proposalVersion proposalFeedback proposalAttachments proposalText proposalDescription proposalObjectives proposalScope proposalMethodology proposalTechnologies proposalExpectedOutcome",
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

const decideProposal = async (req, res, next) => {
  const { status, feedback } = req.body;
  if (!["approved", "rejected", "under_review"].includes(status)) {
    return next(new HttpError("Invalid proposal decision", 400));
  }
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return next(new HttpError("Proposal not found", 404));
    project.proposalStatus = status;
    project.proposalReviewedAt = new Date();
    project.proposalFeedback.push({
      message: feedback?.trim() || `Proposal ${status} at department level`,
      authorName: "Administrator",
      role: "Admin",
    });
    await project.save();

    await Promise.all(
      project.memberNames.map((member) =>
        notify({
          recipientId: member.id,
          recipientRole: "Student",
          title: `Proposal ${status}`,
          body: `Department ${status} your proposal for ${project.title}.`,
          type: "proposal",
          link: "/submissions",
        }),
      ),
    );
    if (project.supervisorId) {
      await notify({
        recipientId: project.supervisorId,
        recipientRole: "Teacher",
        title: `Proposal ${status} by admin`,
        body: `${project.title} was ${status} by the department.`,
        type: "proposal",
        link: "/proposal-queue",
      });
    }

    res.json({ project, message: `Proposal ${status}` });
  } catch (error) {
    return next(new HttpError("Couldn't update proposal", 500));
  }
};

export default {
  getProposalOverview,
  approveProposal: (req, res, next) => {
    req.body.status = "approved";
    return decideProposal(req, res, next);
  },
  decideProposal,
};
