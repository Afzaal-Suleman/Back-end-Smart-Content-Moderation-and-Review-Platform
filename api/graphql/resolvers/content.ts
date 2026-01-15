import ContentItem from "../../models/content";
import User from "../../models/User";
import { hateWords, offensiveWords, violenceWords, sexualWords, spamWords } from "../../utils/listOfWords"
type ContentStatus = "pending" | "approved" | "rejected" | "needs_review" | "publish" | "draft";

function automatedTextReview(text: any) {
    const bannedWords = [
        ...spamWords,
        ...hateWords,
        ...offensiveWords,
        ...sexualWords,
        ...violenceWords
    ];

    let count = 0;
    const lowerText = text.toLowerCase();

    for (let word of bannedWords) {
        if (lowerText.includes(word)) {
            count++;
        }
    }

    if (count === 0) return "approved";
    if (count === 1) return "needs_review";
    return "rejected";
}


export const contentResolvers = {
    Query: {
        // Get all content items
        contents: async () => {
            try {
                const allContents = await ContentItem.findAll({
                    include: [
                        { model: User, as: "submitter" },
                        { model: User, as: "moderator" },
                    ],
                    order: [["submittedAt", "DESC"]],
                });

                // Ensure non-null array
                if (!allContents) return [];

                return allContents;
            } catch (err) {
                console.error("Error fetching contents:", err);
                return [];
            }
        },
        // Get single content item by ID
        content: async (_: any, { id }: { id: number }) => {
            try {
                const content = await ContentItem.findByPk(id, {
                    include: [
                        { model: User, as: "submitter" },
                        { model: User, as: "moderator" },
                    ],
                });

                if (!content) {
                    throw new Error(`ContentItem with id ${id} not found`);
                }

                return content;
            } catch (err: any) {
                console.error("Error fetching content:", err.message);
                throw new Error(`Failed to fetch content: ${err.message}`);
            }
        },

        contentByUser: async (_: any, __: any, context: any) => {
            // Get logged-in user's ID from context
            const userId = context.user?.id;

            if (!userId) {
                throw new Error("Not authenticated");
            }
            return ContentItem.findAll({
                where: { submittedBy: userId },
                include: [
                    { model: User, as: "submitter" },  // submitter info
                    { model: User, as: "moderator" },  // assigned moderator info
                ],
                order: [["submittedAt", "DESC"]],    // latest submitted first
            });
        },
        approvedContent: async () => {
            return ContentItem.findAll({
                where: {
                    status: "publish",
                },
                include: [
                    { model: User, as: "submitter" },
                    { model: User, as: "moderator" },
                ],
            });
        },


    },

    Mutation: {
        submitContent: async (_: any, { input }: { input: any }, context: any) => {

            const userId = context.user?.id;
            if (!userId) throw new Error("Authentication required");

            const { title, description, contentUrl, contentType, priority } = input;
            if (!title || !contentUrl || !contentType) {
                throw new Error("Title, content URL, and content type are required");
            }

            const validContentTypes = ["image", "video", "text", "audio", "document"];
            if (!validContentTypes.includes(contentType)) {
                throw new Error(`Invalid contentType. Must be one of: ${validContentTypes.join(", ")}`);
            }

            const validPriorities = ["low", "medium", "high"];
            const priorityValue = validPriorities.includes(priority) ? priority : "medium";

            const automated = await automatedTextReview(description + " " + title)

            console.log(automated);


            const content = await ContentItem.create({
                title,
                description: description || "",
                contentUrl,
                contentType,
                priority: priorityValue,
                status: automated ? automated : "needs_review",
                submittedBy: userId,
                submittedAt: new Date(),
            });

            return { success: true, ContentItem: content };
        },
        updateContentStatus: async (
            _: any,
            { input }: { input: { contentId: string; status: ContentStatus } },
            context: any
        ) => {
            const userId = context.user?.id;
            const userRole = context.user?.role;

            if (!userId) throw new Error("Authentication required");

            const { contentId, status: nextStatus } = input;

            const content = await ContentItem.findByPk(contentId);
            if (!content) throw new Error("Content not found");

            const currentStatus: string = content.status;
            const isOwner = content.submittedBy === userId;

            // Creator cannot change after submission
            // if (isOwner && currentStatus !== "draft") {
            //     throw new Error("Content is read-only after submission");
            // }

            // Creator rules
            // if (isOwner) {
            //     if (nextStatus !== "pending") {
            //         throw new Error("Creator can only submit content");
            //     }
            // }

            //  Automated checks after submission
            if (currentStatus === "pending" && nextStatus === "needs_review") {
                // allowed (automated system)
                nextStatus: "needs_review";
            }

            //  Moderator rules
            if (userRole === "moderator") {
                if (!["approved", "rejected"].includes(nextStatus)) {
                    throw new Error("Moderator can only approve or reject");
                }

                if (!["pending", "needs_review"].includes(currentStatus)) {
                    throw new Error("Moderator action not allowed on this status");
                }
            }

            //  Admin rules
            if (userRole === "admin") {
                if (nextStatus === "publish" && currentStatus !== "approved") {
                    throw new Error("Only approved content can be published");
                }
            }

            //  Block unauthorized users
            if (!["admin", "moderator"].includes(userRole) && !isOwner) {
                throw new Error("Not authorized to update status");
            }

            await content.update({
                status: nextStatus,
                reviewedBy:
                    ["approved", "rejected"].includes(nextStatus) ? userId : null,
                reviewedAt:
                    ["approved", "rejected"].includes(nextStatus) ? new Date() : null,
                publishedAt: nextStatus === "publish" ? new Date() : null,
            });

            return {
                success: true,
                message: `Status updated to ${nextStatus}`,
                ContentItem: content,
            };
        },

    },

    // Resolve nested fields
    ContentItem: {
        submittedBy: async (parent: any) => {
            return User.findByPk(parent.submittedBy);
        },
        assignedModerator: async (parent: any) => {
            if (!parent.assignedModerator) return null;
            return User.findByPk(parent.assignedModerator);
        },
    },
};
