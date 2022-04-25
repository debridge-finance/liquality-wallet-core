import { ChainId } from '@liquality/cryptoassets';
import BN from 'bignumber.js';
import { setupWallet } from '../../index';
import defaultWalletOptions from '../../walletOptions/defaultOptions';
import { FeeLabel, Network } from '../types';

describe.skip('send transaction tests', () => {
  const wallet = setupWallet(defaultWalletOptions);

  beforeEach(async () => {
    await wallet.dispatch.createWallet({
      key: '0x1234567890123456789012345678901234567890',
      mnemonic: 'camera horse oblige vivid drum wrap thought extend trigger fat oven rent',
      imported: true,
    });
    await wallet.dispatch.unlockWallet({
      key: '0x1234567890123456789012345678901234567890',
    });

    await wallet.dispatch.setWatsNewModalShowed({
      version: '1.0.0',
    });
    await wallet.dispatch.initializeAnalyticsPreferences({
      accepted: true,
    });
  });

  it('should be able to do send transaction using testnet', async () => {
    // change network to testnet
    await wallet.dispatch.changeActiveNetwork({
      network: Network.Testnet,
    });
    expect(wallet.state.wallets.length).toBe(1);
    expect(wallet.state.wallets[0].imported).toBe(true);
    expect(wallet.state.unlockedAt).not.toBe(0);
    expect(wallet.state.analytics.userId).not.toBe(null);
    expect(wallet.state.analytics.acceptedDate).not.toBe(0);
    expect(wallet.state.analytics.askedDate).not.toBe(0);
    expect(wallet.state.analytics.askedTimes).toBe(0);
    expect(wallet.state.analytics.notAskAgain).toBe(false);
    expect(wallet.state.activeNetwork).toBe('testnet');

    const walletId = wallet.state.activeWalletId;
    const testnetEnabledAssets = wallet?.state?.enabledAssets?.testnet?.[walletId];
    expect(testnetEnabledAssets?.length).not.toBe(0);

    // initialize addresses for all assets
    await wallet.dispatch.initializeAddresses({
      network: Network.Testnet,
      walletId: walletId,
    });

    // update balance this will generate addresses for each asset
    await wallet.dispatch.updateBalances({
      network: Network.Testnet,
      walletId: walletId,
      assets: testnetEnabledAssets!,
    });

    const account = wallet.state.accounts?.[walletId]?.testnet?.[1];
    expect(account?.chain).toBe(ChainId.Ethereum);
    const ethAccountId = account?.id;
    const ethereumAddress = account?.addresses[0];
    expect(ethereumAddress).not.toBeNull();
    expect(testnetEnabledAssets?.length).toBeGreaterThan(10);

    // update fiat rates for all assets
    await wallet.dispatch.updateFiatRates({
      assets: testnetEnabledAssets!,
    });

    // update asset fee for all assets
    for (const testnetAsset of testnetEnabledAssets!) {
      await wallet.dispatch.updateFees({
        asset: testnetAsset!,
      });
    }
    const maintainElement = wallet.state.fees.testnet?.[walletId];
    // ETH fee object checks
    expect(maintainElement?.ETH).toHaveProperty('fast');
    const ethFeeObject = maintainElement?.ETH.fast;

    await wallet.dispatch.sendTransaction({
      network: Network.Testnet,
      walletId: wallet.state.activeWalletId,
      accountId: ethAccountId!,
      asset: 'ETH',
      to: '0x3f429e2212718A717Bd7f9E83CA47DAb7956447B',
      amount: new BN(1),
      data: '',
      // @ts-ignore
      fee: ethFeeObject.fee.maxPriorityFeePerGas + ethFeeObject.fee.suggestedBaseFeePerGas,
      gas: 0,
      feeLabel: FeeLabel.Fast,
      fiatRate: 0,
    });
    console.log(JSON.stringify(wallet.state));
  });
  test.skip('should be able to do send transaction using mainnet', async () => {
    expect(wallet.state.wallets.length).toBe(1);
    expect(wallet.state.wallets[0].imported).toBe(true);
    expect(wallet.state.unlockedAt).not.toBe(0);
    expect(wallet.state.analytics.userId).not.toBe(null);
    expect(wallet.state.analytics.acceptedDate).not.toBe(0);
    expect(wallet.state.analytics.askedDate).not.toBe(0);
    expect(wallet.state.analytics.askedTimes).toBe(0);
    expect(wallet.state.analytics.notAskAgain).toBe(false);

    const walletId = wallet.state.activeWalletId;
    const mainnetEnabledAssets = wallet?.state?.enabledAssets?.mainnet?.[walletId];
    const testnetEnabledAssets = wallet?.state?.enabledAssets?.testnet?.[walletId];
    expect(mainnetEnabledAssets?.length).not.toBe(0);
    expect(testnetEnabledAssets?.length).not.toBe(0);

    // initialize addresses for all assets
    await wallet.dispatch.initializeAddresses({
      network: Network.Mainnet,
      walletId: walletId,
    });
    // update balance this will generate addresses for each asset
    await wallet.dispatch.updateBalances({
      network: Network.Mainnet,
      walletId: walletId,
      assets: mainnetEnabledAssets!,
    });

    const account = wallet.state.accounts?.[walletId]?.mainnet?.[1];
    expect(account?.chain).toBe(ChainId.Ethereum);
    const ethAccountId = account?.id;
    const ethereumAddress = account?.addresses[0];
    expect(ethereumAddress).not.toBeNull();
    expect(mainnetEnabledAssets?.length).toBeGreaterThan(10);

    // update fiat rates for all assets
    await wallet.dispatch.updateFiatRates({
      assets: mainnetEnabledAssets!,
    });
    // update asset fee for all assets
    for (const mainnnetAsset of mainnetEnabledAssets!) {
      await wallet.dispatch.updateFees({
        asset: mainnnetAsset,
      });
    }

    const maintainElement = wallet.state.fees.mainnet?.[walletId];
    // ETH fee object checks
    expect(maintainElement?.ETH).toHaveProperty('fast');
    const ethFeeObject = maintainElement?.ETH.fast;

    await wallet.dispatch.sendTransaction({
      network: Network.Mainnet,
      walletId: wallet.state.activeWalletId,
      accountId: ethAccountId!,
      asset: 'ETH',
      to: '0x1234567890123456789012345678901234567890',
      amount: new BN(10000),
      data: '',
      // @ts-ignore
      fee: ethFeeObject.fee.maxPriorityFeePerGas + ethFeeObject.fee.suggestedBaseFeePerGas,
      gas: 0,
      feeLabel: FeeLabel.Fast,
      fiatRate: 10,
    });
  });
});
