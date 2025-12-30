const express = require("express");
const routes = express.Router(); // corrected
const userController = require("../controller/userController");
const paperController = require("../controller/paperController");
const reviewRequestController = require("../controller/reviewRequestController");
const improveController = require("../controller/statusController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const jwtAdminMiddleware = require("../middleware/jwtAdminMiddleware");
const multerConfig = require("../middleware/multerMiddleware"); // multer config
const multerImage = require("../middleware/multerImageMiddleware");

// use single file upload from multer
const upload = multerConfig;
const uploadImage = multerImage;

// ---------- AUTH ----------
routes.post("/register", userController.registerController);
routes.post("/login", userController.loginController);
routes.post("/google-login", userController.googleLoginController);

// ---------- PUBLISH PAPER ----------
routes.post(
  "/publish-paper",
  jwtMiddleware,
  upload.single("pdf"),
  paperController.publishPaperController
);



// ---------- REVIEWER REQUEST ----------
routes.post(
  "/reviewer-request",
  jwtMiddleware,
  upload.array("pdf", 3),
  reviewRequestController.reviewController
  
);

// ---------- REVIEWER: MANAGE REVIEWER REQUESTS ----------
routes.get(
  "/reviewer/review-requests",
  jwtMiddleware,
  reviewRequestController.listReviewerRequestsController
);
routes.post(
  "/reviewer/review-requests/:id/approve",
  jwtMiddleware,
  reviewRequestController.approveReviewerRequestController
);
routes.delete(
  "/reviewer/review-requests/:id",
  jwtMiddleware,
  reviewRequestController.deleteReviewerController
);

// ---------- SUGGESTION ----------
routes.post(
  "/suggest-improve",
  jwtMiddleware,
  improveController.addSuggestionController
);

// ---------- REVIEWER FEED ----------
routes.get(
  "/review-feed",
  jwtMiddleware,
  improveController.getReviewFeedController
);

// ---------- SUBMIT REVIEW DECISION ----------
routes.post(
  "/review/:paperId",
  jwtMiddleware,
  improveController.submitReviewDecisionController
);

// ---------- REVIEWER: MY STATUSES ----------
routes.get(
  "/review-status/me",
  jwtMiddleware,
  improveController.getMyReviewStatusesController
);

// ---------- USER: PAPER STATUSES ----------
routes.get(
  "/review-status/user/:email",
  improveController.getStatusesForUserPapersController
);

// ---------- USER PROFILE ----------
routes.get("/me", jwtMiddleware, userController.getMeController);
routes.post(
  "/edit-user-profile",
  jwtMiddleware,
  uploadImage.single("profile"),
  userController.editUserProfileController
);

// ---------- GET USER PAPERS ----------
routes.get("/user-papers/:email", paperController.getUserPapers);

// ---------- GET ALL PAPERS ----------
routes.get("/all-papers", paperController.getAllPapersController);

// ---------- DELETE PAPER ----------
routes.delete("/paper/:id", jwtMiddleware, paperController.deletePaperController);

// ---------- ADMIN: LISTS ----------
routes.get("/admin/users", jwtAdminMiddleware, userController.getAllUsersController);
routes.get("/admin/reviewers", jwtAdminMiddleware, async (req, res) => {
  try {
    const reviewers = await require("../model/reviewRequestModel").find();
    res.status(200).json(reviewers);
  } catch (e) {
    res.status(500).json({ error: "Failed to load reviewers" });
  }
});

// ---------- ADMIN: USER ACTIONS ----------
routes.delete("/admin/users/:id", jwtAdminMiddleware, userController.deleteUserController);
routes.post("/admin/users/:id/upgrade", jwtAdminMiddleware, userController.upgradeUserRoleController);

// ---------- ADMIN: REVIEWER ACTIONS ----------
routes.delete("/admin/reviewers/:id", jwtAdminMiddleware, reviewRequestController.deleteReviewerController);

// ---------- ADMIN: APPROVE PAPER ----------
routes.post(
  "/admin/papers/:paperId/approve",
  jwtAdminMiddleware,
  improveController.adminApprovePaperController
);

// ---------- ADMIN: LIST ACCEPTED/REJECTED PAPERS ----------
routes.get(
  "/admin/review-accepted",
  jwtAdminMiddleware,
  improveController.adminListAcceptedPapersController
);
routes.get(
  "/admin/review-rejected",
  jwtAdminMiddleware,
  improveController.adminListRejectedPapersController
);

module.exports = routes;
