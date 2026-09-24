import HttpError from "../../models/HttpError.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";

const getRequests = async (req, res, next) => {
  try {
    const requests = await SupervisorRequest.find({
      teacherId: req.query.teacherId,
    }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    return next(new HttpError("Couldn't retrieve supervisor requests", 500));
  }
};

const updateRequest = async (req, res, next) => {
  const { status, teacherId } = req.body;
  if (!["accepted", "rejected"].includes(status))
    return next(new HttpError("Invalid request status", 400));
  try {
    const request = await SupervisorRequest.findOneAndUpdate(
      { _id: req.params.requestId, teacherId },
      { status },
      { new: true },
    );
    if (!request) return next(new HttpError("Request not found", 404));
    res.json({ request, message: `Supervisor request ${status}` });
  } catch (error) {
    return next(new HttpError("Couldn't update supervisor request", 500));
  }
};

export default { getRequests, updateRequest };
