import type {
  CommunicationMessageReaction,
  CommunicationReaction,
  CommunicationReactionGroup,
} from './types';
import { COMMUNICATION_REACTION_EMOJI } from './types';

export function groupMessageReactions(
  rows: CommunicationMessageReaction[],
  currentUserId: string,
): CommunicationReactionGroup[] {
  const grouped = new Map<
    CommunicationReaction,
    { count: number; reactedByMe: boolean }
  >();

  for (const row of rows) {
    const current = grouped.get(row.reaction) ?? {
      count: 0,
      reactedByMe: false,
    };

    grouped.set(row.reaction, {
      count: current.count + 1,
      reactedByMe: current.reactedByMe || row.user_id === currentUserId,
    });
  }

  return [...grouped.entries()]
    .map(([reaction, summary]) => ({
      reaction,
      emoji: COMMUNICATION_REACTION_EMOJI[reaction],
      count: summary.count,
      reactedByMe: summary.reactedByMe,
    }))
    .sort((left, right) => left.reaction.localeCompare(right.reaction));
}

export function groupReactionsByMessageId(
  rows: CommunicationMessageReaction[],
  currentUserId: string,
) {
  const byMessage = new Map<string, CommunicationMessageReaction[]>();

  for (const row of rows) {
    const current = byMessage.get(row.message_id) ?? [];
    current.push(row);
    byMessage.set(row.message_id, current);
  }

  const result = new Map<string, CommunicationReactionGroup[]>();

  for (const [messageId, messageRows] of byMessage.entries()) {
    result.set(messageId, groupMessageReactions(messageRows, currentUserId));
  }

  return result;
}

export function applyReactionToggle(
  reactions: CommunicationReactionGroup[],
  reaction: CommunicationReaction,
  currentUserId: string,
  action: 'add' | 'remove' | 'change',
) {
  const next = reactions.map((group) => ({ ...group }));

  if (action === 'remove') {
    return next
      .map((group) => {
        if (group.reaction !== reaction || !group.reactedByMe) {
          return group;
        }

        const count = group.count - 1;

        return count > 0
          ? { ...group, count, reactedByMe: false }
          : null;
      })
      .filter((group): group is CommunicationReactionGroup => group !== null);
  }

  const existingMine = next.find((group) => group.reactedByMe);

  if (existingMine && existingMine.reaction !== reaction) {
    const reduced = next
      .map((group) => {
        if (!group.reactedByMe) {
          return group;
        }

        const count = group.count - 1;

        return count > 0
          ? { ...group, count, reactedByMe: false }
          : null;
      })
      .filter((group): group is CommunicationReactionGroup => group !== null);

    const target = reduced.find((group) => group.reaction === reaction);

    if (target) {
      return reduced.map((group) =>
        group.reaction === reaction
          ? {
              ...group,
              count: group.count + 1,
              reactedByMe: true,
            }
          : group,
      );
    }

    return [
      ...reduced,
      {
        reaction,
        emoji: COMMUNICATION_REACTION_EMOJI[reaction],
        count: 1,
        reactedByMe: true,
      },
    ];
  }

  const target = next.find((group) => group.reaction === reaction);

  if (target) {
    return next.map((group) =>
      group.reaction === reaction
        ? {
            ...group,
            count: group.count + 1,
            reactedByMe: true,
          }
        : group,
    );
  }

  return [
    ...next,
    {
      reaction,
      emoji: COMMUNICATION_REACTION_EMOJI[reaction],
      count: 1,
      reactedByMe: true,
    },
  ];
}

export function resolveReactionToggleAction(
  reactions: CommunicationReactionGroup[],
  reaction: CommunicationReaction,
) {
  const existing = reactions.find((group) => group.reactedByMe);

  if (existing?.reaction === reaction) {
    return 'remove' as const;
  }

  if (existing) {
    return 'change' as const;
  }

  return 'add' as const;
}
