import { WebElement, WebElementFactory as Factory } from './../webElement';
import { StatsComponent } from './statsComponent';

export class StakingInfoComponent extends WebElement {
  private CONTAINER = '//div[@data-testid="staking-info-container"]';
  private TITLE = '//div[@data-testid="staking-info-title"]';
  private POOL_LOGO = '//img[@data-testid="stake-pool-logo"]';
  private POOL_NAME = '//div[@data-testid="stake-pool-name"]';
  private POOL_TICKER = '//div[@data-testid="stake-pool-ticker"]';
  private STATS_APY_CONTAINER = '//div[@data-testid="stats-apy-container"]';
  private STATS_FEE_CONTAINER = '//div[@data-testid="stats-fee-container"]';
  private STATS_MARGIN_CONTAINER = '//div[@data-testid="stats-margin-container"]';
  private STATS_LAST_REWARD_CONTAINER = '//div[@data-testid="stats-last-reward-container"]';
  private STATS_TOTAL_STAKED_CONTAINER = '//div[@data-testid="stats-total-staked-container"]';
  private STATS_TOTAL_REWARDS_CONTAINER = '//div[@data-testid="stats-total-rewards-container"]';

  constructor() {
    super();
  }

  container(): WebElement {
    return Factory.fromSelector(`${this.CONTAINER}`, 'xpath');
  }

  title(): WebElement {
    return Factory.fromSelector(`${this.CONTAINER}${this.TITLE}`, 'xpath');
  }

  poolLogo(): WebElement {
    return Factory.fromSelector(`${this.CONTAINER}${this.POOL_LOGO}`, 'xpath');
  }

  poolName(): WebElement {
    return Factory.fromSelector(`${this.CONTAINER}${this.POOL_NAME}`, 'xpath');
  }

  poolTicker(): WebElement {
    return Factory.fromSelector(`${this.CONTAINER}${this.POOL_TICKER}`, 'xpath');
  }

  get statsApy(): StatsComponent {
    return new StatsComponent(this.STATS_APY_CONTAINER);
  }

  get statsFee(): StatsComponent {
    return new StatsComponent(this.STATS_FEE_CONTAINER);
  }

  get statsMargin(): StatsComponent {
    return new StatsComponent(this.STATS_MARGIN_CONTAINER);
  }

  get statsTotalStaked(): StatsComponent {
    return new StatsComponent(this.STATS_TOTAL_STAKED_CONTAINER);
  }

  get statsLastReward(): StatsComponent {
    return new StatsComponent(this.STATS_LAST_REWARD_CONTAINER);
  }

  get statsTotalRewards(): StatsComponent {
    return new StatsComponent(this.STATS_TOTAL_REWARDS_CONTAINER);
  }

  async hoverOverTotalStakedValue(): Promise<void> {
    await this.statsTotalStaked.value.scrollIntoView();
    await this.statsTotalStaked.value.moveTo();
  }

  async hoverOverTotalRewardsValue(): Promise<void> {
    await this.statsTotalRewards.value.scrollIntoView();
    await this.statsTotalRewards.value.moveTo();
  }

  async hoverOverLastRewardValue(): Promise<void> {
    await this.statsLastReward.value.scrollIntoView();
    await this.statsLastReward.value.moveTo();
  }
}
