import { PostHogAction } from '@lace/common';
import { SubNavigation } from '@lace/ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutsideHandles } from '../outside-handles-provider';
import { DelegationFlow, useDelegationPortfolioStore } from '../store';

export enum Page {
  overview = 'overview',
  browsePools = 'browsePools',
}

type NavigationProps = {
  children: (activePage: Page) => ReactNode;
};

const isValueAValidSubPage = (value: string): value is Page => Object.values<string>(Page).includes(value);

export const Navigation = ({ children }: NavigationProps) => {
  const { analytics } = useOutsideHandles();
  const { activePage, portfolioMutators } = useDelegationPortfolioStore((store) => ({
    activePage: [
      DelegationFlow.Overview,
      DelegationFlow.CurrentPoolDetails,
      DelegationFlow.PortfolioManagement,
    ].includes(store.activeDelegationFlow)
      ? Page.overview
      : Page.browsePools,
    portfolioMutators: store.mutators,
  }));
  const { t } = useTranslation();
  const onValueChange = (value: string) => {
    if (!isValueAValidSubPage(value)) return;
    analytics.sendEventToPostHog(
      value === Page.overview ? PostHogAction.StakingOverviewClick : PostHogAction.StakingBrowsePoolsClick
    );
    portfolioMutators.executeCommand({
      type: value === Page.overview ? 'GoToOverview' : 'GoToBrowsePools',
    });
  };

  return (
    <>
      <SubNavigation.Root
        aria-label={t('root.nav.title')}
        value={activePage}
        onValueChange={onValueChange}
        tabIndex={-1}
        style={{ display: 'flex', gap: '20px' }}
      >
        <SubNavigation.Item
          name={t('root.nav.overviewTitle')}
          value={Page.overview}
          data-testid="overview-tab"
          tabIndex={0}
          highlightWidth="half"
        />
        <SubNavigation.Item
          name={t('root.nav.browsePoolsTitle')}
          value={Page.browsePools}
          data-testid="browse-tab"
          tabIndex={0}
          highlightWidth="half"
        />
      </SubNavigation.Root>
      {children(activePage)}
    </>
  );
};
