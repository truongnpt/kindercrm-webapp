'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { z } from 'zod';

const MarkNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

const MarkAllNotificationsReadSchema = z.object({});

function revalidateNotificationPaths() {
  revalidatePath(pathsConfig.parent.home);
  revalidatePath(pathsConfig.app.home);
}

export const markNotificationReadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('user_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', data.notificationId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidateNotificationPaths();
    return { success: true };
  },
  { schema: MarkNotificationReadSchema },
);

export const markAllNotificationsReadAction = enhanceAction(
  async (_data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('user_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (error) {
      throw error;
    }

    revalidateNotificationPaths();
    return { success: true };
  },
  { schema: MarkAllNotificationsReadSchema },
);
