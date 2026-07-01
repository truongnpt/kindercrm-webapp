import Link from 'next/link';

import {
  ArrowRightIcon,
  BarChart3,
  BookOpen,
  Check,
  ClipboardCheck,
  Globe,
  GraduationCap,
  LayoutGrid,
  MessageCircle,
  School,
  Sparkles,
  Target,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { MarketingHeroPreview } from '~/(marketing)/_components/marketing-hero-preview';
import appConfig from '~/config/app.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

const primaryModules = [
  {
    icon: Target,
    labelKey: 'marketing:heroFeatureCrm',
    descKey: 'marketing:heroFeatureCrmDesc',
  },
  {
    icon: GraduationCap,
    labelKey: 'marketing:heroFeatureStudents',
    descKey: 'marketing:heroFeatureStudentsDesc',
  },
  {
    icon: LayoutGrid,
    labelKey: 'marketing:heroFeatureClasses',
    descKey: 'marketing:heroFeatureClassesDesc',
  },
  {
    icon: Users,
    labelKey: 'marketing:heroFeatureStaff',
    descKey: 'marketing:heroFeatureStaffDesc',
  },
  {
    icon: ClipboardCheck,
    labelKey: 'marketing:heroFeatureAttendance',
    descKey: 'marketing:heroFeatureAttendanceDesc',
  },
  {
    icon: Wallet,
    labelKey: 'marketing:heroFeatureFees',
    descKey: 'marketing:heroFeatureFeesDesc',
  },
] as const;

const extendedModules = [
  {
    icon: Utensils,
    labelKey: 'marketing:heroFeatureMenu',
    descKey: 'marketing:heroFeatureMenuDesc',
  },
  {
    icon: BookOpen,
    labelKey: 'marketing:heroFeatureDiary',
    descKey: 'marketing:heroFeatureDiaryDesc',
  },
  {
    icon: MessageCircle,
    labelKey: 'marketing:heroFeatureParents',
    descKey: 'marketing:heroFeatureParentsDesc',
  },
  {
    icon: Globe,
    labelKey: 'marketing:heroFeatureCms',
    descKey: 'marketing:heroFeatureCmsDesc',
  },
  {
    icon: BarChart3,
    labelKey: 'marketing:heroFeatureReports',
    descKey: 'marketing:heroFeatureReportsDesc',
  },
  {
    icon: Sparkles,
    labelKey: 'marketing:heroFeatureAi',
    descKey: 'marketing:heroFeatureAiDesc',
  },
] as const;

const valueItems = [
  'marketing:heroValueCentralized',
  'marketing:heroValueAutomation',
  'marketing:heroValueEfficiency',
  'marketing:heroValueExperience',
  'marketing:heroValueScale',
] as const;

const steps = [
  {
    icon: School,
    titleKey: 'marketing:heroStep1Title',
    descKey: 'marketing:heroStep1Desc',
  },
  {
    icon: Users,
    titleKey: 'marketing:heroStep2Title',
    descKey: 'marketing:heroStep2Desc',
  },
  {
    icon: MessageCircle,
    titleKey: 'marketing:heroStep3Title',
    descKey: 'marketing:heroStep3Desc',
  },
] as const;

async function Home() {
  const { t } = await createI18nServerInstance();

  return (
    <div className="mt-4 flex flex-col gap-24 py-14">
      <div className="container mx-auto">
        <Hero
          pill={
            <Pill label={t('marketing:heroPill')}>
              {t('marketing:heroPillText')}
            </Pill>
          }
          title={
            <>
              <span>{t('marketing:heroTitle1')}</span>
              <span>{t('marketing:heroTitle2')}</span>
            </>
          }
          subtitle={t('marketing:heroSubtitle')}
          cta={<MainCallToActionButton />}
          image={<MarketingHeroPreview />}
        />
      </div>

      <div className="container mx-auto">
        <VisionSection />
      </div>

      <div className="container mx-auto">
        <div className="flex flex-col gap-16 xl:gap-32 2xl:gap-36">
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold">
                  <Trans i18nKey="marketing:heroFeatureHeading" />
                </b>
                .{' '}
                <span className="text-muted-foreground font-normal">
                  <Trans
                    i18nKey="marketing:heroFeatureSubheading"
                    values={{ productName: appConfig.name }}
                  />
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <School className="h-5" />
                <span>
                  <Trans i18nKey="marketing:heroFeatureAllInOne" />
                </span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              {primaryModules.map(({ labelKey, descKey }) => (
                <FeatureCard
                  key={labelKey}
                  className="relative col-span-1 overflow-hidden lg:col-span-1"
                  label={t(labelKey)}
                  description={t(descKey)}
                />
              ))}
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>

      <div className="container mx-auto">
        <ExtendedModulesSection />
      </div>

      <div className="container mx-auto">
        <ValuesSection />
      </div>

      <div className="container mx-auto">
        <HowItWorksSection />
      </div>

      <div className="container mx-auto">
        <BottomCtaSection />
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <CtaButton>
        <Link href="/auth/sign-up">
          <span className="flex items-center gap-1">
            <Trans i18nKey="common:getStarted" />
            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant="link">
        <Link href="/auth/sign-in">
          <Trans i18nKey="marketing:heroCtaSignIn" />
        </Link>
      </CtaButton>
    </div>
  );
}

function VisionSection() {
  return (
    <section className="bg-muted/30 flex flex-col gap-4 rounded-2xl border px-6 py-10 text-center md:px-12">
      <p className="text-primary text-sm font-medium tracking-wide uppercase">
        <Trans i18nKey="marketing:heroVisionLabel" />
      </p>
      <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed">
        <Trans i18nKey="marketing:heroVisionText" />
      </p>
    </section>
  );
}

function ExtendedModulesSection() {
  return (
    <section className="flex flex-col gap-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
        <h2 className="text-3xl font-normal tracking-tight xl:text-4xl">
          <Trans i18nKey="marketing:heroExtendedModulesTitle" />
        </h2>
        <p className="text-muted-foreground text-lg">
          <Trans i18nKey="marketing:heroExtendedModulesSubtitle" />
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {extendedModules.map(({ icon: Icon, labelKey, descKey }) => (
          <div
            key={labelKey}
            className="bg-card flex flex-col gap-3 rounded-xl border p-5"
          >
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Icon className="size-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium">
                <Trans i18nKey={labelKey} />
              </h3>
              <p className="text-muted-foreground text-sm">
                <Trans i18nKey={descKey} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="flex flex-col gap-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
        <h2 className="text-3xl font-normal tracking-tight xl:text-4xl">
          <Trans i18nKey="marketing:heroValuesTitle" />
        </h2>
        <p className="text-muted-foreground text-lg">
          <Trans i18nKey="marketing:heroValuesSubtitle" />
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {valueItems.map((key) => (
          <li
            key={key}
            className="bg-card flex items-start gap-3 rounded-xl border p-5"
          >
            <Check className="text-primary mt-0.5 size-5 shrink-0" />
            <span className="text-sm leading-relaxed">
              <Trans i18nKey={key} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="flex flex-col gap-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
        <h2 className="text-3xl font-normal tracking-tight xl:text-4xl">
          <Trans i18nKey="marketing:heroHowItWorks" />
        </h2>
        <p className="text-muted-foreground text-lg">
          <Trans i18nKey="marketing:heroHowItWorksSubtitle" />
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, titleKey, descKey }, index) => (
          <div
            key={titleKey}
            className="bg-card flex flex-col gap-4 rounded-xl border p-6"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-semibold">
                {index + 1}
              </span>
              <Icon className="text-muted-foreground size-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">
                <Trans i18nKey={titleKey} />
              </h3>
              <p className="text-muted-foreground text-sm">
                <Trans i18nKey={descKey} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BottomCtaSection() {
  return (
    <section className="bg-muted/30 flex flex-col items-center gap-6 rounded-2xl border px-6 py-12 text-center md:px-12">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          <Trans i18nKey="marketing:heroBottomCtaTitle" />
        </h2>
        <p className="text-muted-foreground max-w-xl text-base">
          <Trans i18nKey="marketing:heroBottomCtaSubtitle" />
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <CtaButton>
          <Link href="/auth/sign-up">
            <span className="flex items-center gap-1">
              <Trans i18nKey="common:getStarted" />
              <ArrowRightIcon className="h-4" />
            </span>
          </Link>
        </CtaButton>

        <CtaButton variant="outline">
          <Link href="/faq">
            <Trans i18nKey="marketing:faq" />
          </Link>
        </CtaButton>
      </div>
    </section>
  );
}
