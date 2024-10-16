/* eslint-disable unicorn/consistent-destructuring */
import { Wallet } from '@lace/cardano';
import { PostHogAction } from '@lace/common';
import { Box, ControlButton, Flex, PIE_CHART_DEFAULT_COLOR_SET, PieChartColor, Text } from '@lace/ui';
import { useTranslation } from 'react-i18next';
import { DelegationCard, DelegationStatus } from '../../DelegationCard';
import { useOutsideHandles } from '../../outside-handles-provider';
import {
  DelegationFlow,
  DelegationPortfolioStore,
  MAX_POOLS_COUNT,
  PERCENTAGE_SCALE_MAX,
  sumPercentagesSanitized,
  useDelegationPortfolioStore,
} from '../../store';
import { PoolDetailsCard } from './PoolDetailsCard';
import * as styles from './StepPreferencesContent.css';

const getDraftDelegationStatus = ({ draftPortfolio }: DelegationPortfolioStore): DelegationStatus => {
  if (!draftPortfolio || draftPortfolio.length === 0) return 'no-selection';

  const percentageSum = sumPercentagesSanitized({ items: draftPortfolio || [], key: 'sliderIntegerPercentage' });
  if (percentageSum > PERCENTAGE_SCALE_MAX) return 'over-allocated';
  if (percentageSum < PERCENTAGE_SCALE_MAX) return 'under-allocated';

  if (draftPortfolio.length === 1) {
    return 'simple-delegation';
  }
  if (draftPortfolio.length > 1) {
    return 'multi-delegation';
  }

  throw new Error('Unexpected delegation status');
};

export const StepPreferencesContent = () => {
  const { t } = useTranslation();
  const { analytics } = useOutsideHandles();
  const {
    balancesBalance,
    walletStoreWalletUICardanoCoin: { symbol },
    compactNumber,
  } = useOutsideHandles();
  const { draftPortfolio, activeDelegationFlow, portfolioMutators, delegationStatus, cardanoCoinSymbol } =
    useDelegationPortfolioStore((state) => ({
      activeDelegationFlow: state.activeDelegationFlow,
      cardanoCoinSymbol: state.cardanoCoinSymbol,
      delegationStatus: getDraftDelegationStatus(state),
      draftPortfolio: state.draftPortfolio || [],
      portfolioMutators: state.mutators,
    }));

  const displayData = draftPortfolio.map((draftPool, i) => {
    const {
      displayData: { name, apy, saturation },
      id,
      sliderIntegerPercentage,
    } = draftPool;

    return {
      apy: apy ? String(apy) : undefined,
      cardanoCoinSymbol,
      color: PIE_CHART_DEFAULT_COLOR_SET[i] as PieChartColor,
      id,
      name: name || '-',
      onChainPercentage: draftPool?.onChainPercentage,
      percentage: sliderIntegerPercentage,
      saturation: saturation ? String(saturation) : undefined,
      savedIntegerPercentage: draftPool?.savedIntegerPercentage || undefined,
      sliderIntegerPercentage,
      stakeValue: balancesBalance
        ? compactNumber(
            (sliderIntegerPercentage / PERCENTAGE_SCALE_MAX) * Number(balancesBalance.available.coinBalance)
          )
        : '-',
    };
  });
  const createRemovePoolFromPortfolio = (poolId: Wallet.Cardano.PoolIdHex) => () => {
    portfolioMutators.executeCommand({
      data: poolId,
      type: 'RemoveStakePool',
    });
  };
  const addPoolButtonDisabled = draftPortfolio.length === MAX_POOLS_COUNT;
  const onAddPoolButtonClick = () => {
    analytics.sendEventToPostHog(PostHogAction.StakingBrowsePoolsManageDelegationAddStakePoolClick);
    portfolioMutators.executeCommand({
      type: 'AddStakePools',
    });
  };

  return (
    <Flex flexDirection="column" gap="$32" alignItems="stretch">
      <Box className={styles.delegationCardWrapper}>
        <DelegationCard
          balance={compactNumber(balancesBalance?.available?.coinBalance || '0')}
          cardanoCoinSymbol={symbol}
          distribution={displayData}
          status={delegationStatus}
          showDistribution
        />
      </Box>
      <Flex justifyContent="space-between">
        <Text.Body.Large weight="$semibold" data-testid="manage-delegation-selected-pools-label">
          {t('drawer.preferences.selectedStakePools', { count: draftPortfolio.length })}
        </Text.Body.Large>
        <ControlButton.Small
          label={t('drawer.preferences.addPoolButton')}
          onClick={onAddPoolButtonClick}
          disabled={addPoolButtonDisabled}
          data-testid="manage-delegation-add-pools-btn"
        />
      </Flex>
      <Flex flexDirection="column" gap="$16" pb="$32" alignItems="stretch" data-testid="selected-pools-container">
        {displayData.map(
          (
            { color, id, name, stakeValue, onChainPercentage, savedIntegerPercentage, sliderIntegerPercentage },
            idx
          ) => (
            <PoolDetailsCard
              key={id}
              color={color}
              name={name}
              onRemove={draftPortfolio.length > 1 ? createRemovePoolFromPortfolio(id) : undefined}
              actualPercentage={onChainPercentage}
              savedPercentage={savedIntegerPercentage}
              targetPercentage={sliderIntegerPercentage}
              stakeValue={stakeValue}
              cardanoCoinSymbol={cardanoCoinSymbol}
              defaultExpand={activeDelegationFlow === DelegationFlow.PortfolioManagement ? idx === 0 : true}
              onPercentageChange={(value) => {
                portfolioMutators.executeCommand({
                  data: { id, newSliderPercentage: value },
                  type: 'UpdateStakePercentage',
                });
              }}
            />
          )
        )}
      </Flex>
    </Flex>
  );
};
