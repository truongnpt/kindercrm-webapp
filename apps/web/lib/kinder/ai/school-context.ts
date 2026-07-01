import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { SchoolAiContext } from './types';

export async function buildSchoolAiContext(
  schoolId: string,
  schoolName: string,
): Promise<SchoolAiContext> {
  const client = getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
  const lastMonthEnd = new Date(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth() + 1,
    0,
  )
    .toISOString()
    .slice(0, 10);

  const [
    students,
    classes,
    leads,
    enrollments,
    revenueThisMonth,
    revenueLastMonth,
    attendanceToday,
    reportsToday,
    lowStock,
  ] = await Promise.all([
    client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .is('deleted_at', null),
    client
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active'),
    client
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .is('deleted_at', null),
    client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', monthStart),
    client
      .from('invoice_payments')
      .select('amount')
      .eq('school_id', schoolId)
      .gte('payment_date', monthStart),
    client
      .from('invoice_payments')
      .select('amount')
      .eq('school_id', schoolId)
      .gte('payment_date', lastMonthStart)
      .lte('payment_date', lastMonthEnd),
    client
      .from('attendance_records')
      .select('status')
      .eq('school_id', schoolId)
      .eq('attendance_date', today),
    client
      .from('student_daily_reports')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('report_date', today)
      .eq('status', 'published'),
    client
      .from('inventory_products')
      .select('id, min_quantity')
      .eq('school_id', schoolId)
      .eq('is_active', true),
  ]);

  const { data: stockRows } = await client
    .from('inventory_stock')
    .select('product_id, quantity')
    .eq('school_id', schoolId);

  const stockByProduct = new Map(
    (stockRows ?? []).map((row) => [row.product_id, Number(row.quantity)]),
  );

  const revenueThisMonthTotal = (revenueThisMonth.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const revenueLastMonthTotal = (revenueLastMonth.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );

  const attendanceRows = attendanceToday.data ?? [];
  const presentCount = attendanceRows.filter(
    (row) => row.status === 'present' || row.status === 'late',
  ).length;
  const attendanceRate =
    attendanceRows.length > 0
      ? Math.round((presentCount / attendanceRows.length) * 100)
      : 0;

  let lowStockCount = 0;

  for (const product of lowStock.data ?? []) {
    const quantity = stockByProduct.get(product.id) ?? 0;

    if (quantity <= Number(product.min_quantity)) {
      lowStockCount += 1;
    }
  }

  return {
    schoolName,
    studentCount: students.count ?? 0,
    classCount: classes.count ?? 0,
    leadCount: leads.count ?? 0,
    enrolledThisMonth: enrollments.count ?? 0,
    revenueThisMonth: revenueThisMonthTotal,
    revenueLastMonth: revenueLastMonthTotal,
    attendanceRate,
    publishedReportsToday: reportsToday.count ?? 0,
    lowStockProducts: lowStockCount,
  };
}

export function formatSchoolContextForPrompt(context: SchoolAiContext) {
  return [
    `Trường: ${context.schoolName}`,
    `Học sinh: ${context.studentCount}`,
    `Lớp hoạt động: ${context.classCount}`,
    `Lead đang theo dõi: ${context.leadCount}`,
    `Tuyển mới tháng này: ${context.enrolledThisMonth}`,
    `Doanh thu tháng này: ${context.revenueThisMonth.toLocaleString('vi-VN')} VND`,
    `Doanh thu tháng trước: ${context.revenueLastMonth.toLocaleString('vi-VN')} VND`,
    `Tỷ lệ điểm danh hôm nay: ${context.attendanceRate}%`,
    `Nhật ký đã gửi hôm nay: ${context.publishedReportsToday}`,
    `Sản phẩm sắp hết kho: ${context.lowStockProducts}`,
  ].join('\n');
}

export function buildRuleBasedInsights(context: SchoolAiContext) {
  const leadToEnrollRate =
    context.leadCount > 0
      ? Math.round((context.enrolledThisMonth / context.leadCount) * 100)
      : 0;
  const projectedEnrollments = Math.max(
    context.enrolledThisMonth,
    Math.round(context.leadCount * 0.15),
  );
  const revenueTrend =
    context.revenueLastMonth > 0
      ? Math.round(
          ((context.revenueThisMonth - context.revenueLastMonth) /
            context.revenueLastMonth) *
            100,
        )
      : 0;
  const projectedRevenue = Math.round(
    context.revenueThisMonth * (1 + revenueTrend / 200),
  );

  return {
    enrollmentForecast: `Dựa trên ${context.leadCount} lead và ${context.enrolledThisMonth} học sinh mới tháng này (tỷ lệ chuyển đổi ~${leadToEnrollRate}%), dự báo tháng tới có khoảng ${projectedEnrollments} học sinh mới nếu duy trì tốc độ hiện tại.`,
    revenueForecast: `Doanh thu tháng này ${context.revenueThisMonth.toLocaleString('vi-VN')} VND (${revenueTrend >= 0 ? '+' : ''}${revenueTrend}% so với tháng trước). Dự báo tháng tới: ~${projectedRevenue.toLocaleString('vi-VN')} VND.`,
    summary: `Hôm nay điểm danh ${context.attendanceRate}%, đã gửi ${context.publishedReportsToday} nhật ký, ${context.lowStockProducts} mặt hàng sắp hết kho.`,
  };
}
