export type CommunicationSenderProfile = {
  name: string;
  pictureUrl: string | null;
};

type AccountRow = {
  id: string;
  name: string;
  picture_url: string | null;
};

type StaffRow = {
  user_id: string | null;
  full_name: string;
};

export function buildSenderProfileMap(
  userIds: string[],
  accounts: AccountRow[],
  staff: StaffRow[],
) {
  const map = new Map<string, CommunicationSenderProfile>();

  for (const account of accounts) {
    map.set(account.id, {
      name: account.name,
      pictureUrl: account.picture_url,
    });
  }

  for (const employee of staff) {
    if (!employee.user_id) {
      continue;
    }

    const existing = map.get(employee.user_id);

    map.set(employee.user_id, {
      name: employee.full_name,
      pictureUrl: existing?.pictureUrl ?? null,
    });
  }

  for (const userId of userIds) {
    if (!map.has(userId)) {
      map.set(userId, { name: '—', pictureUrl: null });
    }
  }

  return map;
}
