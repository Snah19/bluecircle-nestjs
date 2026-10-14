export const getRelationshipStatus = (
  isFollowedByViewer: boolean,
  isFolliwingViewer: boolean,
): "follow" | "following" | "follow back" | "friend" => {
  if (isFollowedByViewer && isFolliwingViewer) {
    return "friend";
  }
  if (isFollowedByViewer) {
    return "following";
  }
  if (isFolliwingViewer) {
    return "follow back";
  }

  return "follow";
};