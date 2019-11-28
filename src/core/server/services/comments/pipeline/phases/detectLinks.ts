import {
  GQLCOMMENT_FLAG_REASON,
  GQLCOMMENT_STATUS,
} from "coral-server/graph/tenant/schema/__generated__/types";
import { ACTION_TYPE } from "coral-server/models/action/comment";
import { RevisionMetadata } from "coral-server/models/comment";
import { PartialSettings } from "coral-server/models/settings";
import {
  IntermediateModerationPhase,
  IntermediatePhaseResult,
} from "coral-server/services/comments/pipeline";

const testPremodLinksEnable = (
  settings: PartialSettings,
  metadata: RevisionMetadata
) => settings.premodLinksEnable && metadata && metadata.linkCount;

// This phase checks the comment if it has any links in it if the check is
// enabled.
export const detectLinks: IntermediateModerationPhase = ({
  story,
  tenant,
  metadata,
}): IntermediatePhaseResult | void => {
  if (
    testPremodLinksEnable(tenant.ownSettings, metadata) ||
    (story.ownSettings && testPremodLinksEnable(story.ownSettings, metadata))
  ) {
    // Add the flag related to Trust to the comment.
    return {
      status: GQLCOMMENT_STATUS.SYSTEM_WITHHELD,
      actions: [
        {
          userID: null,
          actionType: ACTION_TYPE.FLAG,
          reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_LINKS,
        },
      ],
    };
  }
};
