import { Injectable } from "@nestjs/common";
import { BigNumber, Contract, Wallet, ethers } from "ethers";
import governorContractJson from "@/protocol/abis/sepolia/GovernorContract.json";
import boxContractJson from "@/protocol/abis/sepolia/Box.json";
import timeLockContractJson from "@/protocol/abis/sepolia/TimeLock.json";
import { Bunyan, InjectLogger } from "nestjs-bunyan";
import { CustomConfigService } from "../config/configuration.service";

export const governorContractData = governorContractJson;
export const boxContractData = boxContractJson;

@Injectable()
export class ConnectorService {
  provider: ethers.providers.BaseProvider;
  governorContract: Contract;
  boxContract: Contract;
  timeLockContract: Contract;
  wallet: Wallet;

  constructor(
    @InjectLogger() private logger: Bunyan,
    private readonly configService: CustomConfigService,
  ) {
    const currentNetworkName = this.configService.get("NETWORK").toLocaleLowerCase();
    const deployerAccountPrivateKey = this.configService.get("DEPLOYER_ACCOUNT_PRIVATE_KEY");
    const supportedNetworks = this.configService.get("SUPPORTED_NETWORKS");

    const network = supportedNetworks[currentNetworkName];
    const url = network.providerUrl;

    this.logger.info("Connecting Json RPC Provider...");
    this.logger.info({ network });

    const provider = new ethers.providers.JsonRpcProvider(url, {
      chainId: network.chainId,
      name: currentNetworkName,
    });

    this.logger.info(
      `Provider Connected - Network: ${provider.network.name} - Chain ID: ${provider.network.chainId}`,
    );
    this.provider = provider;
    this.wallet = new ethers.Wallet(deployerAccountPrivateKey, this.provider);

    this.governorContract = new ethers.Contract(
      governorContractJson.address,
      governorContractJson.abi,
      this.provider,
    );

    this.boxContract = new ethers.Contract(
      boxContractJson.address,
      boxContractJson.abi,
      this.provider,
    );

    this.timeLockContract = new ethers.Contract(
      timeLockContractJson.address,
      timeLockContractJson.abi,
      this.provider,
    );
  }

  async getCurrentNetwork() {
    const gasPrice = await this.provider.getGasPrice();
    const currentBlock = await this.provider.getBlockNumber();
    const { chainId, name } = this.provider.network;
    return { chainId, name, gasPrice: BigNumber.from(gasPrice).toString(), currentBlock };
  }
}
