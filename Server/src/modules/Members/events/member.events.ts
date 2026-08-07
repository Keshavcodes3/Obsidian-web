export const MEMBER_EVENTS = {
    CREATED: "member.created",

    INVITED: "member.invited",
    INVITATION_ACCEPTED: "member.invitation.accepted",
    INVITATION_REJECTED: "member.invitation.rejected",
    INVITATION_CANCELLED: "member.invitation.cancelled",
    INVITATION_EXPIRED: "member.invitation.expired",

    JOINED: "member.joined",
    LEFT: "member.left",

    ROLE_UPDATED: "member.role.updated",

    REMOVED: "member.removed",

    OWNER_TRANSFERRED: "member.owner.transferred",

    SUSPENDED: "member.suspended",
    REACTIVATED: "member.reactivated",
} as const;