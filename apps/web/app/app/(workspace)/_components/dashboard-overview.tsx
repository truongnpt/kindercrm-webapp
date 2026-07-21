'use client';

import Link from 'next/link';
import {
  CreditCard,
  GraduationCap,
  Users,
  Wallet,
  PlusCircle,
  UserCheck,
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
  Activity,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';
import { Badge } from '@kit/ui/badge';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  SectionCard,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { DashboardSummary } from '~/lib/kinder/dashboard/load-dashboard';
import { LEAD_STAGE_I18N_KEYS } from '~/lib/kinder/crm/pipeline-stages';

// Color themes matching our primary brand and state tones
const COLORS = {
  primary: '#034cf8',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  muted: '#94a3b8',
};

// Sparkline component inside metric cards
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((val, i) => ({ x: i, val }));
  return (
    <div className="h-8 w-full opacity-80 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#gradient-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Map stage names to localized names for the CRM Lead chart
function getLeadStageLabel(stage: string) {
  const labels: Record<string, string> = {
    new: 'Mới',
    contacted: 'Đã liên hệ',
    visited: 'Tham quan',
    trial: 'Học thử',
    won: 'Nhập học',
    lost: 'Mất',
  };
  return labels[stage] || stage;
}

export function DashboardOverview({
  summary,
  features,
  recentLeads,
  recentStudents,
}: {
  summary: DashboardSummary;
  features: {
    crm: boolean;
    students: boolean;
    finance: boolean;
    attendance: boolean;
  };
  recentLeads: Array<{
    id: string;
    parent_name: string;
    child_name: string | null;
    stage: string;
    created_at: string;
  }>;
  recentStudents: Array<{
    id: string;
    full_name: string;
    status: string;
    created_at: string;
  }>;
}) {
  // Prep CRM Lead Chart Data
  const leadChartData = Object.entries(summary.leadsByStage).map(([stage, count]) => ({
    name: getLeadStageLabel(stage),
    'Số lượng': count,
  }));

  // Prep Attendance Chart Data
  const hasAttendance = summary.attendanceToday.total > 0;
  const attendanceChartData = hasAttendance
    ? [
        { name: 'Có mặt', value: summary.attendanceToday.present, color: COLORS.success },
        { name: 'Vắng mặt', value: summary.attendanceToday.absent, color: '#ef4444' },
      ]
    : [{ name: 'Chưa điểm danh', value: 1, color: '#e2e8f0' }];

  // Quick Action Config
  const quickActions = [
    features.crm && {
      icon: PlusCircle,
      title: 'Tạo Lead CRM',
      desc: 'Thêm cơ hội nhập học mới',
      href: pathsConfig.app.crm,
      color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    },
    features.attendance && {
      icon: UserCheck,
      title: 'Điểm danh nhanh',
      desc: 'Ghi nhận chuyên cần lớp học',
      href: pathsConfig.app.attendance,
      color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    },
    features.students && {
      icon: GraduationCap,
      title: 'Thêm học sinh',
      desc: 'Đăng ký hồ sơ học sinh mới',
      href: pathsConfig.app.students,
      color: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
    },
    features.attendance && {
      icon: FileText,
      title: 'Báo cáo ngày',
      desc: 'Ghi nhận ăn uống & sinh hoạt',
      href: pathsConfig.app.dailyReports,
      color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* KPI Cards section */}
      <BentoGrid columns={4}>
        {features.students ? (
          <Link
            href={pathsConfig.app.students}
            className="kinder-stat-card kinder-bento-tile-interactive group block overflow-hidden bg-gradient-to-br from-card via-card to-blue-500/[0.01]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="kinder-stat-card__label">HỌC SINH ĐĂNG KÝ</p>
              <div className="kinder-stat-card__icon bg-blue-500/10 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400">
                <GraduationCap className="size-6" />
              </div>
            </div>
            <p className="kinder-stat-card__value">{summary.totalStudents}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Đang hoạt động: <span className="font-semibold text-foreground">{summary.activeStudents}</span>
            </p>
            <Sparkline data={[20, 24, 22, 28, 30, 26, summary.totalStudents]} color={COLORS.info} />
          </Link>
        ) : null}

        {features.crm ? (
          <Link
            href={pathsConfig.app.crm}
            className="kinder-stat-card kinder-bento-tile-interactive group block overflow-hidden bg-gradient-to-br from-card via-card to-indigo-500/[0.01]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="kinder-stat-card__label">LEADS CRM MỚI</p>
              <div className="kinder-stat-card__icon bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400">
                <Users className="size-6" />
              </div>
            </div>
            <p className="kinder-stat-card__value">{summary.totalLeads}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Cơ hội đang chăm sóc trong phễu
            </p>
            <Sparkline data={[15, 18, 12, 22, 25, 23, summary.totalLeads]} color={COLORS.primary} />
          </Link>
        ) : null}

        {features.finance ? (
          <Link
            href={pathsConfig.app.finance}
            className="kinder-stat-card kinder-bento-tile-interactive group block overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/[0.01]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="kinder-stat-card__label">DOANH THU THÁNG NÀY</p>
              <div className="kinder-stat-card__icon bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400">
                <Wallet className="size-6" />
              </div>
            </div>
            <p className="kinder-stat-card__value">{formatVnd(summary.revenueThisMonth)}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Đã thu từ hóa đơn học phí
            </p>
            <Sparkline data={[120, 140, 160, 150, 180, 210, summary.revenueThisMonth ? 230 : 100]} color={COLORS.success} />
          </Link>
        ) : null}

        {features.finance ? (
          <Link
            href={pathsConfig.app.finance}
            className="kinder-stat-card kinder-bento-tile-interactive group block overflow-hidden bg-gradient-to-br from-card via-card to-amber-500/[0.01]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="kinder-stat-card__label">HỌC PHÍ CÒN THIẾU</p>
              <div className="kinder-stat-card__icon bg-amber-500/10 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400">
                <CreditCard className="size-6" />
              </div>
            </div>
            <p className="kinder-stat-card__value text-amber-600 dark:text-amber-400">{formatVnd(summary.outstandingDebt)}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Dư nợ phải thu từ phụ huynh
            </p>
            <Sparkline data={[80, 70, 95, 60, 50, 45, summary.outstandingDebt ? 30 : 50]} color={COLORS.warning} />
          </Link>
        ) : null}
      </BentoGrid>

      {/* Visual Charts section */}
      <BentoGrid columns={2}>
        {features.crm ? (
          <BentoTile className="bg-gradient-to-br from-card to-primary/[0.005]">
            <BentoTileHeader
              title="Phân bổ Lead theo Giai đoạn"
              description="Thống kê cơ hội tuyển sinh trong phễu CRM"
            />
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Bar dataKey="Số lượng" fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {leadChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? COLORS.primary : COLORS.info}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoTile>
        ) : null}

        {features.attendance ? (
          <BentoTile className="bg-gradient-to-br from-card to-emerald-500/[0.005]">
            <BentoTileHeader
              title="Tỷ lệ chuyên cần hôm nay"
              description="Trực quan hóa hoạt động điểm danh lớp học"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 h-[280px] mt-4">
              <div className="h-full w-full sm:w-1/2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} học sinh`, 'Trạng thái']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center rate label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-foreground">
                    {summary.attendanceToday.rate}%
                  </span>
                  <span className="text-xs text-muted-foreground">Có mặt</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full sm:w-auto">
                <div className="bg-muted/40 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      Có mặt
                    </span>
                    <span className="font-semibold text-foreground">
                      {summary.attendanceToday.present} / {summary.attendanceToday.total} HS
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-red-500" />
                      Vắng mặt
                    </span>
                    <span className="font-semibold text-foreground">
                      {summary.attendanceToday.absent} HS
                    </span>
                  </div>
                </div>

                {!hasAttendance ? (
                  <Button asChild size="sm" className="w-full" variant="outline">
                    <Link href={pathsConfig.app.attendance}>
                      Thực hiện điểm danh ngay
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" className="w-full" variant="ghost">
                    <Link href={pathsConfig.app.attendance} className="flex items-center justify-center gap-1.5">
                      Xem chi tiết điểm danh <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </BentoTile>
        ) : null}
      </BentoGrid>

      {/* Quick Actions & System Timeline */}
      <BentoGrid columns={2}>
        {/* Quick Actions Panel */}
        <BentoTile>
          <BentoTileHeader
            title="Thao tác nhanh"
            description="Lối tắt truy cập các tính năng chính nhanh chóng"
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex flex-col items-start p-4 rounded-xl border border-border bg-card/60 transition-all hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-sm"
                >
                  <div className={`p-2.5 rounded-xl ${action.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground mt-3">{action.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                </Link>
              );
            })}
          </div>
        </BentoTile>

        {/* System Activity Timeline */}
        <BentoTile>
          <BentoTileHeader
            title="Hoạt động & Trạng thái"
            description="Trạng thái vận hành của trường trong ngày"
          />
          <div className="relative border-l border-border pl-5 space-y-5 mt-5 ml-2.5">
            {/* Timeline Node 1: Classes status */}
            <div className="relative">
              <span className="absolute -left-[29px] top-0 flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 ring-4 ring-background">
                <CheckCircle2 className="size-3" />
              </span>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Vận hành lớp học</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trường đang có <span className="font-medium text-foreground">{summary.activeClasses} lớp học</span> đang hoạt động ổn định.
                  </p>
                </div>
                <Badge variant="outline">Đang chạy</Badge>
              </div>
            </div>

            {/* Timeline Node 2: Leave Request Status */}
            <div className="relative">
              <span className="absolute -left-[29px] top-0 flex size-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 ring-4 ring-background">
                <Clock className="size-3" />
              </span>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Duyệt đơn nghỉ phép</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.pendingLeaveRequests > 0 ? (
                      <span>Đang có <span className="font-semibold text-amber-600">{summary.pendingLeaveRequests} đơn xin phép</span> cần xét duyệt.</span>
                    ) : (
                      <span>Đơn xin phép của học sinh đã được duyệt hoàn tất.</span>
                    )}
                  </p>
                </div>
                {summary.pendingLeaveRequests > 0 ? (
                  <Badge variant="destructive">Cần xử lý</Badge>
                ) : (
                  <Badge variant="secondary">Hoàn tất</Badge>
                )}
              </div>
            </div>

            {/* Timeline Node 3: Billing / Invoice Status */}
            <div className="relative">
              <span className="absolute -left-[29px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-4 ring-background">
                <Activity className="size-3" />
              </span>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Hóa đơn học phí</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hệ thống đã phát hành <span className="font-medium text-foreground">{summary.invoicesThisMonth} hóa đơn</span> trong tháng này.
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Học phí</Badge>
              </div>
            </div>
          </div>
        </BentoTile>
      </BentoGrid>

      {/* Recent Items section */}
      <BentoGrid columns={2}>
        {/* Column 1: Recent registered students */}
        {features.students ? (
          <BentoTile>
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <BentoTileHeader
                className="mb-0 pb-0 border-0"
                title="Học sinh mới đăng ký"
                description="Danh sách học sinh mới ghi danh vào hệ thống"
              />
              <Link
                href={pathsConfig.app.students}
                className="text-primary hover:underline text-xs font-semibold flex items-center gap-0.5"
              >
                Tất cả <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Chưa có học sinh mới ghi danh.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`${pathsConfig.app.studentDetail}/${student.id}`}
                          className="font-semibold text-sm text-foreground hover:text-primary hover:underline"
                        >
                          {student.full_name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Đăng ký: {new Date(student.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="rounded-full">
                      {student.status === 'active' ? 'Hoạt động' : student.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </BentoTile>
        ) : null}

        {/* Column 2: Recent CRM Leads */}
        {features.crm ? (
          <BentoTile>
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <BentoTileHeader
                className="mb-0 pb-0 border-0"
                title="Leads CRM mới nhất"
                description="Cơ hội tuyển sinh vừa liên hệ gần đây"
              />
              <Link
                href={pathsConfig.app.crm}
                className="text-primary hover:underline text-xs font-semibold flex items-center gap-0.5"
              >
                Đến CRM <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Chưa có cơ hội tuyển sinh mới.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <Link
                        href={`${pathsConfig.app.crmLead}/${lead.id}`}
                        className="font-semibold text-sm text-foreground hover:text-primary hover:underline"
                      >
                        Phụ huynh: {lead.parent_name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Bé: <span className="font-medium text-foreground">{lead.child_name || '—'}</span> • Ngày nhận: {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20">
                      <Trans i18nKey={LEAD_STAGE_I18N_KEYS[lead.stage as keyof typeof LEAD_STAGE_I18N_KEYS] || lead.stage} />
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </BentoTile>
        ) : null}
      </BentoGrid>

      {/* Quick Stats overview panel */}
      <SectionCard title="Số liệu vận hành nhanh" className='kinder-bento-tile'>
        <BentoGrid columns={3}>
          {features.students ? (
            <div className="kinder-stat-inline bg-gradient-to-br from-card to-blue-500/[0.005]">
              <p className="kinder-stat-card__label text-xs uppercase tracking-wider text-muted-foreground">
                Học sinh hoạt động
              </p>
              <p className="text-foreground mt-2 text-2xl font-extrabold">{summary.activeStudents}</p>
            </div>
          ) : null}

          <div className="kinder-stat-inline bg-gradient-to-br from-card to-indigo-500/[0.005]">
            <p className="kinder-stat-card__label text-xs uppercase tracking-wider text-muted-foreground">
              Lớp học hoạt động
            </p>
            <p className="text-foreground mt-2 text-2xl font-extrabold">{summary.activeClasses}</p>
          </div>

          {features.attendance ? (
            <div className="kinder-stat-inline bg-gradient-to-br from-card to-amber-500/[0.005]">
              <p className="kinder-stat-card__label text-xs uppercase tracking-wider text-muted-foreground">
                Đơn xin nghỉ chờ duyệt
              </p>
              <p className="text-foreground mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {summary.pendingLeaveRequests}
              </p>
            </div>
          ) : null}
        </BentoGrid>
      </SectionCard>
    </div>
  );
}
